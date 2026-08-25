import librosa
import numpy as np
import subprocess
import os
from typing import Dict, Any

class AudioAnalyzer:
    def __init__(self):
        pass

    def extract_audio(self, video_path: str, output_path: str = "temp_audio.wav") -> bool:
        """Extract audio from video using FFmpeg."""
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-vn",
            "-acodec", "pcm_s16le",
            "-ar", "44100",
            "-ac", "2",
            output_path,
            "-y"
        ]
        try:
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            return os.path.exists(output_path)
        except subprocess.CalledProcessError:
            return False

    def analyze_audio(self, audio_path: str) -> Dict[str, Any]:
        """
        Analyzes audio for splicing, silence padding, and clipping.
        """
        if not os.path.exists(audio_path):
             return {"audio_score": 100, "error": "Audio file not found"}

        try:
            y, sr = librosa.load(audio_path, sr=None)
            
            # Detect silence padding
            intervals = librosa.effects.split(y, top_db=60)
            # If there are many splits, it might be spliced heavily
            split_count = len(intervals)
            
            # Detect clipping (values hitting max amplitude)
            clipping_ratio = np.sum(np.abs(y) > 0.99) / len(y)
            
            # Score calculation
            score = 100
            
            # Penalize heavily if clipping is present (often happens in poorly generated audio)
            if clipping_ratio > 0.05:
                score -= 30
            elif clipping_ratio > 0.01:
                score -= 10
                
            # Unnatural number of silence splits (splicing)
            duration_sec = len(y) / sr
            splits_per_sec = split_count / duration_sec if duration_sec > 0 else 0
            
            if splits_per_sec > 4:
                score -= 20
                
            return {
                "audio_score": max(0, score),
                "clipping_ratio": float(clipping_ratio),
                "silence_splits": split_count
            }
        except Exception as e:
            return {"audio_score": 100, "error": str(e)}

    def analyze(self, video_path: str) -> Dict[str, Any]:
        audio_path = "temp_audio.wav"
        success = self.extract_audio(video_path, audio_path)
        if not success:
             return {"audio_score": 100, "message": "No audio stream found or extraction failed"}
             
        results = self.analyze_audio(audio_path)
        
        if os.path.exists(audio_path):
             os.remove(audio_path)
             
        return results
