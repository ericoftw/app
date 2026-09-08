from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter
from lib.db import db
from models.monitor import MultiMonitorSetup, MonitorConfig

router = APIRouter(prefix="/monitors", tags=["monitors"])

DEFAULT_MONITORS = [
    MonitorConfig(
        id="monitor-1",
        name="Monitor 1 (Principal - Gamer 240Hz)",
        resolution="2560x1440 (2K QHD)",
        resolution_key="1440p",
        aspect_ratio="16:9",
        refresh_rate_hz=240,
        wallpaper_id="curated-1",
        fit_mode="cover",
        brightness=100,
        contrast=100,
        saturation=105,
        playback_speed=1.0,
        volume=0,
        is_primary=True,
        orientation="landscape",
        crt_filter=False,
        audio_reactive=True,
    ),
    MonitorConfig(
        id="monitor-2",
        name="Monitor 2 (Secundário - Chat / Discord 144Hz)",
        resolution="1920x1080 (Full HD)",
        resolution_key="1080p",
        aspect_ratio="16:9",
        refresh_rate_hz=144,
        wallpaper_id="curated-2",
        fit_mode="cover",
        brightness=95,
        contrast=100,
        saturation=100,
        playback_speed=1.0,
        volume=0,
        is_primary=False,
        orientation="landscape",
        crt_filter=False,
        audio_reactive=False,
    ),
    MonitorConfig(
        id="monitor-3",
        name="Monitor 3 (Ultrawide Imersivo 21:9)",
        resolution="3440x1440 (UW-QHD)",
        resolution_key="ultrawide_21_9",
        aspect_ratio="21:9",
        refresh_rate_hz=144,
        wallpaper_id="curated-4",
        fit_mode="cover",
        brightness=100,
        contrast=100,
        saturation=110,
        playback_speed=1.0,
        volume=0,
        is_primary=False,
        orientation="landscape",
        crt_filter=True,
        audio_reactive=True,
    )
]


@router.get("", response_model=MultiMonitorSetup)
async def get_monitors():
    doc = await db.settings.find_one({"key": "multi_monitor_setup"})
    if not doc:
        # initialize default
        initial_setup = MultiMonitorSetup(
            mode="independent",
            monitors=DEFAULT_MONITORS,
            updated_at=datetime.now(timezone.utc).isoformat()
        )
        await db.settings.update_one(
            {"key": "multi_monitor_setup"},
            {"$set": {"key": "multi_monitor_setup", **initial_setup.model_dump()}},
            upsert=True
        )
        return initial_setup
    
    return MultiMonitorSetup(
        mode=doc.get("mode", "independent"),
        monitors=[MonitorConfig(**m) for m in doc.get("monitors", [])],
        updated_at=doc.get("updated_at")
    )


@router.put("", response_model=MultiMonitorSetup)
async def update_monitors(payload: MultiMonitorSetup):
    data = payload.model_dump()
    data["updated_at"] = datetime.now(timezone.utc).isoformat()
    await db.settings.update_one(
        {"key": "multi_monitor_setup"},
        {"$set": {"key": "multi_monitor_setup", **data}},
        upsert=True
    )
    return payload
