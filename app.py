"""
Unified Disaster Detection API
Routes requests to the correct ML model based on input type.
"""
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from typing import Optional
import mimetypes
import os

from services import image_service, clip_service, text_service, video_service

# ------------------------------------------------------------------ #
#  CORS — allowed origins
# ------------------------------------------------------------------ #
ALLOWED_ORIGINS = [
    "http://localhost:5173",       # Vite dev server
    "http://127.0.0.1:5173",
    "http://localhost:3000",       # CRA / Next.js
    "http://127.0.0.1:3000",
]

# Add ngrok URL dynamically via environment variable:
#   set NGROK_URL=https://xxxx-xx-xx.ngrok-free.app   (Windows)
#   export NGROK_URL=https://xxxx-xx-xx.ngrok-free.app (Linux/Mac)
_ngrok = os.environ.get("NGROK_URL", "").strip().rstrip("/")
if _ngrok:
    ALLOWED_ORIGINS.append(_ngrok)

# ------------------------------------------------------------------ #
#  App
# ------------------------------------------------------------------ #
app = FastAPI(
    title="Unified Disaster Detection API",
    description="Multi-modal disaster detection: image, video, text, and AI-vs-real.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ------------------------------------------------------------------ #
#  Helper — detect file type from the uploaded filename
# ------------------------------------------------------------------ #
IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".bmp", ".gif"}
VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


def _detect_file_type(filename: str) -> str:
    """Return 'image', 'video', or 'unknown'."""
    if not filename:
        return "unknown"
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext in IMAGE_EXTENSIONS:
        return "image"
    if ext in VIDEO_EXTENSIONS:
        return "video"
    # Fallback: try mimetypes
    mime, _ = mimetypes.guess_type(filename)
    if mime:
        if mime.startswith("image"):
            return "image"
        if mime.startswith("video"):
            return "video"
    return "unknown"


# ------------------------------------------------------------------ #
#  Health check
# ------------------------------------------------------------------ #
@app.get("/")
def home():
    return {"message": "Disaster Detection API is running 🚀"}


@app.get("/health")
def health():
    return {
        "status": "ok",
        "models": {
            "image_cnn": "loaded" if image_service._model is not None else "not loaded (loads on first request)",
            "clip_ai_vs_real": "loaded" if clip_service._model is not None else "not loaded (loads on first request)",
            "text_classifier": "loaded" if text_service._model is not None else "not loaded (loads on first request)",
            "video_pipeline": "loaded" if video_service._pipe is not None else "not loaded (loads on first request)",
        },
    }


# ------------------------------------------------------------------ #
#  Individual endpoints
# ------------------------------------------------------------------ #
@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    """Classify an image into disaster categories using CNN."""
    file_bytes = await file.read()
    try:
        result = image_service.predict(file_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image prediction failed: {e}")


@app.post("/detect-ai-vs-real")
async def detect_ai_vs_real(file: UploadFile = File(...)):
    """Check if an image is a real photo or AI-generated."""
    file_bytes = await file.read()
    try:
        result = clip_service.predict(file_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI-vs-Real prediction failed: {e}")


@app.post("/predict-text")
async def predict_text(text: str = Form(...)):
    """Classify text as disaster or non-disaster."""
    try:
        result = text_service.predict(text)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text prediction failed: {e}")


@app.post("/predict-video")
async def predict_video(file: UploadFile = File(...)):
    """Classify a video by extracting frames and aggregating predictions."""
    file_bytes = await file.read()
    try:
        result = video_service.predict(file_bytes)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Video prediction failed: {e}")


# ------------------------------------------------------------------ #
#  Unified /predict — auto-routes based on input type
# ------------------------------------------------------------------ #
@app.post("/predict")
async def predict(
    text: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
):
    """
    Unified endpoint. Send any combination of:
      - file  (image → CNN + CLIP  |  video → video pipeline)
      - text  (→ text classifier)
    Automatically detects file type and routes to the correct model.
    """
    if not text and not file:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one input: 'text' and/or 'file' (image/video).",
        )

    response = {}

    # ---- TEXT ---- #
    if text:
        try:
            response["text"] = text_service.predict(text)
        except Exception as e:
            response["text"] = {"error": str(e)}

    # ---- FILE (image or video) ---- #
    if file:
        file_bytes = await file.read()
        file_type = _detect_file_type(file.filename)

        if file_type == "image":
            # Run both image models
            try:
                response["disaster"] = image_service.predict(file_bytes)
            except Exception as e:
                response["disaster"] = {"error": str(e)}

            try:
                response["ai_vs_real"] = clip_service.predict(file_bytes)
            except Exception as e:
                response["ai_vs_real"] = {"error": str(e)}

        elif file_type == "video":
            try:
                response["video"] = video_service.predict(file_bytes)
            except Exception as e:
                response["video"] = {"error": str(e)}

        else:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type: '{file.filename}'. Use jpg/png for images or mp4 for video.",
            )

    # ---- FINAL VERDICT ---- #
    response["verdict"] = _build_verdict(response)

    return response


# ------------------------------------------------------------------ #
#  Final decision logic
# ------------------------------------------------------------------ #
def _build_verdict(response: dict) -> dict:
    """Combine all available sub-results into a final verdict."""
    signals = []

    # Text signal
    text_r = response.get("text")
    if text_r and "error" not in text_r:
        if text_r.get("is_disaster"):
            signals.append(("text", text_r["confidence"]))

    # Image signal
    disaster_r = response.get("disaster")
    if disaster_r and "error" not in disaster_r:
        if disaster_r.get("is_disaster"):
            signals.append(("image", disaster_r["confidence"]))

    # AI-vs-real check
    ai_r = response.get("ai_vs_real")
    is_real = True
    if ai_r and "error" not in ai_r:
        is_real = ai_r.get("label") == "real"

    # Video signal
    video_r = response.get("video")
    if video_r and "error" not in video_r:
        signals.append(("video", video_r.get("confidence", 0)))

    # Decide
    if not signals:
        return {"risk_level": "Low", "is_disaster": False, "explanation": "No disaster signals detected."}

    avg_conf = sum(s[1] for s in signals) / len(signals)
    sources = [s[0] for s in signals]

    if not is_real:
        return {
            "risk_level": "Low",
            "is_disaster": False,
            "explanation": "Image appears AI-generated. Treating as non-disaster.",
        }

    if avg_conf > 0.8 and len(signals) >= 2:
        risk = "Critical"
    elif avg_conf > 0.7:
        risk = "High"
    elif avg_conf > 0.5:
        risk = "Medium"
    else:
        risk = "Low"

    return {
        "risk_level": risk,
        "is_disaster": True,
        "confidence": round(avg_conf, 4),
        "sources": sources,
        "explanation": f"Disaster detected by {', '.join(sources)} with avg confidence {avg_conf:.1%}.",
    }