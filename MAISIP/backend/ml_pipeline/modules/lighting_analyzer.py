import cv2
import numpy as np
from typing import List

class LightingAnalyzer:
    def __init__(self):
        pass

    def analyze(self, frame_paths: List[str]) -> int:
        """
        Analyzes lighting consistency across frames.
        Returns a score from 0-100, where 100 is perfectly consistent (natural)
        and lower scores indicate artificial flickering or impossible shadows.
        """
        if len(frame_paths) < 2:
            return 100 # Not enough frames to compare
            
        brightness_values = []
        
        for path in frame_paths:
            img = cv2.imread(path)
            if img is None:
                continue
                
            # Convert to HSV and extract the Value (brightness) channel
            hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
            v_channel = hsv[:, :, 2]
            
            # Get mean brightness of the frame
            mean_brightness = np.mean(v_channel)
            brightness_values.append(mean_brightness)
            
        if not brightness_values:
            return 100
            
        # Calculate variance/std dev of brightness across the video
        # High variance over a short period (flickering) is a strong AI artifact indicator
        brightness_std = np.std(brightness_values)
        
        # Artificial heuristic: natural video has smooth transitions.
        # Let's calculate the frame-to-frame diffs
        diffs = np.diff(brightness_values)
        max_jump = np.max(np.abs(diffs)) if len(diffs) > 0 else 0
        
        score = 100
        
        # Penalize for extreme sudden jumps (flickering)
        if max_jump > 30: 
            score -= 40
        elif max_jump > 15:
            score -= 20
            
        # Penalize for generally high variance (unstable lighting)
        if brightness_std > 20:
            score -= 30
        elif brightness_std > 10:
            score -= 10
            
        return max(0, score)
