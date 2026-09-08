from typing import List, Dict, Any
from pydantic import BaseModel


class GamingProfile(BaseModel):
    id: str  # battery_saver, balanced, ultra_esports, custom
    name: str
    description: str
    target_fps: int  # 30, 60, 144, 240
    gpu_throttle: str  # "Eco (Low VRAM)", "Optimized (DirectX 12)", "Uncapped (NVIDIA Reflex / Low Latency)"
    auto_pause_games: bool
    auto_pause_battery: bool
    hardware_acceleration: bool
    rendering_engine: str  # "DirectShow", "WorkerW WebGL", "Media Foundation", "MPV / libplacebo"


class SupportedResolution(BaseModel):
    key: str
    label: str
    width: int
    height: int
    aspect_ratio: str
    description: str
    gamer_tier: str  # e.g. "Mainstream Competitive", "2K Sweet Spot", "Ultra Enthusiast 4K", "Immersive Ultrawide", "Sim Racing / Cockpit"


class SupportedFormat(BaseModel):
    key: str
    label: str
    extensions: List[str]
    description: str
    decoder: str
    windows_support: str
    fps_range: str
    audio_reactivity: bool
