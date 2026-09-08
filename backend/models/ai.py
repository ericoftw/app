from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class AIGenerateWallpaperRequest(BaseModel):
    prompt: str
    style: str = "cyberpunk"  # cyberpunk, synthwave, scifi, anime, rain_lofi, abstract
    target_resolution: str = "1440p"  # 1080p, 1440p, 4k, ultrawide_21_9, super_ultrawide_32_9
    fps_target: int = 60
    include_audio_reactivity: bool = True
    color_vibe: Optional[str] = "neon_cyan_magenta"


class AIGenerateWallpaperResponse(BaseModel):
    id: str
    title: str
    description: str
    prompt: str
    shader_type: str
    shader_params: Dict[str, Any]
    color_palette: List[str]
    lively_config: Dict[str, Any]
    recommended_resolution: str
    fps: int
    preview_thumbnail: str
    media_url: str
    category: str
    format: str = "shader"
