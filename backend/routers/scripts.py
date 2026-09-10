from fastapi import APIRouter, Request
from lib.db import db
from lib.win_runner import build_batch, build_powershell, windows_media_url
from models.script import ScriptExportRequest, ScriptExportResponse
import os

router = APIRouter(prefix="/scripts", tags=["scripts"])


def _public_base(request: Request) -> str:
    """The host the user is actually browsing beats any (possibly stale) APP_URL value —
    the Windows machine must be able to download the asset from this exact origin."""
    forwarded_host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    if forwarded_host and "localhost" not in forwarded_host and "127.0.0.1" not in forwarded_host:
        proto = request.headers.get("x-forwarded-proto", "https")
        return f"{proto}://{forwarded_host}".rstrip("/")
    return os.environ.get("APP_URL", "").rstrip("/")


def _absolute(url: str, base: str) -> str:
    """Windows runs the generated script off-site, so a site-relative asset path is useless there."""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return f"{base}{url}" if url.startswith("/") else f"{base}/{url}"


@router.post("/generate", response_model=ScriptExportResponse)
async def generate_windows_script(payload: ScriptExportRequest, request: Request):
    wallpaper = await db.wallpapers.find_one({"id": payload.wallpaper_id})
    if not wallpaper:
        wallpaper = {
            "id": payload.wallpaper_id,
            "title": "Custom Gamer Video Wallpaper",
            "format": "mp4",
            "media_url": "/wallpapers/neon-city.mp4",
            "fps": 60,
            "aspect_ratio": "16:9",
            "description": "High performance gamer live wallpaper for Windows desktop",
        }

    title = wallpaper.get("title", "LivePaper Windows")
    base = _public_base(request)
    # Windows decodes MP4/H.264 natively; webm/mkv/gif get swapped for their MP4 sibling.
    media_url = _absolute(windows_media_url(wallpaper.get("media_url", "")), base)
    thumb_url = _absolute(wallpaper.get("thumbnail_url", ""), base)
    format_type = wallpaper.get("format", "mp4")
    fps = payload.fps_limit or wallpaper.get("fps", 60)
    audio_param = "--no-audio" if not payload.audio_enabled or payload.volume == 0 else f"--volume={payload.volume}"
    safe_title = "".join(c if c.isalnum() or c in "-_" else "_" for c in title)[:48]

    if payload.script_type == "powershell":
        filename = f"LivePaper_{safe_title}.ps1"
        content = build_powershell(
            title=title,
            filename=filename,
            media_url=media_url,
            fmt=format_type,
            fps=fps,
            resolution=payload.resolution,
            fit_mode=payload.fit_mode,
            muted=not payload.audio_enabled or payload.volume == 0,
            volume=payload.volume,
            pause_fullscreen=payload.auto_pause_fullscreen,
        )
        instructions = [
            "1. Clique em 'Download Script' para baixar o arquivo .ps1.",
            "2. O Windows bloqueia .ps1 por duplo-clique. Abra o PowerShell na pasta do arquivo (Shift + botão direito > 'Abrir o PowerShell aqui') e rode: "
            f"powershell -ExecutionPolicy Bypass -File .\\{filename}",
            "3. Na primeira execução o vídeo é baixado para %LOCALAPPDATA%\\LivePaperPro (cache). Ele passa a rodar em loop atrás dos ícones da área de trabalho, com decodificação por GPU.",
            f"4. Para parar e restaurar o papel de parede: powershell -ExecutionPolicy Bypass -File .\\{filename} -Action Stop",
            "5. Dica: se preferir zero comandos, use a aba 'Launcher Batch (.bat)' — é só dar dois cliques.",
        ]

    elif payload.script_type == "batch":
        ps_inner = build_powershell(
            title=title,
            filename="LivePaper.ps1",
            media_url=media_url,
            fmt=format_type,
            fps=fps,
            resolution=payload.resolution,
            fit_mode=payload.fit_mode,
            muted=not payload.audio_enabled or payload.volume == 0,
            volume=payload.volume,
            pause_fullscreen=payload.auto_pause_fullscreen,
        )
        filename = f"Executar_LivePaper_{safe_title}.bat"
        content = build_batch(ps_inner, title)
        instructions = [
            "1. Baixe o arquivo .bat e dê DOIS CLIQUES nele. Não precisa instalar nada.",
            "2. Se o Windows SmartScreen avisar, clique em 'Mais informações' > 'Executar assim mesmo' (o script é texto puro, você pode ler antes).",
            "3. O launcher grava o motor em %LOCALAPPDATA%\\LivePaperPro\\LivePaper.ps1, baixa o vídeo e aplica o wallpaper animado na área de trabalho.",
            "4. Mantenha a janela aberta enquanto quiser o wallpaper; fechá-la encerra o vídeo.",
            "5. Para parar depois: powershell -ExecutionPolicy Bypass -File \"%LOCALAPPDATA%\\LivePaperPro\\LivePaper.ps1\" -Action Stop",
        ]

    elif payload.script_type == "lively_zip":
        filename = "LivelyInfo.json"
        content = f"""{{
  "AppVersion": "2.1.0.0",
  "Title": "{title}",
  "Thumbnail": "{thumb_url}",
  "Preview": "{thumb_url}",
  "Desc": "{wallpaper.get('description', '')} - Gamer Resolution: {payload.resolution}",
  "Author": "{wallpaper.get('author', 'LivePaper Studio')}",
  "License": "MIT",
  "Contact": "https://wallpaper-engine-pro.preview.emergentagent.com",
  "Type": 1,
  "FileName": "{media_url}",
  "Arguments": "--loop --fps={fps} {audio_param}",
  "IsAbsolutePath": true
}}"""
        instructions = [
            "1. Baixe o arquivo LivelyInfo.json.",
            "2. Abra o Lively Wallpaper no Windows e clique em '+' (Adicionar wallpaper).",
            f"3. Cole a URL do vídeo ({media_url}) ou arraste o LivelyInfo.json junto ao arquivo de vídeo.",
            f"4. Aproveite resolução nativa {payload.resolution} e até 240Hz.",
        ]

    else:  # wallpaper_engine_json
        filename = "project.json"
        tags_json = "[\"Gaming\", \"Cyberpunk\", \"Video\", \"4K\"]"
        content = f"""{{
  "contentrating": "Everyone",
  "description": "{wallpaper.get('description', '')} [Gamer Edition: {payload.resolution}]",
  "file": "{media_url}",
  "general": {{
    "properties": {{
      "schemecolor": {{
        "order": 0,
        "text": "ui_browse_properties_scheme_color",
        "type": "color",
        "value": "0 0.94 1"
      }},
      "playbackrate": {{
        "fraction": true,
        "max": 2,
        "min": 0.25,
        "order": 1,
        "text": "Playback Speed",
        "type": "slider",
        "value": 1
      }}
    }}
  }},
  "preview": "{thumb_url}",
  "tags": {tags_json},
  "title": "{title}",
  "type": "video",
  "version": 1,
  "visibility": "public"
}}"""
        instructions = [
            "1. Baixe o manifesto project.json.",
            f"2. Baixe também o vídeo em {media_url} e coloque os dois na mesma pasta nova dentro de 'Steam/steamapps/common/wallpaper_engine/projects/myprojects'.",
            "3. Ajuste o campo 'file' para o nome local do vídeo caso queira uso offline.",
            "4. O Wallpaper Engine carregará o projeto com as propriedades gamer personalizadas.",
        ]

    return ScriptExportResponse(
        script_type=payload.script_type,
        filename=filename,
        content=content,
        instructions=instructions,
        download_ready=True,
        metadata={
            "title": title,
            "media_url": media_url,
            "fps": fps,
            "resolution": payload.resolution,
        },
    )
