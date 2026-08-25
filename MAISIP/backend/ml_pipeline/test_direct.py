import os
import json
import sys
from pipeline_manager import PipelineManager

def test_pipeline_direct(video_path):
    if not os.path.exists(video_path):
        print(f"Error: Video file '{video_path}' not found.")
        return

    print(f"Starting direct pipeline test for: {video_path}")
    manager = PipelineManager()
    
    try:
        results = manager.process_video(video_path)
        print("\n--- Analysis Complete ---")
        print(json.dumps(results, indent=4))
    except Exception as e:
        print(f"Pipeline error: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_direct.py <video_path>")
    else:
        test_pipeline_direct(sys.argv[1])
