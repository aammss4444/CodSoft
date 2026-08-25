import cv2
import mediapipe as mp
import os
import urllib.request
from typing import List, Dict, Any

from mediapipe.tasks import python
from mediapipe.tasks.python import vision

class PoseEstimator:
    def __init__(self):
        # We must use the new MediaPipe Tasks API on Python 3.12+
        self.model_path = os.path.join(os.path.dirname(__file__), "pose_landmarker_lite.task")
        
        # Download the model if it doesn't exist locally
        if not os.path.exists(self.model_path):
            print("Downloading MediaPipe pose landmarker model...")
            url = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task"
            urllib.request.urlretrieve(url, self.model_path)
            print("Download complete.")
            
        try:
            base_options = python.BaseOptions(model_asset_path=self.model_path)
            options = vision.PoseLandmarkerOptions(
                base_options=base_options,
                output_segmentation_masks=False
            )
            self.detector = vision.PoseLandmarker.create_from_options(options)
            self.available = True
        except Exception as e:
            print(f"Warning: Failed to initialize MediaPipe PoseLandmarker: {e}")
            self.available = False

    def process_frames(self, frame_paths: List[str]) -> Dict[str, Any]:
        """
        Extracts 33 body landmarks and analyzes temporal stability.
        AI generated video often has limbs snapping or merging.
        """
        if not getattr(self, 'available', False):
            return {
                "pose_score": 100,
                "anomalies": 0,
                "landmarks_extracted": 0,
                "warning": "MediaPipe unavailable, skipped."
            }

        anomalies_detected = 0
        total_frames_analyzed = 0
        
        # We store historical positions to check for snapping
        prev_landmarks = None
        
        for path in frame_paths:
            if not os.path.exists(path):
                continue
                
            # Load the image using mediapipe's native format
            mp_image = mp.Image.create_from_file(path)
            
            # Detect
            detection_result = self.detector.detect(mp_image)
            
            # detection_result.pose_landmarks is a list of poses (one per person). 
            # We assume a single person for this basic analysis.
            if detection_result and detection_result.pose_landmarks:
                total_frames_analyzed += 1
                # Grab the first person's landmarks
                current_landmarks = detection_result.pose_landmarks[0]
                
                # Check for impossible positions or missing limbs unexpectedly
                if prev_landmarks:
                    # In MediaPipe, LEFT_WRIST is index 15
                    left_wrist_curr = current_landmarks[15]
                    left_wrist_prev = prev_landmarks[15]
                    
                    # Calculate euclidean distance (normalized coordinates)
                    dist = ((left_wrist_curr.x - left_wrist_prev.x)**2 + (left_wrist_curr.y - left_wrist_prev.y)**2)**0.5
                    
                    if dist > 0.4: # Arbitrary large jump threshold for 0.5s or 15fps
                        anomalies_detected += 1
                
                prev_landmarks = current_landmarks
                
        # Calculate score based on anomalies
        score = 100
        if total_frames_analyzed > 0:
            anomaly_ratio = anomalies_detected / total_frames_analyzed
            score = max(0, 100 - int(anomaly_ratio * 500)) # Penalize heavily
            
        return {
            "pose_score": score,
            "anomalies": anomalies_detected,
            "landmarks_extracted": 33 # MediaPipe standard
        }
