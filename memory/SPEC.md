# LivePaper Engine Pro - Living Specification

## Overview
LivePaper Engine Pro is a specialized Windows Live Video Wallpaper Studio & Execution Companion designed for PC gamers. It enables running dynamic video wallpapers with hardware acceleration (DirectX 12 / DirectShow / WorkerW window hooking) across gamer resolutions with low CPU/GPU overhead and zero input lag in games.

## Key Capabilities & Features

### 1. Windows Desktop Live Simulator & Player
- Real-time video player with hardware-accelerated playback and WebGL 2D/3D procedural shader engines.
- Audio Reactive Holographic Visualizer responding to simulated/live audio spectrum.
- Interactive Windows 11/10 Taskbar with functioning Start Menu popup, search, pinned apps, system tray with live digital clock, and gaming sync indicator.
- Interactive Desktop Icons (This PC, Recycle Bin, Cyberpunk 2077, LivePaper Hub, Steam, Wallpapers folder).
- Realtime Telemetry HUD (Live FPS tracker 60Hz/144Hz/240Hz, GPU usage %, CPU load %, VRAM).

### 2. Gamer Resolution Support
- **1080p Full HD (1920x1080, 16:9)**: Mainstream competitive eSports (144Hz - 360Hz).
- **1440p 2K QHD (2560x1440, 16:9)**: Gamer sweet spot for 27" and 32" gaming monitors.
- **4K Ultra HD (3840x2160, 16:9)**: Ultra enthusiast 4K OLED HDR gaming setups.
- **Ultrawide 21:9 (3440x1440 UW-QHD)**: Immersive curved ultrawide FOV for flight and racing sims.
- **Super Ultrawide 32:9 (5120x1440 Dual-QHD)**: Dual 1440p super-wide setup (Samsung Odyssey G9).

### 3. Broadest Video Format Engine Support (6 Formats)
- **MP4 (H.264 / H.265 HEVC)**: NVDEC / AMD VCN GPU-accelerated video decoding.
- **WebM (VP9 / AV1)**: High-compression open format for seamless animated loops.
- **MKV / AVI / MOV**: High-bitrate desktop media containers.
- **Looping Animated GIF & Cinemagraph WebP**: Instant loading retro pixel-art & ambient loops.
- **Interactive WebGL & Canvas Shaders**: GPU-rendered procedural shaders (Matrix Digital Rain, Synthwave Sun Grid, Audio Spectrum Waves, 3D Starfield Warp, Rain on Glass).
- **Direct Video Stream URLs & HLS Live Feeds**: Remote streaming video wallpaper support.

### 4. FX Studio & Real-time GPU Post-processing
- Realtime sliders for Brightness, Contrast, Saturation, Hue Rotation, Blur, Playback Speed (0.25x - 2.0x), and Volume.
- CRT Scanlines & Cyberpunk chromatic aberration HUD filter.
- Audio Reactivity sensitivity tuning.
- Aspect ratio fit modes (Cover/Fill, Contain/Fit, Stretch, Center).

### 5. Windows Native Runner & Export Pack Generator
- **PowerShell Script (`LivePaper_<title>.ps1`)**: Windows API `User32.dll` SendMessage timeout `0x052C` to `Progman` creating a `WorkerW` child window behind desktop icons.
- **Batch Launcher (`start-livepaper.bat`)**: 1-click execution script.
- **Lively Wallpaper Exporter (`LivelyInfo.json`)**: Compliant project package.
- **Wallpaper Engine Manifest (`project.json`)**: Seamless import for Wallpaper Engine users.

### 6. AI Dynamic Wallpaper Synthesizer
- Generates live wallpaper concepts, color palettes, and shader configurations using Emergent Universal LLM key.
- One-click activation into the simulator and export pack.

### 7. Multi-Monitor Gaming Manager
- 3-display visual stage (Primary Gaming 240Hz, Secondary Chat 144Hz, Ultrawide 21:9).
- Independent, Span (stretched), and Clone modes.

## Endpoints
- `GET /api/`
- `GET /api/wallpapers`
- `GET /api/wallpapers/{id}`
- `POST /api/wallpapers`
- `PUT /api/wallpapers/{id}`
- `DELETE /api/wallpapers/{id}`
- `POST /api/wallpapers/{id}/favorite`
- `POST /api/scripts/generate`
- `POST /api/ai/generate-wallpaper`
- `GET /api/monitors`
- `PUT /api/monitors`
- `GET /api/system/gaming-profiles`
- `GET /api/system/resolutions`
- `GET /api/system/formats`
