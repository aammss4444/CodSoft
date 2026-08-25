import requests
import sys
import os
import json

def test_pipeline(video_path):
    if not os.path.exists(video_path):
        print(f"Error: Video file '{video_path}' not found.")
        return

    url = "http://localhost:8000/api/v1/analyze/video"
    print(f"Uploading '{video_path}' to {url} ...")
    
    with open(video_path, 'rb') as f:
        files = {'file': (os.path.basename(video_path), f, 'video/mp4')}
        try:
            response = requests.post(url, files=files)
            if response.status_code == 200:
                print("Success! Analysis results:")
                print(json.dumps(response.json(), indent=4))
            else:
                print(f"Error {response.status_code}:")
                print(response.text)
        except requests.exceptions.ConnectionError:
            print("Connection Error: Is the Uvicorn server running on port 8000?")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_pipeline.py <path_to_video.mp4>")
    else:
        test_pipeline(sys.argv[1])
