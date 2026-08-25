import subprocess
import json
import os
from typing import Dict, Any

class MetadataVerifier:
    def __init__(self):
        # Weighting for the final score
        self.weights = {
            "has_camera_model": 20,
            "has_gps": 10,
            "known_software_signature": 30,
            "codec_consistency": 20,
            "creation_date_consistency": 20
        }

    def _run_ffprobe(self, video_path: str) -> Dict[str, Any]:
        """Extracts metadata using ffprobe."""
        try:
            cmd = [
                "ffprobe", "-v", "quiet", "-print_format", "json",
                "-show_format", "-show_streams", video_path
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return json.loads(result.stdout)
        except Exception as e:
            print(f"FFprobe error: {e}")
            return {}

    def _run_exiftool(self, video_path: str) -> Dict[str, Any]:
        """Extracts metadata using exiftool."""
        try:
            cmd = ["exiftool", "-json", video_path]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            data = json.loads(result.stdout)
            return data[0] if data else {}
        except Exception as e:
            print(f"ExifTool error: {e}")
            return {}

    def verify(self, video_path: str) -> Dict[str, Any]:
        """
        Analyzes the video metadata and returns extracted info and a confidence score.
        A lower confidence indicates a higher probability of being AI-generated or manipulated.
        """
        ffprobe_data = self._run_ffprobe(video_path)
        exif_data = self._run_exiftool(video_path)

        # Extract required fields
        streams = ffprobe_data.get("streams", [])
        video_stream = next((s for s in streams if s.get("codec_type") == "video"), {})
        
        format_data = ffprobe_data.get("format", {})
        tags = format_data.get("tags", {})
        
        # Aggregate metadata
        camera_model = exif_data.get("Model", tags.get("model", "Unknown"))
        device_manufacturer = exif_data.get("Make", tags.get("make", "Unknown"))
        codec = video_stream.get("codec_name", "Unknown")
        bitrate = format_data.get("bit_rate", "Unknown")
        resolution = f"{video_stream.get('width', 0)}x{video_stream.get('height', 0)}"
        
        # Calculate frame rate safely
        r_frame_rate = video_stream.get("r_frame_rate", "0/1")
        try:
            num, den = map(int, r_frame_rate.split('/'))
            frame_rate = num / den if den != 0 else 0
        except:
            frame_rate = 0
            
        duration = format_data.get("duration", "Unknown")
        gps = "Present" if "GPSCoordinates" in exif_data or "location" in tags else "Missing"
        creation_time = tags.get("creation_time", exif_data.get("CreateDate", "Unknown"))
        
        # Check editing software (Adobe, Final Cut, etc. are flags for manipulation, but not necessarily AI)
        # However, AI tools like Midjourney, Runway, Pika often leave specific encoder tags or strip metadata completely.
        software = exif_data.get("Software", tags.get("software", "Unknown"))
        encoder = tags.get("encoder", "Unknown")
        
        # Weighted Scoring Logic
        score = 0
        if camera_model != "Unknown": score += self.weights["has_camera_model"]
        if gps == "Present": score += self.weights["has_gps"]
        
        # Software Signature Logic
        # If it's a known AI software, deduct points.
        ai_signatures = ["runway", "pika", "sora"] 
        # Note: We removed 'ffmpeg' and 'lavf' from the strict penalty list 
        # because almost all social media downloaders use them to re-encode video.
        if not any(sig in software.lower() or sig in encoder.lower() for sig in ai_signatures):
             score += self.weights["known_software_signature"]
             
        # If it has standard camera metadata, it's more likely real
        if codec in ["h264", "hevc"]:
            score += self.weights["codec_consistency"]
            
        if creation_time != "Unknown":
            score += self.weights["creation_date_consistency"]

        return {
            "camera_model": camera_model,
            "device_manufacturer": device_manufacturer,
            "codec": codec,
            "bitrate": bitrate,
            "resolution": resolution,
            "frame_rate": frame_rate,
            "duration": duration,
            "gps": gps,
            "creation_date": creation_time,
            "editing_software": software,
            "encoding_library": encoder,
            "confidence": score
        }
