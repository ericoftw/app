from typing import List, Optional
from pydantic import BaseModel, Field


class MonitorConfig(BaseModel):
    id: str  # monitor-1, monitor-2, monitor-3
    name: str  # "Monitor 1 (Principal - Gamer 240Hz)"
    resolution: str  # "2560x1440 (2K QHD)"
    resolution_key: str  # "1440p", "1080p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"
    aspect_ratio: str  # "16:9", "21:9", "32:9"
    refresh_rate_hz: int  # 240, 144, 60
    wallpaper_id: str
    fit_mode: str = "cover"  # cover, contain, stretch, center
    brightness: int = 100
    contrast: int = 100
    saturation: int = 100
    playback_speed: float = 1.0
    volume: int = 0
    is_primary: bool = True
    orientation: str = "landscape"  # landscape, portrait
    crt_filter: bool = False
    audio_reactive: bool = True


class MultiMonitorSetup(BaseModel):
    mode: str = "independent"  # independent, span, clone
    monitors: List[MonitorConfig]
    updated_at: Optional[str] = None
