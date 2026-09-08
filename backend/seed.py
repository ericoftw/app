import asyncio
from datetime import datetime, timezone
from lib.db import db, ensure_indexes

# Self-hosted procedurally-rendered gamer loops (backend/tools/render_wallpapers.py).
# Served by Vite from frontend/public/wallpapers, so playback never depends on a third-party CDN.
# .webm = VP9 (plays in every modern browser), .mp4 = H.264 (what Windows/Wallpaper Engine consume).
V_CITY_MP4 = "/wallpapers/neon-city.mp4"
V_CITY_WEBM = "/wallpapers/neon-city.webm"
V_SYNTH_MP4 = "/wallpapers/synthwave-highway.mp4"
V_SYNTH_WEBM = "/wallpapers/synthwave-highway.webm"
V_MATRIX_MP4 = "/wallpapers/matrix-rain.mp4"
V_MATRIX_WEBM = "/wallpapers/matrix-rain.webm"
V_WARP_MP4 = "/wallpapers/warp-starfield.mp4"
V_WARP_WEBM = "/wallpapers/warp-starfield.webm"
V_AUDIO_MP4 = "/wallpapers/audio-spectrum.mp4"
V_AUDIO_WEBM = "/wallpapers/audio-spectrum.webm"
V_RAIN_MP4 = "/wallpapers/rainy-neon-glass.mp4"
V_RAIN_WEBM = "/wallpapers/rainy-neon-glass.webm"

THUMB_CYBER = "/wallpapers/neon-city.jpg"
THUMB_SYNTH = "/wallpapers/synthwave-highway.jpg"
THUMB_SCIFI = "/wallpapers/audio-spectrum.jpg"
THUMB_ANIME = "/wallpapers/warp-starfield.jpg"
THUMB_RAIN = "/wallpapers/rainy-neon-glass.jpg"
THUMB_ABSTRACT = "/wallpapers/matrix-rain.jpg"

CURATED_WALLPAPERS = [
    {
        "id": "curated-1",
        "title": "Cyberpunk Matrix Data Grid 4K",
        "description": "Grade de dados cyberpunk em movimento com partículas neon verdes e telemetria digital em 4K a 60 FPS.",
        "format": "mp4",
        "category": "cyberpunk",
        "resolutions": ["1080p", "1440p", "4k", "ultrawide_21_9"],
        "aspect_ratio": "16:9",
        "fps": 60,
        "media_url": V_CITY_MP4,
        "thumbnail_url": THUMB_CYBER,
        "shader_type": "matrix_rain",
        "shader_params": {"speed": 1.3, "glow": 1.7, "particleCount": 150, "color1": "#00FF66", "color2": "#00F0FF", "color3": "#0B0E14"},
        "is_favorite": True,
        "is_curated": True,
        "tags": ["Cyberpunk", "4K", "Neon", "Matrix", "60FPS"],
        "file_size_mb": 45.2,
        "audio_supported": True,
        "author": "CyberGamer Studios",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-2",
        "title": "Synthwave Sunset Highway 144Hz",
        "description": "Estrada infinita no estilo retro synthwave dos anos 80 com grade neon 3D e sol pulsante renderizado a 144Hz.",
        "format": "shader",
        "shader_type": "synthwave_sun",
        "category": "synthwave",
        "resolutions": ["1080p", "1440p", "ultrawide_21_9", "super_ultrawide_32_9"],
        "aspect_ratio": "16:9",
        "fps": 144,
        "media_url": V_SYNTH_WEBM,
        "thumbnail_url": THUMB_SYNTH,
        "shader_params": {"speed": 1.2, "glow": 1.6, "particleCount": 110, "color1": "#FF007F", "color2": "#FFD700", "color3": "#7928CA"},
        "is_favorite": True,
        "is_curated": True,
        "tags": ["Synthwave", "Retro 80s", "144Hz", "Grid", "Neon"],
        "file_size_mb": 2.6,
        "audio_supported": True,
        "author": "Outrun Visuals",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-3",
        "title": "Matrix Digital Rain Pro (GPU WebGL)",
        "description": "Chuva digital Matrix procedural de alta velocidade renderizada em tempo real pela GPU com suporte até 240 FPS.",
        "format": "shader",
        "shader_type": "matrix_rain",
        "category": "cyberpunk",
        "resolutions": ["1080p", "1440p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"],
        "aspect_ratio": "16:9",
        "fps": 240,
        "media_url": V_MATRIX_WEBM,
        "thumbnail_url": THUMB_ABSTRACT,
        "shader_params": {"speed": 1.4, "glow": 1.8, "particleCount": 160, "color1": "#00FF66", "color2": "#00F0FF", "color3": "#0B0E14"},
        "is_favorite": True,
        "is_curated": True,
        "tags": ["Matrix", "Shader WebGL", "240Hz", "GPU Direct", "Hacker"],
        "file_size_mb": 1.2,
        "audio_supported": True,
        "author": "Kernel LivePaper",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-4",
        "title": "Sci-Fi Hologram HUD Cockpit 21:9",
        "description": "Painel holográfico futurista de nave de combate com ondas de telemetria ativa otimizado para Ultrawide 21:9.",
        "format": "shader",
        "shader_type": "audio_waves",
        "category": "scifi",
        "resolutions": ["1440p", "ultrawide_21_9", "super_ultrawide_32_9"],
        "aspect_ratio": "21:9",
        "fps": 120,
        "media_url": V_AUDIO_WEBM,
        "thumbnail_url": THUMB_SCIFI,
        "shader_params": {"speed": 1.5, "glow": 1.9, "particleCount": 140, "audioSensitivity": 1.6, "color1": "#00F0FF", "color2": "#00FF66", "color3": "#1E293B"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["Sci-Fi", "HUD", "Ultrawide 21:9", "Cockpit", "120FPS"],
        "file_size_mb": 2.1,
        "audio_supported": True,
        "author": "AeroMech FX",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-5",
        "title": "Lo-Fi Rainy Window over Tokyo Neon",
        "description": "Gotas de chuva hiper-realistas escorrendo sobre vidro com reflexos de néon quente e clima relaxante para estudar e jogar.",
        "format": "gif",
        "shader_type": "rain_glass",
        "category": "rain_lofi",
        "resolutions": ["1080p", "1440p"],
        "aspect_ratio": "16:9",
        "fps": 60,
        "media_url": V_RAIN_WEBM,
        "thumbnail_url": THUMB_RAIN,
        "shader_params": {"speed": 1.0, "glow": 1.2, "particleCount": 90, "color1": "#38BDF8", "color2": "#818CF8", "color3": "#0F172A"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["Lo-Fi", "Rain", "Chill", "Cinemagraph", "Cozy"],
        "file_size_mb": 14.8,
        "audio_supported": True,
        "author": "ChillHop Ambient",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-6",
        "title": "Deep Space Nebula & Pulsar 4K HDR",
        "description": "Viagem intergaláctica real em vídeo 4K através de nebulosas cósmicas estelares com partículas gravitacionais.",
        "format": "mp4",
        "category": "scifi",
        "resolutions": ["1080p", "1440p", "4k", "super_ultrawide_32_9"],
        "aspect_ratio": "16:9",
        "fps": 60,
        "media_url": V_WARP_MP4,
        "thumbnail_url": THUMB_ANIME,
        "shader_type": "starfield_vortex",
        "shader_params": {"speed": 1.3, "glow": 1.5, "particleCount": 200, "color1": "#00F0FF", "color2": "#7000FF", "color3": "#030712"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["Space", "Nebula", "Cosmic", "4K HDR", "Stars"],
        "file_size_mb": 38.0,
        "audio_supported": False,
        "author": "CosmoLab",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-7",
        "title": "Audio Reactive Cyber Waves & RGB Spectrum",
        "description": "Visualizador de espectro sonoro com ondas e partículas neon que dançam dinamicamente ao ritmo das suas músicas e jogos.",
        "format": "shader",
        "shader_type": "audio_waves",
        "category": "gaming_esports",
        "resolutions": ["1080p", "1440p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"],
        "aspect_ratio": "16:9",
        "fps": 240,
        "media_url": V_AUDIO_WEBM,
        "thumbnail_url": THUMB_SCIFI,
        "shader_params": {"speed": 1.6, "glow": 2.0, "particleCount": 180, "audioSensitivity": 1.8, "color1": "#00F0FF", "color2": "#FF0055", "color3": "#7000FF"},
        "is_favorite": True,
        "is_curated": True,
        "tags": ["Audio Reactive", "RGB", "eSports", "240Hz", "Bass Visualizer"],
        "file_size_mb": 1.8,
        "audio_supported": True,
        "author": "Razer Chroma / LivePaper",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-8",
        "title": "Anime Cyber Samurai Sakura Vortex",
        "description": "Vórtice de pétalas de cerejeira digitais e partículas cibernéticas flutuando em rotação hipnótica a 120 FPS.",
        "format": "shader",
        "shader_type": "starfield_vortex",
        "category": "anime",
        "resolutions": ["1080p", "1440p", "4k"],
        "aspect_ratio": "16:9",
        "fps": 120,
        "media_url": V_WARP_WEBM,
        "thumbnail_url": THUMB_ANIME,
        "shader_params": {"speed": 1.1, "glow": 1.6, "particleCount": 170, "color1": "#FF77A9", "color2": "#FF0055", "color3": "#2B0938"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["Anime", "Samurai", "Sakura", "Cyber Katana", "120Hz"],
        "file_size_mb": 2.4,
        "audio_supported": True,
        "author": "AnimeFX Studio",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-9",
        "title": "32:9 Super Ultrawide Neon Horizon Grid",
        "description": "Horizonte panorâmico sem fim de 5120x1440 com sol neon gigante e montanhas wireframe para telas Super Ultrawide 32:9.",
        "format": "shader",
        "shader_type": "synthwave_sun",
        "category": "synthwave",
        "resolutions": ["super_ultrawide_32_9", "ultrawide_21_9", "4k"],
        "aspect_ratio": "32:9",
        "fps": 144,
        "media_url": V_SYNTH_WEBM,
        "thumbnail_url": THUMB_SYNTH,
        "shader_params": {"speed": 1.2, "glow": 1.6, "particleCount": 100, "color1": "#FF007F", "color2": "#FFD700", "color3": "#7928CA"},
        "is_favorite": True,
        "is_curated": True,
        "tags": ["Super Ultrawide 32:9", "5120x1440", "Synthwave", "Odyssey G9", "144Hz"],
        "file_size_mb": 2.1,
        "audio_supported": True,
        "author": "SimRacing Visuals",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-10",
        "title": "Hacker Terminal Live Code Stream",
        "description": "Feed de vídeo real de terminal de código neon em execução contínua, ideal para streamers e desenvolvedores gamers.",
        "format": "stream_url",
        "category": "gaming_esports",
        "resolutions": ["1080p", "1440p", "4k"],
        "aspect_ratio": "16:9",
        "fps": 60,
        "media_url": V_MATRIX_WEBM,
        "thumbnail_url": THUMB_ABSTRACT,
        "shader_type": "matrix_rain",
        "shader_params": {"speed": 1.2, "glow": 1.5, "particleCount": 130, "color1": "#00FF66", "color2": "#00F0FF", "color3": "#0B0E14"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["Live Stream", "HLS", "URL Stream", "Terminal", "60FPS"],
        "file_size_mb": 0.0,
        "audio_supported": True,
        "author": "Live Stream Engine",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-11",
        "title": "Neo-Tokyo Aerial City Traffic (WebM VP9)",
        "description": "Vídeo aéreo real de tráfego urbano em movimento contínuo, codificado em WebM VP9 de alta compressão.",
        "format": "webm",
        "category": "cyberpunk",
        "resolutions": ["1080p", "1440p", "4k", "ultrawide_21_9"],
        "aspect_ratio": "16:9",
        "fps": 60,
        "media_url": V_CITY_WEBM,
        "thumbnail_url": THUMB_CYBER,
        "shader_type": "cyber_particles",
        "shader_params": {"speed": 1.2, "glow": 1.4, "particleCount": 140, "color1": "#00F0FF", "color2": "#FF0055", "color3": "#0B0E14"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["WebM", "VP9", "City", "Aerial", "60FPS"],
        "file_size_mb": 22.5,
        "audio_supported": True,
        "author": "UrbanFlow Media",
        "created_at": datetime.now(timezone.utc)
    },
    {
        "id": "curated-12",
        "title": "Deep Space Warp Drive (MKV Container)",
        "description": "Contêiner MKV de alta taxa de bits com viagem estelar em velocidade de dobra e áudio surround para setups gamers.",
        "format": "mkv",
        "category": "scifi",
        "resolutions": ["1080p", "1440p", "4k", "super_ultrawide_32_9"],
        "aspect_ratio": "16:9",
        "fps": 60,
        "media_url": V_WARP_MP4,
        "thumbnail_url": THUMB_SCIFI,
        "shader_type": "starfield_vortex",
        "shader_params": {"speed": 1.5, "glow": 1.7, "particleCount": 210, "color1": "#00F0FF", "color2": "#7000FF", "color3": "#030712"},
        "is_favorite": False,
        "is_curated": True,
        "tags": ["MKV", "Warp Drive", "Surround", "4K", "Space"],
        "file_size_mb": 61.3,
        "audio_supported": True,
        "author": "StellarDrive FX",
        "created_at": datetime.now(timezone.utc)
    }
]


async def seed_data():
    print("[*] Ensuring indexes...")
    await ensure_indexes()

    print("[*] Seeding Curated Gamer Live Wallpapers...")
    for wp in CURATED_WALLPAPERS:
        await db.wallpapers.update_one(
            {"id": wp["id"]},
            {"$set": wp},
            upsert=True
        )
    print(f"[+] Successfully seeded {len(CURATED_WALLPAPERS)} gamer live wallpapers!")


if __name__ == "__main__":
    asyncio.run(seed_data())
