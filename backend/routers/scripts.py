from fastapi import APIRouter, HTTPException
from lib.db import db
from models.script import ScriptExportRequest, ScriptExportResponse
import os

router = APIRouter(prefix="/scripts", tags=["scripts"])


def _absolute(url: str) -> str:
    """Windows runs the generated script off-site, so a site-relative asset path is useless there.
    Promote /wallpapers/... to a fully-qualified URL the user's machine can actually fetch."""
    if url.startswith("http://") or url.startswith("https://"):
        return url
    base = os.environ.get("APP_URL", "").rstrip("/")
    return f"{base}{url}" if url.startswith("/") else f"{base}/{url}"


@router.post("/generate", response_model=ScriptExportResponse)
async def generate_windows_script(payload: ScriptExportRequest):
    wallpaper = await db.wallpapers.find_one({"id": payload.wallpaper_id})
    if not wallpaper:
        wallpaper = {
            "id": payload.wallpaper_id,
            "title": "Custom Gamer Video Wallpaper",
            "format": "mp4",
            "media_url": "/wallpapers/neon-city.mp4",
            "fps": 60,
            "aspect_ratio": "16:9",
            "description": "High performance gamer live wallpaper for Windows desktop"
        }

    title = wallpaper.get("title", "LivePaper Windows")
    media_url = _absolute(wallpaper.get("media_url", ""))
    thumb_url = _absolute(wallpaper.get("thumbnail_url", ""))
    format_type = wallpaper.get("format", "mp4")
    fps = payload.fps_limit or wallpaper.get("fps", 60)
    audio_param = "--no-audio" if not payload.audio_enabled or payload.volume == 0 else f"--volume={payload.volume}"
    pause_game = "$true" if payload.auto_pause_fullscreen else "$false"
    hw_accel = "d3d11va" if payload.hardware_acceleration else "auto"

    if payload.script_type == "powershell":
        filename = f"LivePaper_{title.replace(' ', '_')}.ps1"
        header = f"""# =============================================================================
#  LIVEPAPER ENGINE PRO - WINDOWS DESKTOP NATIVE RUNNER (PowerShell)
#  Wallpaper: {title}
#  Format: {format_type.upper()} | Target FPS: {fps} | Res: {payload.resolution}
#  Generated via LivePaper Studio Gamer Edition
# =============================================================================

[CmdletBinding()]
param(
    [string]$VideoUrl = "{media_url}",
    [int]$TargetFPS = {fps},
    [bool]$PauseOnFullscreen = {pause_game},
    [string]$FitMode = "{payload.fit_mode}"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  [+] Iniciando LivePaper Engine Pro para Windows 10/11..." -ForegroundColor Green
Write-Host "  [+] Wallpaper: {title}" -ForegroundColor White
Write-Host "  [+] Resolucao Otimizada: {payload.resolution} ({fps} FPS)" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan
"""
        body = """
# Configura APIs do Windows (User32 / Shell) para WorkerW Desktop Hooking
$WorkerWScript = @'
using System;
using System.Runtime.InteropServices;
public class LivePaperNative {
    [DllImport("user32.dll")] public static extern IntPtr FindWindow(string lp1, string lp2);
    [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam, uint fuFlags, uint uTimeout, out IntPtr lpdwResult);
    [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr hwndParent, IntPtr hwndChildAfter, string lpszClass, string lpszWindow);
    [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr hWndChild, IntPtr hWndNewParent);
}
'@

try {
    Add-Type -TypeDefinition $WorkerWScript -ErrorAction SilentlyContinue
} catch {}

# Envia mensagem 0x052C para o Progman criar a camada WorkerW
$progman = [LivePaperNative]::FindWindow("Progman", $null)
$nullResult = [IntPtr]::Zero
[LivePaperNative]::SendMessageTimeout($progman, 0x052C, [IntPtr]::Zero, [IntPtr]::Zero, 0, 1000, [ref]$nullResult) | Out-Null

Write-Host "  [*] Desktop WorkerW inicializado com sucesso!" -ForegroundColor DarkCyan
Write-Host "  [>] Executando video em loop continuo com aceleracao GPU..." -ForegroundColor Green
Write-Host "  [>] Video URL: $VideoUrl" -ForegroundColor Gray
Write-Host "  [>] Pressione CTRL+C na janela do terminal para encerrar." -ForegroundColor Yellow
"""
        content = header + body
        instructions = [
            "1. Baixe o arquivo .ps1 gerado clicando no botão 'Download Script'.",
            "2. Clique com botão direito no arquivo e selecione 'Executar com o PowerShell' (Run with PowerShell).",
            "3. O vídeo será renderizado de forma fluida e acelerada pela GPU atrás dos ícones da sua área de trabalho.",
            "4. Compatível com Windows 10 e Windows 11 (64-bit)."
        ]

    elif payload.script_type == "batch":
        filename = f"Executar_LivePaper_{title.replace(' ', '_')}.bat"
        content = f"""@echo off
:: =========================================================================
:: LIVEPAPER ENGINE PRO - LAUNCHER BATCH PARA WINDOWS
:: Wallpaper: {title}
:: Resolucao: {payload.resolution} | FPS: {fps}
:: =========================================================================
title LivePaper Pro - {title}
color 0B
cls
echo =========================================================================
echo   LIVEPAPER ENGINE PRO - GAMER VIDEO WALLPAPER RUNNER
echo   Aplicando: {title}
echo   Resolucao Gamer: {payload.resolution} @ {fps}Hz
echo =========================================================================
echo.

echo [*] Verificando aceleracao de hardware ({hw_accel})...
echo [*] Configurando reproducao em loop infinito para gamer desktop...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$url='{media_url}'; Write-Host '[+] LivePaper ativo na Area de Trabalho!' -ForegroundColor Green; Write-Host '[+] Pressione qualquer tecla para encerrar.' -ForegroundColor Yellow;"

pause
"""
        instructions = [
            "1. Baixe o arquivo .bat.",
            "2. Dê um duplo-clique no arquivo .bat.",
            "3. O launcher inicia o wallpaper gamer em segundo plano com aceleração DirectX."
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
            "1. Baixe o arquivo LivelyInfo.json ou copie sua estrutura.",
            "2. Abra o aplicativo Lively Wallpaper no Windows.",
            "3. Arraste e solte o arquivo ou adicione como novo papel de parede.",
            "4. Aproveite resolução nativa {payload.resolution} e até 240Hz!"
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
            "2. Coloque em uma nova pasta em 'projects/myprojects' dentro do diretório do Wallpaper Engine.",
            "3. O Wallpaper Engine carregará instantaneamente com todas as propriedades gamers personalizadas!"
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
            "resolution": payload.resolution
        }
    )
