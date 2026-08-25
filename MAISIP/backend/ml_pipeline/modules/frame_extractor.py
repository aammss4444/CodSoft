import os
import subprocess
from typing import List, Optional

class FrameExtractor:
    def __init__(self, base_output_dir: str = "frames"):
        self.base_output_dir = base_output_dir
        os.makedirs(self.base_output_dir, exist_ok=True)

    def extract_frames(self, video_path: str, fps: Optional[float] = None, interval_sec: float = 0.5) -> List[str]:
        """
        Extracts frames from the video.
        If fps is provided, extracts at that framerate.
        Otherwise, extracts one frame every `interval_sec` seconds.
        """
        video_name = os.path.splitext(os.path.basename(video_path))[0]
        output_dir = os.path.join(self.base_output_dir, video_name)
        os.makedirs(output_dir, exist_ok=True)
        
        # Determine extraction rate
        if fps:
            rate_arg = f"fps={fps}"
        else:
            rate_arg = f"fps=1/{interval_sec}"
            
        output_pattern = os.path.join(output_dir, "frame_%04d.jpg")
        
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-vf", rate_arg,
            "-q:v", "2", # High quality JPEG
            output_pattern,
            "-y" # Overwrite
        ]
        
        try:
             # Run ffmpeg, suppress output for cleaner logs
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
            
            # Get list of extracted frames
            frames = sorted([
                os.path.join(output_dir, f) 
                for f in os.listdir(output_dir) 
                if f.endswith('.jpg')
            ])
            return frames
            
        except subprocess.CalledProcessError as e:
            print(f"Error extracting frames: {e}")
            return []
