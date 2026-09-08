from typing import List, Optional
from pydantic import BaseModel, Field


class ScriptExportRequest(BaseModel):
    wallpaper_id: str
    target_os: str = "windows10_11"
    script_type: str = "powershell"  # powershell, batch, lively_zip, wallpaper_engine_json, vlc_workerw
    resolution: str = "1440p"
    fps_limit: int = 60
    auto_pause_fullscreen: bool = True
    audio_enabled: bool = False
    volume: int = 0
    fit_mode: str = "cover"
    hardware_acceleration: bool = True


class ScriptExportResponse(BaseModel):
    script_type: str
    filename: str
    content: str
    instructions: List[str]
    download_ready: bool = True
    metadata: dict = Field(default_factory=dict)
