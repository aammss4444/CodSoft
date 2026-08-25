import torch
from transformers import VideoMAEImageProcessor, VideoMAEForVideoClassification
import numpy as np
import cv2
from typing import List, Dict, Any

class TemporalAnalyzer:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        try:
            self.processor = VideoMAEImageProcessor.from_pretrained("MCG-NJU/videomae-base")
            self.model = VideoMAEForVideoClassification.from_pretrained("MCG-NJU/videomae-base").to(self.device)
            self.model.eval()
            self.model_loaded = True
        except Exception as e:
            print(f"Failed to load VideoMAE model: {e}")
            self.model_loaded = False

    def _calculate_optical_flow_anomalies(self, frame_paths: List[str]) -> float:
        """
        Simple optical flow analysis using OpenCV (Farneback)
        Returns a score representing motion continuity/anomalies.
        """
        if len(frame_paths) < 2:
            return 100.0

        anomalies = 0
        prev_gray = cv2.imread(frame_paths[0], cv2.IMREAD_GRAYSCALE)
        if prev_gray is None:
            return 100.0

        for path in frame_paths[1:]:
            curr_gray = cv2.imread(path, cv2.IMREAD_GRAYSCALE)
            if curr_gray is None:
                continue
            
            flow = cv2.calcOpticalFlowFarneback(prev_gray, curr_gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            mag, _ = cv2.cartToPolar(flow[..., 0], flow[..., 1])
            mean_mag = np.mean(mag)

            # A sudden jump in mean magnitude of optical flow can indicate a glitch
            if mean_mag > 10.0:  # arbitrary threshold
                anomalies += 1
            
            prev_gray = curr_gray

        anomaly_rate = anomalies / (len(frame_paths) - 1)
        score = max(0.0, 100.0 - (anomaly_rate * 500))
        return score

    def analyze(self, frame_paths: List[str]) -> Dict[str, Any]:
        """
        Evaluates optical flow anomalies and motion continuity.
        """
        optical_flow_score = self._calculate_optical_flow_anomalies(frame_paths)
        
        # If we have VideoMAE loaded and enough frames (VideoMAE typically needs 16 frames)
        videomae_score = 100.0
        if self.model_loaded and len(frame_paths) >= 16:
             # Just process the first 16 frames as a batch for demonstration
             frames = []
             for path in frame_paths[:16]:
                 img = cv2.imread(path)
                 if img is not None:
                     img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                     frames.append(img)
             if len(frames) == 16:
                 try:
                     inputs = self.processor(list(frames), return_tensors="pt")
                     inputs = {k: v.to(self.device) for k, v in inputs.items()}
                     with torch.no_grad():
                         outputs = self.model(**inputs)
                         # Simple logic to convert logits to score
                         probs = torch.nn.functional.softmax(outputs.logits, dim=-1)
                         confidence = torch.max(probs).item()
                         videomae_score = confidence * 100
                 except Exception as e:
                     print(f"VideoMAE processing error: {e}")

        # Combine scores
        final_score = (optical_flow_score * 0.7) + (videomae_score * 0.3)

        return {
            "temporal_score": final_score,
            "optical_flow_score": optical_flow_score,
            "videomae_score": videomae_score
        }
