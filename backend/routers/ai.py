import os
import json
import uuid
import asyncio
from datetime import datetime, timezone
import logging
from fastapi import APIRouter
from lib.db import db
from models.ai import AIGenerateWallpaperRequest, AIGenerateWallpaperResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ai", tags=["ai"])

# Curated shader templates
SHADER_TEMPLATES = {
    "cyberpunk": {
        "shader_type": "matrix_rain",
        "colors": ["#00F0FF", "#FF0055", "#0B0E14", "#7000FF"],
        "media_url": "/wallpapers/matrix-rain.webm",
        "thumbnail_url": "/wallpapers/neon-city.jpg",
        "category": "cyberpunk"
    },
    "synthwave": {
        "shader_type": "synthwave_sun",
        "colors": ["#FF007F", "#FFD700", "#7928CA", "#00F0FF"],
        "media_url": "/wallpapers/synthwave-highway.webm",
        "thumbnail_url": "/wallpapers/synthwave-highway.jpg",
        "category": "synthwave"
    },
    "scifi": {
        "shader_type": "audio_waves",
        "colors": ["#00F0FF", "#00FF66", "#0B0E14", "#1E293B"],
        "media_url": "/wallpapers/audio-spectrum.webm",
        "thumbnail_url": "/wallpapers/audio-spectrum.jpg",
        "category": "scifi"
    },
    "anime": {
        "shader_type": "cyber_particles",
        "colors": ["#FF77A9", "#FF0055", "#2B0938", "#FFE4E6"],
        "media_url": "/wallpapers/warp-starfield.webm",
        "thumbnail_url": "/wallpapers/warp-starfield.jpg",
        "category": "anime"
    },
    "rain_lofi": {
        "shader_type": "rain_glass",
        "colors": ["#38BDF8", "#818CF8", "#0F172A", "#1E1B4B"],
        "media_url": "/wallpapers/audio-spectrum.webm",
        "thumbnail_url": "/wallpapers/rainy-neon-glass.jpg",
        "category": "rain_lofi"
    },
    "abstract": {
        "shader_type": "starfield_vortex",
        "colors": ["#7000FF", "#00F0FF", "#030712", "#EC4899"],
        "media_url": "/wallpapers/warp-starfield.webm",
        "thumbnail_url": "/wallpapers/matrix-rain.jpg",
        "category": "abstract"
    }
}


@router.post("/generate-wallpaper", response_model=AIGenerateWallpaperResponse)
async def generate_ai_wallpaper(payload: AIGenerateWallpaperRequest):
    new_id = f"ai-{uuid.uuid4().hex[:8]}"
    style_key = payload.style if payload.style in SHADER_TEMPLATES else "cyberpunk"
    template = SHADER_TEMPLATES[style_key]

    ai_key = os.environ.get("EMERGENT_LLM_KEY", "")
    title = f"{payload.prompt[:30].title()} (AI Edition)"
    description = f"AI synthesised live wallpaper: {payload.prompt}"
    palette = template["colors"]
    shader_type = template["shader_type"]
    shader_params = {
        "speed": 1.2,
        "glow": 1.5,
        "particleCount": 120,
        "audioSensitivity": 1.4 if payload.include_audio_reactivity else 0.5,
        "color1": palette[0],
        "color2": palette[1],
        "color3": palette[2] if len(palette) > 2 else "#000000",
        "bloom": True,
        "fps_target": payload.fps_target
    }

    if ai_key:
        try:
            from emergentintegrations.llm.chat import LlmChat, UserMessage

            async def _synthesize() -> str:
                chat = LlmChat(
                    api_key=ai_key,
                    session_id=f"ai-wp-{uuid.uuid4().hex[:6]}",
                    system_message=(
                        "You are a master creative director and GLSL shader artist for high-end gamer live video wallpapers "
                        "(compatible with Windows LivePaper Engine, Lively Wallpaper, and Wallpaper Engine). "
                        "Given a user prompt, return ONLY valid JSON with keys: 'title', 'description', 'shader_type' "
                        "(choose one from: 'matrix_rain', 'synthwave_sun', 'audio_waves', 'cyber_particles', 'starfield_vortex', 'rain_glass'), "
                        "'colors' (array of 4 vibrant HEX codes), 'glow_strength' (number between 1.0 and 2.5), "
                        "'particle_count' (int 80-250), 'speed' (number 0.8-2.0), 'tags' (array of 4 gamer tags)."
                    )
                ).with_model("openai", "gpt-5.4")

                prompt_msg = (
                    f"Create a live wallpaper for gamer prompt: '{payload.prompt}'. Style: {payload.style}. "
                    f"Target Resolution: {payload.target_resolution}. "
                    f"Audio Reactivity: {payload.include_audio_reactivity}."
                )

                text = ""
                async for ev in chat.stream_message(UserMessage(text=prompt_msg)):
                    if hasattr(ev, "content") and ev.content:
                        text += ev.content
                return text

            # Never let a slow/unavailable model hang the request — the curated
            # template below is already a complete, usable wallpaper.
            response_text = await asyncio.wait_for(_synthesize(), timeout=25)

            # Parse JSON from response
            cleaned = response_text.strip()
            if "```json" in cleaned:
                cleaned = cleaned.split("```json")[1].split("```")[0].strip()
            elif "```" in cleaned:
                cleaned = cleaned.split("```")[1].split("```")[0].strip()

            data = json.loads(cleaned)
            if "title" in data:
                title = data["title"]
            if "description" in data:
                description = data["description"]
            if "colors" in data and isinstance(data["colors"], list) and len(data["colors"]) >= 2:
                palette = data["colors"]
            if "shader_type" in data and data["shader_type"] in [
                "matrix_rain", "synthwave_sun", "audio_waves", "cyber_particles", "starfield_vortex", "rain_glass"
            ]:
                shader_type = data["shader_type"]

            shader_params["speed"] = data.get("speed", 1.2)
            shader_params["glow"] = data.get("glow_strength", 1.5)
            shader_params["particleCount"] = data.get("particle_count", 120)
            shader_params["color1"] = palette[0]
            shader_params["color2"] = palette[1]
            if len(palette) > 2:
                shader_params["color3"] = palette[2]

        except Exception as e:
            logger.warning(f"AI Generation LLM call fallback due to: {e}")

    # Build lively config
    lively_config = {
        "Title": title,
        "Author": "LivePaper AI Generator",
        "ShaderType": shader_type,
        "TargetFPS": payload.fps_target,
        "Palette": palette,
        "Params": shader_params
    }

    # Save to wallpapers collection so it can be used immediately
    new_wallpaper_doc = {
        "id": new_id,
        "title": title,
        "description": description,
        "format": "shader",
        "category": template["category"],
        "resolutions": ["1080p", "1440p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"],
        "aspect_ratio": "16:9" if "ultrawide" not in payload.target_resolution else ("21:9" if payload.target_resolution == "ultrawide_21_9" else "32:9"),
        "fps": payload.fps_target,
        "media_url": template["media_url"],
        "thumbnail_url": template["thumbnail_url"],
        "shader_type": shader_type,
        "shader_params": shader_params,
        "is_favorite": True,
        "is_curated": False,
        "tags": ["AI Generated", payload.style.title(), f"{payload.fps_target}FPS", payload.target_resolution],
        "file_size_mb": 4.2,
        "audio_supported": payload.include_audio_reactivity,
        "author": "AI LivePaper Synthesizer",
        "created_at": datetime.now(timezone.utc)
    }

    await db.wallpapers.insert_one(new_wallpaper_doc)

    return AIGenerateWallpaperResponse(
        id=new_id,
        title=title,
        description=description,
        prompt=payload.prompt,
        shader_type=shader_type,
        shader_params=shader_params,
        color_palette=palette,
        lively_config=lively_config,
        recommended_resolution=payload.target_resolution,
        fps=payload.fps_target,
        preview_thumbnail=template["thumbnail_url"],
        media_url=template["media_url"],
        category=template["category"],
        format="shader"
    )
