import torch
from transformers import pipeline
from PIL import Image
from typing import List, Dict, Any

class DeepfakeDetector:
    def __init__(self):
        self.device = 0 if torch.cuda.is_available() else -1
        # Load the fine-tuned ViT model for deepfake detection
        try:
            print("Loading deepfake image classification model...")
            self.model = pipeline('image-classification', model='dima806/deepfake_vs_real_image_detection', device=self.device)
            self.model_loaded = True
            print("Deepfake model loaded successfully!")
        except Exception as e:
            print(f"Failed to load Hugging Face deepfake model: {e}")
            self.model_loaded = False

    def analyze_frames(self, frame_paths: List[str]) -> Dict[str, Any]:
        """
        Analyzes the probability of spatial manipulation per frame.
        """
        if not frame_paths:
            return {"fake_probability": 0.0, "spatial_score": 100}

        if not self.model_loaded:
            print("Warning: Deepfake detector model not loaded. Returning default score.")
            return {"fake_probability": 0.0, "spatial_score": 100}

        fake_probs = []
        for path in frame_paths:
            try:
                img = Image.open(path).convert('RGB')
                
                # The pipeline expects a PIL Image
                results = self.model(img)
                # Results usually look like: [{'label': 'Fake', 'score': 0.9}, {'label': 'Real', 'score': 0.1}]
                
                fake_prob = 0.0
                for res in results:
                    # The labels for dima806/deepfake_vs_real_image_detection are 'fake' and 'real'
                    if 'fake' in res['label'].lower():
                        fake_prob = res['score']
                        break
                
                fake_probs.append(fake_prob)
            except Exception as e:
                print(f"Error processing frame {path}: {e}")
                continue

        if not fake_probs:
            return {"fake_probability": 0.0, "spatial_score": 100}

        avg_fake_prob = sum(fake_probs) / len(fake_probs)
        # Score is 0-100, where 100 is completely real
        spatial_score = max(0, 100 - int(avg_fake_prob * 100))

        return {
            "fake_probability": avg_fake_prob,
            "spatial_score": spatial_score
        }
