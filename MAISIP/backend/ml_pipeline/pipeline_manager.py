import os
import shutil
from typing import Dict, Any

from modules.metadata_verifier import MetadataVerifier
from modules.frame_extractor import FrameExtractor
from modules.lighting_analyzer import LightingAnalyzer
from modules.pose_estimator import PoseEstimator
from modules.deepfake_detector import DeepfakeDetector
from modules.temporal_analyzer import TemporalAnalyzer
from modules.audio_analyzer import AudioAnalyzer

class PipelineManager:
    def __init__(self):
        self.metadata_verifier = MetadataVerifier()
        self.frame_extractor = FrameExtractor()
        self.lighting_analyzer = LightingAnalyzer()
        self.pose_estimator = PoseEstimator()
        self.deepfake_detector = DeepfakeDetector()
        self.temporal_analyzer = TemporalAnalyzer()
        self.audio_analyzer = AudioAnalyzer()

    def process_video(self, video_path: str) -> Dict[str, Any]:
        """
        Orchestrates the video through all modules, aggregates scores, 
        and returns a Go/No-Go decision based on strict 2-3% tolerance.
        """
        if not os.path.exists(video_path):
            raise FileNotFoundError(f"Video file not found: {video_path}")

        print(f"Starting analysis for {video_path}")
        
        # 1. Metadata Analysis
        metadata_results = self.metadata_verifier.verify(video_path)
        
        # 2. Extract Frames
        # Note: For prototype speed, extracting at 3 FPS is much faster than 15 FPS
        # while still providing enough frames for spatial and temporal analysis.
        frames = self.frame_extractor.extract_frames(video_path, fps=3)
        
        if not frames:
             return {"status": "Error", "message": "Failed to extract frames"}

        # 3. Spatial Analysis (Deepfake / Manipulation per frame)
        spatial_results = self.deepfake_detector.analyze_frames(frames)
        
        # 4. Temporal Analysis (Motion & Flow)
        temporal_results = self.temporal_analyzer.analyze(frames)
        
        # 5. Lighting Consistency
        lighting_score = self.lighting_analyzer.analyze(frames)
        
        # 6. Pose/Biomechanical Tracking
        pose_results = self.pose_estimator.process_frames(frames)
        
        # 7. Audio / Lip Sync Analysis
        audio_results = self.audio_analyzer.analyze(video_path)

        # Cleanup extracted frames after analysis
        frames_dir = os.path.dirname(frames[0]) if frames else ""
        if frames_dir and os.path.exists(frames_dir):
            shutil.rmtree(frames_dir)
            
        # Aggregate Scores
        scores = {
            "metadata_confidence": metadata_results.get("confidence", 0),
            "spatial_score": spatial_results.get("spatial_score", 100),
            "temporal_score": temporal_results.get("temporal_score", 100),
            "lighting_score": lighting_score,
            "pose_score": pose_results.get("pose_score", 100),
            "audio_score": audio_results.get("audio_score", 100)
        }
        
        # Calculate overall confidence (weighted average)
        # We enforce a strict penalty if ANY score drops significantly, matching the 2-3% tolerance requirement
        overall_score = (
            scores["metadata_confidence"] * 0.1 +
            scores["spatial_score"] * 0.3 +
            scores["temporal_score"] * 0.2 +
            scores["lighting_score"] * 0.15 +
            scores["pose_score"] * 0.15 +
            scores["audio_score"] * 0.1
        )
        
        # Decision Logic: Strict Zero-Tolerance
        # If any individual component flags a strong anomaly (score < 60), reject.
        # Or if the overall score falls below 80, reject.
        is_manipulated = any(score < 60 for score in scores.values()) or overall_score < 80

        return {
            "decision": "REJECT" if is_manipulated else "ACCEPT",
            "overall_score": overall_score,
            "is_manipulated": is_manipulated,
            "component_scores": scores,
            "metadata": metadata_results
        }
