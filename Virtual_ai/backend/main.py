import os
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from pydantic import BaseModel

load_dotenv()

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

HEYGEN_API_KEY = os.getenv("HEYGEN_API_KEY")

class SessionRequest(BaseModel):
    quality: str = "medium"
    avatar_name: str = "default"

@app.post("/session")
async def create_session():
    if not HEYGEN_API_KEY:
        raise HTTPException(status_code=500, detail="HEYGEN_API_KEY not configured")

    url = "https://api.heygen.com/v1/streaming.create_token"
    headers = {
        "X-Api-Key": HEYGEN_API_KEY
    }
    
    try:
        response = requests.post(url, headers=headers)
        if not response.ok:
            print(f"Error connecting to HeyGen: {response.status_code}")
            print(f"Response: {response.text}")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Request failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
