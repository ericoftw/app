import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
from lib.db import client, db, ensure_indexes

# Import routers
from routers.wallpapers import router as wallpapers_router
from routers.monitors import router as monitors_router
from routers.scripts import router as scripts_router
from routers.ai import router as ai_router
from routers.system import router as system_router


# Startup runs before the yield, shutdown after it.
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.index_task = asyncio.create_task(ensure_indexes())
    # Run initial seed check in background
    try:
        from seed import seed_data
        asyncio.create_task(seed_data())
    except Exception as e:
        logging.getLogger(__name__).warning(f"Seed task error: {e}")
    yield
    client.close()


# Create the main app without a prefix
app = FastAPI(
    title="LivePaper Engine Pro - Windows Live Wallpaper Studio",
    version="2.0.0",
    lifespan=lifespan
)

# Create the router with the /api prefix
api_router = APIRouter(prefix="/api")


@api_router.get("/")
async def root():
    return {
        "app": "LivePaper Engine Pro",
        "version": "2.0.0",
        "status": "online",
        "target_os": "Windows 10 / Windows 11 (64-bit)",
        "features": [
            "Multi-resolution gamer support (1080p, 1440p, 4K, 21:9 UW, 32:9 Super UW)",
            "5+ Video formats (MP4, WebM, MKV/MOV, GIF/Cinemagraph, WebGL Shaders, Stream URLs)",
            "Desktop Simulator with live audio visualizer & taskbar HUD",
            "Windows PowerShell & Batch Native Hooking Scripts",
            "Lively Wallpaper & Wallpaper Engine Project Exporter",
            "AI Dynamic Wallpaper Synthesizer"
        ]
    }


# Mount sub-routers on api_router
api_router.include_router(wallpapers_router)
api_router.include_router(monitors_router)
api_router.include_router(scripts_router)
api_router.include_router(ai_router)
api_router.include_router(system_router)

# Include api_router into app (must be done before CORS / middleware)
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
