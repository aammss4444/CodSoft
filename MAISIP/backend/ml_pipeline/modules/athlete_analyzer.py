import os
import base64
import json
from openai import AsyncOpenAI

class AthleteAnalyzer:
    def __init__(self):
        # We will initialize the async client
        # It automatically picks up OPENAI_API_KEY from environment variables
        self.api_key = os.environ.get("OPENAI_API_KEY", "")
        if self.api_key:
            self.client = AsyncOpenAI(api_key=self.api_key)
        else:
            self.client = None

    def _encode_image(self, image_path):
        with open(image_path, "rb") as image_file:
            return base64.b64encode(image_file.read()).decode('utf-8')

    async def analyze_athlete_video(self, frame_paths, sport):
        if not self.client:
            return {
                "error": "OpenAI API Key not set. Please set OPENAI_API_KEY in your .env file."
            }

        # Select a limited number of frames to save tokens, e.g., 5 evenly spaced frames
        num_frames = min(len(frame_paths), 5)
        step = max(1, len(frame_paths) // num_frames)
        selected_frames = frame_paths[::step][:num_frames]

        base64_frames = [self._encode_image(p) for p in selected_frames]

        sport_prompts = {
            "running": "Form posture, foot strike pattern, arm swing mechanics, stride length efficiency.",
            "skipping": "Rhythm and timing, foot clearance, wrist rotation, posture and balance.",
            "swimming": "Stroke mechanics, body alignment, kicking technique, breathing pattern.",
            "sprint": "Explosive start mechanics, acceleration phase posture, max velocity form, stride frequency."
        }

        # Default fallback
        metrics_prompt = sport_prompts.get(sport.lower(), "Overall athletic form, posture, agility, and balance.")

        system_prompt = (
            f"You are a professional sports biomechanics analyst. Analyze the provided video frames for the sport: {sport.upper()}.\n"
            f"Evaluate the athlete based on the following specific metrics: {metrics_prompt}\n"
            "Respond ONLY with a valid JSON object matching this schema:\n"
            "{\n"
            "  \"athlete_index\": <number 0-100>,\n"
            "  \"metrics\": { \"<metric_name>\": <number 0-100>, ... },\n"
            "  \"feedback\": \"<Detailed coaching feedback and areas of improvement>\"\n"
            "}"
        )

        content_messages = [{"type": "text", "text": system_prompt}]
        for b64_frame in base64_frames:
            content_messages.append({
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{b64_frame}",
                    "detail": "low"
                }
            })

        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o",
                messages=[
                    {
                        "role": "user",
                        "content": content_messages
                    }
                ],
                max_tokens=600,
                response_format={ "type": "json_object" }
            )

            result_text = response.choices[0].message.content
            result_json = json.loads(result_text)
            return result_json

        except Exception as e:
            print(f"OpenAI API Error: {e}")
            return {
                "error": str(e)
            }
