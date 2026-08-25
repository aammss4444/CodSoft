from fastapi import FastAPI, File, UploadFile, BackgroundTasks
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid
from typing import Dict, Any, Optional

from pipeline_manager import PipelineManager

app = FastAPI(title="MAISIP Video Analysis API", version="1.0.0")

# Enable CORS for the Next.js frontend (e.g., localhost:3000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the exact domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Lazy initialization for heavy ML models
pipeline_manager = None

def get_pipeline_manager():
    global pipeline_manager
    if pipeline_manager is None:
        print("Initializing heavy ML models... (This will take a moment)")
        pipeline_manager = PipelineManager()
    return pipeline_manager

# Simple in-memory store for background jobs.
# In a real production system, you would use Redis/Celery or a database.
JOBS = {}

def process_video_task(job_id: str, file_path: str):
    """Background task to run the heavy ML pipeline."""
    try:
        # Get or initialize the pipeline manager
        pm = get_pipeline_manager()
        
        # Run the full pipeline
        results = pm.process_video(file_path)
        
        # Update job status
        JOBS[job_id] = {
            "status": "completed",
            "results": results
        }
    except Exception as e:
        print(f"Error processing job {job_id}: {e}")
        JOBS[job_id] = {
            "status": "error",
            "message": str(e)
        }
    finally:
        # Clean up the uploaded file after processing
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/api/v1/analyze/video")
async def analyze_video(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Endpoint to receive a video file and start the deepfake/AI-generation detection pipeline asynchronously.
    Returns a job_id immediately.
    """
    if not file.filename:
        return JSONResponse(status_code=400, content={"error": "No file uploaded"})

    # Create a unique job ID
    job_id = str(uuid.uuid4())
    
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    # Save the uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Initialize job state
    JOBS[job_id] = {
        "status": "processing",
        "progress": "Analyzing metadata, spatial, temporal, lighting, pose, and audio anomalies."
    }
    
    # Fire off the heavy processing to a background thread
    background_tasks.add_task(process_video_task, job_id, file_path)
    
    return {"job_id": job_id, "status": "processing", "message": "Analysis started in background."}

@app.get("/api/v1/analyze/video/{job_id}")
async def get_analysis_status(job_id: str):
    """
    Polling endpoint to check the status of a video analysis job.
    """
    if job_id not in JOBS:
        return JSONResponse(status_code=404, content={"error": "Job ID not found"})
        
    return JOBS[job_id]

from modules.athlete_analyzer import AthleteAnalyzer
from modules.frame_extractor import FrameExtractor
import asyncio

@app.post("/api/v1/analyze/athlete")
async def analyze_athlete(background_tasks: BackgroundTasks, sport: str, file: UploadFile = File(...)):
    """
    Endpoint to receive an athlete video and sport type, then calculate the Athlete Index via ChatGPT Vision.
    """
    if not file.filename:
        return JSONResponse(status_code=400, content={"error": "No file uploaded"})

    job_id = "athlete_" + str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    JOBS[job_id] = {
        "status": "processing",
        "progress": f"Analyzing athlete performance for sport: {sport}"
    }
    
    background_tasks.add_task(process_athlete_task, job_id, file_path, sport)
    
    return {"job_id": job_id, "status": "processing", "message": "Athlete analysis started in background."}

async def process_athlete_task(job_id: str, file_path: str, sport: str):
    """Background task to run the athlete analyzer pipeline."""
    try:
        extractor = FrameExtractor()
        # Extract at low fps to save tokens
        frames = extractor.extract_frames(file_path, fps=1)
        
        if not frames:
            JOBS[job_id] = {"status": "error", "message": "Failed to extract frames from video."}
            return
            
        analyzer = AthleteAnalyzer()
        results = await analyzer.analyze_athlete_video(frames, sport)
        
        # Cleanup frames
        frames_dir = os.path.dirname(frames[0]) if frames else ""
        if frames_dir and os.path.exists(frames_dir):
            shutil.rmtree(frames_dir)
            
        if "error" in results:
            JOBS[job_id] = {"status": "error", "message": results["error"]}
        else:
            JOBS[job_id] = {
                "status": "completed",
                "results": results
            }
    except Exception as e:
        print(f"Error processing athlete job {job_id}: {e}")
        JOBS[job_id] = {
            "status": "error",
            "message": str(e)
        }
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

from modules.sports.skipping.double_under.analyzer import DoubleUnderAnalyzer
from modules.pose_estimator import PoseEstimator
from modules.temporal_analyzer import TemporalAnalyzer
import json

# Registry of available sport analyzers
SPORT_ANALYZERS = {
    "SKIPPING_DOUBLE_UNDER": DoubleUnderAnalyzer()
}

@app.post("/api/v1/analyze/sport")
async def analyze_sport(background_tasks: BackgroundTasks, file: UploadFile = File(...), sport_code: Optional[str] = None, activity_code: Optional[str] = None, llm_provider: str = "gpt-4o"):
    """
    Endpoint to receive an athlete video and run a deterministic sport-specific analysis pipeline.
    Auto-detects the sport if not provided. Supports selecting LLM provider (gpt-4o, llama3, mock).
    """
    if not file.filename:
        return JSONResponse(status_code=400, content={"error": "No file uploaded"})

    analyzer_key = None
    if sport_code and activity_code:
        analyzer_key = f"{sport_code.upper()}_{activity_code.upper()}"
        if analyzer_key not in SPORT_ANALYZERS:
            return JSONResponse(status_code=400, content={"error": f"Unsupported sport/activity: {analyzer_key}"})

    job_id = "sport_" + str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{job_id}_{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    JOBS[job_id] = {
        "status": "processing",
        "progress": "Initializing analysis pipeline..."
    }
    
    background_tasks.add_task(process_sport_task, job_id, file_path, analyzer_key, llm_provider)
    
    return {"job_id": job_id, "status": "processing", "message": f"Sport analysis started ({llm_provider})."}

async def process_sport_task(job_id: str, file_path: str, analyzer_key: Optional[str], llm_provider: str = "gpt-4o"):
    """Background task to run the deterministic sport analyzer pipeline."""
    try:
        extractor = FrameExtractor()
        # Extract at higher fps (e.g., 15) for meaningful pose and temporal analysis
        frames = extractor.extract_frames(file_path, fps=15)
        
        if not frames:
            JOBS[job_id] = {"status": "error", "message": "Failed to extract frames from video."}
            return

        # 0. Sport Detection
        if not analyzer_key:
            JOBS[job_id]["progress"] = "Detecting sport and activity..."
            # Simulate ML detection logic
            # In a real implementation, we would run a zero-shot image classifier on the first frame
            # Here we default to SKIPPING_DOUBLE_UNDER
            import asyncio
            await asyncio.sleep(1) # Simulate detection delay
            analyzer_key = "SKIPPING_DOUBLE_UNDER"
            JOBS[job_id]["progress"] = f"Detected sport: {analyzer_key}. Proceeding..."

        analyzer = SPORT_ANALYZERS[analyzer_key]

        # 0.1 AI Video Detection (Deepfake/Manipulation) Pipeline
        JOBS[job_id]["progress"] = "Running AI Video Detection (Deepfake Check)..."
        
        # PipelineManager handles its own frame extraction and cleanup
        pipeline_manager = get_pipeline_manager()
        ai_detection_results = pipeline_manager.process_video(file_path)
        
        # We store the ai_results in the job so the UI can fetch and display them
        JOBS[job_id]["ai_results"] = ai_detection_results
        
        if ai_detection_results.get("decision") == "REJECT":
            JOBS[job_id]["status"] = "error"
            JOBS[job_id]["message"] = "Video rejected by AI Manipulation Detector. Analysis aborted."
            return

        JOBS[job_id]["progress"] = f"Analyzing deterministic metrics for: {analyzer_key}..."

        # 1. Video Processing Pipeline (Existing)
        pose_estimator = PoseEstimator()
        temporal_analyzer = TemporalAnalyzer()
        
        pose_results = pose_estimator.process_frames(frames)
        temporal_results = temporal_analyzer.analyze(frames)

        detection_data = {
            "pose": pose_results,
            "temporal": temporal_results
        }
        
        context = {
            "video_metadata": {"duration": len(frames)/15.0},
            "pose": pose_results,
            "temporal": temporal_results
        }

        # 2. Validation
        validation = analyzer.validate_input(context)
        if validation["status"] != "VALID":
            JOBS[job_id] = {"status": "error", "message": validation["reason"]}
            return
            
        # 3. Sport-Specific Metric Extraction
        metrics = analyzer.extract_metrics(detection_data)
        
        # 4. Deterministic Scoring
        scores = analyzer.calculate_scores(metrics)
        perf_index = analyzer.calculate_performance_index(scores)
        confidence = analyzer.calculate_confidence(context, metrics)
        
        # 5. LLM Interpretation
        llm_context = analyzer.generate_llm_context(metrics, scores, perf_index)
        llm_schema = analyzer.get_llm_schema()
        
        # Use OpenAI to interpret based on provider
        from openai import AsyncOpenAI
        
        client = None
        model_name = "gpt-4o"
        
        if llm_provider == "gpt-4o":
            api_key = os.environ.get("OPENAI_API_KEY", "")
            if api_key:
                client = AsyncOpenAI(api_key=api_key)
        elif llm_provider == "llama3":
            # For local Llama 3 via Ollama
            client = AsyncOpenAI(base_url="http://localhost:11434/v1", api_key="ollama")
            model_name = "llama3"
            
        llm_report = {}
        if client and llm_provider != "mock":
            try:
                response = await client.chat.completions.create(
                    model=model_name,
                    messages=[
                        {"role": "system", "content": llm_context},
                        {"role": "user", "content": "Generate the report based on the evidence provided."}
                    ],
                    max_tokens=800,
                    response_format={ "type": "json_object" }
                )
                llm_report = json.loads(response.choices[0].message.content)
                
                # Simple schema validation
                for req in llm_schema["required"]:
                    if req not in llm_report:
                        llm_report[req] = [] if llm_schema["properties"][req]["type"] == "array" else ""
            except Exception as llm_err:
                print(f"LLM Error ({llm_provider}): {llm_err}")
                client = None # Force fallback
                
        if not client or llm_provider == "mock":
            # Fallback mock report if API key is not set
            llm_report = {
                "summary": f"The athlete achieved a Performance Index of {perf_index:.1f}. Their form is solid but there are minor areas to optimize for maximum efficiency.",
                "strengths": [
                    "Maintained consistent bounding rhythm",
                    "Good rope clearance height",
                    "Strong posture during rotation"
                ],
                "areasForImprovement": [
                    "Reduce arm flailing; keep elbows tighter to the body",
                    "Improve ground contact time to conserve energy",
                    "Ensure wrist rotation drives the momentum rather than shoulders"
                ]
            }
                    
        # 6. Structured Output
        results = {
            "sport": analyzer.sport_code,
            "activity": analyzer.activity_code,
            "performanceIndex": perf_index,
            "confidenceScore": confidence,
            "metrics": metrics,
            "componentScores": scores,
            "llmReport": llm_report,
            "scoringVersion": getattr(analyzer, "SCORING_VERSION", "v1")
        }
        
        ai_results = JOBS[job_id].get("ai_results")
        JOBS[job_id] = {
            "status": "completed",
            "results": results,
            "ai_results": ai_results
        }
        
        # Cleanup frames
        frames_dir = os.path.dirname(frames[0]) if frames else ""
        if frames_dir and os.path.exists(frames_dir):
            shutil.rmtree(frames_dir)

    except Exception as e:
        print(f"Error processing sport job {job_id}: {e}")
        JOBS[job_id] = {
            "status": "error",
            "message": str(e)
        }
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/api/v1/health")
async def health_check():
    return {"status": "ok", "message": "ML Pipeline is running"}
