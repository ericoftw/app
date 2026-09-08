import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class Wallpaper(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    format: str  # mp4, webm, mkv, gif, shader, stream_url
    category: str  # cyberpunk, synthwave, scifi, anime, rain_lofi, gaming_esports, abstract, custom
    resolutions: List[str] = Field(default_factory=lambda: ["1080p", "1440p", "4k"])  # 1080p, 1440p, 4k, ultrawide_21_9, super_ultrawide_32_9
    aspect_ratio: str = "16:9"  # 16:9, 21:9, 32:9, auto
    fps: int = 60  # 30, 60, 120, 144, 240
    media_url: str
    thumbnail_url: str
    shader_type: Optional[str] = None  # matrix_rain, neon_grid, audio_waves, starfield_vortex, cyber_particles, rain_glass, synthwave_sun
    shader_code: Optional[str] = None
    shader_params: Optional[Dict[str, Any]] = None
    is_favorite: bool = False
    is_curated: bool = True
    tags: List[str] = Field(default_factory=list)
    file_size_mb: float = 15.4
    audio_supported: bool = False
    author: str = "LivePaper Studio"
    download_url: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class WallpaperCreate(BaseModel):
    title: str
    description: str
    format: str
    category: str
    resolutions: List[str] = Field(default_factory=lambda: ["1080p", "1440p", "4k"])
    aspect_ratio: str = "16:9"
    fps: int = 60
    media_url: str
    thumbnail_url: Optional[str] = None
    shader_type: Optional[str] = None
    shader_code: Optional[str] = None
    shader_params: Optional[Dict[str, Any]] = None
    tags: List[str] = Field(default_factory=list)
    file_size_mb: Optional[float] = 12.0
    audio_supported: bool = False
    author: Optional[str] = "User"


class WallpaperUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    resolutions: Optional[List[str]] = None
    aspect_ratio: Optional[str] = None
    fps: Optional[int] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    shader_type: Optional[str] = None
    shader_code: Optional[str] = None
    shader_params: Optional[Dict[str, Any]] = None
    is_favorite: Optional[bool] = None
    tags: Optional[List[str]] = None
    audio_supported: Optional[bool] = None
