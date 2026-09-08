from typing import List
from fastapi import APIRouter
from models.system import GamingProfile, SupportedResolution, SupportedFormat

router = APIRouter(prefix="/system", tags=["system"])

GAMING_PROFILES: List[GamingProfile] = [
    GamingProfile(
        id="ultra_esports",
        name="Ultra eSports / 240Hz Pro",
        description="Renderização máxima com latência ultra-baixa, suporte até 240Hz e pausa instantânea ao abrir jogos em tela cheia.",
        target_fps=240,
        gpu_throttle="Uncapped (NVIDIA Reflex / Low Latency DirectShow)",
        auto_pause_games=True,
        auto_pause_battery=False,
        hardware_acceleration=True,
        rendering_engine="WorkerW Direct3D 12"
    ),
    GamingProfile(
        id="balanced",
        name="Balanceado / 60 FPS Suave",
        description="Equilíbrio ideal entre fluidez visual suave a 60 FPS e consumo mínimo de energia da GPU.",
        target_fps=60,
        gpu_throttle="Optimized (DirectX 11 Media Foundation)",
        auto_pause_games=True,
        auto_pause_battery=True,
        hardware_acceleration=True,
        rendering_engine="Media Foundation Hardware Acceleration"
    ),
    GamingProfile(
        id="battery_saver",
        name="Economia de Energia / 30 FPS",
        description="Modo econômico com taxa de quadros travada em 30 FPS e pausa imediata ao perder o foco ou entrar em modo bateria.",
        target_fps=30,
        gpu_throttle="Eco Mode (< 1% GPU / Low VRAM usage)",
        auto_pause_games=True,
        auto_pause_battery=True,
        hardware_acceleration=False,
        rendering_engine="Eco Video Decoder"
    )
]

SUPPORTED_RESOLUTIONS: List[SupportedResolution] = [
    SupportedResolution(
        key="1080p",
        label="1080p Full HD",
        width=1920,
        height=1080,
        aspect_ratio="16:9",
        description="Resolução padrão para eSports competitivos (CS2, Valorant, Apex Legends) com alta taxa de quadros (144Hz - 360Hz).",
        gamer_tier="Mainstream eSports Standard"
    ),
    SupportedResolution(
        key="1440p",
        label="1440p 2K QHD",
        width=2560,
        height=1440,
        aspect_ratio="16:9",
        description="O 'Sweet Spot' gamer definitivo! Máxima nitidez e excelente equilíbrio de performance em monitores 27 e 32 polegadas.",
        gamer_tier="Gamer Sweet Spot (2K)"
    ),
    SupportedResolution(
        key="4k",
        label="4K Ultra HD",
        width=3840,
        height=2160,
        aspect_ratio="16:9",
        description="Nitidez cinematográfica para placas RTX 4080/4090 e monitores OLED 4K com suporte a HDR e 120Hz/144Hz.",
        gamer_tier="Ultra Enthusiast 4K OLED"
    ),
    SupportedResolution(
        key="ultrawide_21_9",
        label="Ultrawide 21:9 (UW-QHD)",
        width=3440,
        height=1440,
        aspect_ratio="21:9",
        description="Campo de visão panorâmico imersivo (FOV ampliado) para monitores curvos 34 polegadas em jogos de corrida e RPG.",
        gamer_tier="Immersive Curved Ultrawide"
    ),
    SupportedResolution(
        key="super_ultrawide_32_9",
        label="Super Ultrawide 32:9 (Dual QHD)",
        width=5120,
        height=1440,
        aspect_ratio="32:9",
        description="Resolução monumental equivalente a dois monitores 1440p lado a lado (Samsung Odyssey G9 / OLED 49 polegadas).",
        gamer_tier="Sim Racing & Flight Cockpit"
    )
]

SUPPORTED_FORMATS: List[SupportedFormat] = [
    SupportedFormat(
        key="mp4",
        label="MP4 (H.264 / H.265 HEVC)",
        extensions=[".mp4", ".m4v"],
        description="Formato de vídeo mais popular com aceleração total via decodificadores NVDEC (NVIDIA) e AMD VCN.",
        decoder="Windows Media Foundation / DirectShow",
        windows_support="Nativo 100% (Windows 10/11)",
        fps_range="30 FPS a 240 FPS",
        audio_reactivity=True
    ),
    SupportedFormat(
        key="webm",
        label="WebM (VP9 / AV1 Codec)",
        extensions=[".webm"],
        description="Vídeo de alta compressão e máxima fidelidade de cores, ideal para loops animados e baixo consumo de RAM.",
        decoder="Chromium / Edge WebView2 & libvpx",
        windows_support="Nativo via WebView2 / MPV",
        fps_range="60 FPS a 144 FPS",
        audio_reactivity=True
    ),
    SupportedFormat(
        key="mkv",
        label="MKV / AVI / MOV (Desktop Media)",
        extensions=[".mkv", ".avi", ".mov", ".flv"],
        description="Suporte para contêineres de alta taxa de bits e múltiplas faixas de áudio surround para setups gamers.",
        decoder="DirectShow Splitter / LAV Filters / MPV",
        windows_support="Compatível via WorkerW Hook",
        fps_range="30 FPS a 120 FPS",
        audio_reactivity=True
    ),
    SupportedFormat(
        key="gif",
        label="GIF Animado & Cinemagraph WebP",
        extensions=[".gif", ".webp", ".apng"],
        description="Loops perfeitos e cinemagrafias retro pixel-art com carregamento instantâneo e zero delay.",
        decoder="GDI+ / DirectX Canvas 2D",
        windows_support="Nativo 100%",
        fps_range="15 FPS a 60 FPS",
        audio_reactivity=False
    ),
    SupportedFormat(
        key="shader",
        label="Shaders WebGL & Canvas Interativo",
        extensions=[".glsl", ".frag", ".html5"],
        description="Efeitos procedurais gerados em tempo real pela GPU (Matrix, Chuva Neon, Ondas Sonoras, Synthwave 3D) reativos a música.",
        decoder="WebGL 2.0 / OpenGL ES / DirectX 12",
        windows_support="Nativo via Lively & WebView2",
        fps_range="60 FPS a 360 FPS (Ilimitado)",
        audio_reactivity=True
    ),
    SupportedFormat(
        key="stream_url",
        label="Stream URL / Live Feeds",
        extensions=["http://", "https://", "m3u8", "mpd"],
        description="Transmissões ao vivo e feeds de vídeo remotos sincronizados com a internet para planos de fundo dinâmicos.",
        decoder="HLS.js / Dash.js Network Streamer",
        windows_support="Compatível via Windows Engine",
        fps_range="30 FPS a 60 FPS",
        audio_reactivity=True
    )
]


@router.get("/gaming-profiles", response_model=List[GamingProfile])
async def get_gaming_profiles():
    return GAMING_PROFILES


@router.get("/resolutions", response_model=List[SupportedResolution])
async def get_supported_resolutions():
    return SUPPORTED_RESOLUTIONS


@router.get("/formats", response_model=List[SupportedFormat])
async def get_supported_formats():
    return SUPPORTED_FORMATS
