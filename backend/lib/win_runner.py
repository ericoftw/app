"""Real, runnable Windows 10/11 live-wallpaper runner generation.

The PowerShell script produced here actually works: it downloads the video to
%LOCALAPPDATA%\\LivePaperPro, hooks the Windows desktop WorkerW layer and plays the
loop behind the desktop icons using WPF MediaElement (hardware decoded H.264).
The .bat launcher embeds the same script as base64 so a double-click bypasses the
PowerShell ExecutionPolicy block that stops most .ps1 files from running.
"""
import base64

# MediaElement can only decode what Windows ships codecs for -> always hand it MP4/H.264.
_WINDOWS_SAFE_EXT = (".mp4", ".wmv", ".m4v", ".avi")


def windows_media_url(url: str) -> str:
    """Swap a webm/mkv/gif asset for its MP4 sibling (every bundled asset has one)."""
    low = url.lower()
    if low.endswith(_WINDOWS_SAFE_EXT):
        return url
    for ext in (".webm", ".mkv", ".gif", ".webp"):
        if low.endswith(ext):
            return url[: -len(ext)] + ".mp4"
    return url


_FIT_MAP = {"cover": "UniformToFill", "contain": "Uniform", "fit": "Uniform", "stretch": "Fill", "fill": "Fill"}


PS_TEMPLATE = r'''# =============================================================================
#  LIVEPAPER ENGINE PRO - WINDOWS 10/11 LIVE WALLPAPER RUNNER
#  Wallpaper: __TITLE__
#  Formato: __FORMAT__ | FPS alvo: __FPS__ | Resolucao: __RESOLUTION__
#
#  COMO USAR:
#    powershell -ExecutionPolicy Bypass -File .\__FILENAME__
#  PARA PARAR:
#    powershell -ExecutionPolicy Bypass -File .\__FILENAME__ -Action Stop
# =============================================================================
[CmdletBinding()]
param(
    [string]$VideoUrl = "__VIDEO_URL__",
    [ValidateSet('Start','Stop')][string]$Action = 'Start',
    [int]$TargetFPS = __FPS__,
    [string]$FitMode = "__FIT__",
    [bool]$Muted = $__MUTED__,
    [double]$Volume = __VOLUME__,
    [bool]$PauseOnFullscreen = $__PAUSE__
)

$ErrorActionPreference = 'Stop'
$AppDir  = Join-Path $env:LOCALAPPDATA 'LivePaperPro'
$PidFile = Join-Path $AppDir 'livepaper.pid'
New-Item -ItemType Directory -Force -Path $AppDir | Out-Null

# --- encerra qualquer instancia anterior -------------------------------------
if (Test-Path $PidFile) {
    foreach ($old in (Get-Content $PidFile)) {
        try { Stop-Process -Id ([int]$old) -Force -ErrorAction SilentlyContinue } catch {}
    }
    Remove-Item $PidFile -Force -ErrorAction SilentlyContinue
}
if ($Action -eq 'Stop') {
    Start-Process -FilePath "RUNDLL32.EXE" -ArgumentList "user32.dll,UpdatePerUserSystemParameters" -WindowStyle Hidden
    Write-Host "[+] LivePaper encerrado. Area de trabalho restaurada." -ForegroundColor Yellow
    exit 0
}
$PID | Set-Content -Path $PidFile -Encoding ASCII

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  LIVEPAPER ENGINE PRO  |  __TITLE__" -ForegroundColor Green
Write-Host "  Resolucao: __RESOLUTION__ @ __FPS__ FPS" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# --- baixa o video uma unica vez (cache local) ------------------------------
$leaf = [System.IO.Path]::GetFileName(([Uri]$VideoUrl).LocalPath)
if ([string]::IsNullOrWhiteSpace($leaf)) { $leaf = 'livepaper.mp4' }
$LocalFile = Join-Path $AppDir $leaf
if (-not (Test-Path $LocalFile) -or (Get-Item $LocalFile).Length -lt 1024) {
    Write-Host "[*] Baixando video: $VideoUrl" -ForegroundColor Gray
    try {
        [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
        Invoke-WebRequest -Uri $VideoUrl -OutFile $LocalFile -UseBasicParsing
    } catch {
        Write-Host "[X] Falha ao baixar o video: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    Verifique sua conexao ou coloque um arquivo .mp4 em $AppDir" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[+] Video pronto: $LocalFile" -ForegroundColor Green

Add-Type -AssemblyName PresentationCore, PresentationFramework, WindowsBase, System.Windows.Forms

$native = @'
using System;
using System.Runtime.InteropServices;
public class LivePaperNative {
    public struct RECT { public int Left, Top, Right, Bottom; }
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")] public static extern IntPtr FindWindow(string c, string w);
    [DllImport("user32.dll")] public static extern IntPtr FindWindowEx(IntPtr p, IntPtr after, string c, string w);
    [DllImport("user32.dll")] public static extern IntPtr SendMessageTimeout(IntPtr h, uint msg, IntPtr wp, IntPtr lp, uint flags, uint timeout, out IntPtr res);
    [DllImport("user32.dll")] public static extern IntPtr SetParent(IntPtr child, IntPtr parent);
    [DllImport("user32.dll")] public static extern bool MoveWindow(IntPtr h, int x, int y, int w, int he, bool repaint);
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc cb, IntPtr lp);
    [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
    [DllImport("user32.dll")] public static extern int GetSystemMetrics(int index);

    static IntPtr worker = IntPtr.Zero;

    public static IntPtr GetWorkerW() {
        IntPtr progman = FindWindow("Progman", null);
        IntPtr res;
        SendMessageTimeout(progman, 0x052C, IntPtr.Zero, IntPtr.Zero, 0, 1000, out res);
        SendMessageTimeout(progman, 0x052C, new IntPtr(0x0000000D), new IntPtr(0x00000001), 0, 1000, out res);
        worker = IntPtr.Zero;
        EnumWindows(delegate(IntPtr top, IntPtr lp) {
            if (FindWindowEx(top, IntPtr.Zero, "SHELLDLL_DefView", null) != IntPtr.Zero) {
                IntPtr w = FindWindowEx(IntPtr.Zero, top, "WorkerW", null);
                if (w != IntPtr.Zero) worker = w;
            }
            return true;
        }, IntPtr.Zero);
        if (worker == IntPtr.Zero) worker = FindWindowEx(progman, IntPtr.Zero, "WorkerW", null);
        if (worker == IntPtr.Zero) worker = progman;
        return worker;
    }

    public static bool FullscreenActive() {
        IntPtr fg = GetForegroundWindow();
        if (fg == IntPtr.Zero) return false;
        if (fg == FindWindow("Progman", null) || fg == FindWindow("WorkerW", null)) return false;
        RECT r;
        if (!GetWindowRect(fg, out r)) return false;
        return (r.Right - r.Left) >= GetSystemMetrics(0) && (r.Bottom - r.Top) >= GetSystemMetrics(1);
    }
}
'@
if (-not ('LivePaperNative' -as [type])) { Add-Type -TypeDefinition $native -Language CSharp }

# --- janela WPF com o video em loop -----------------------------------------
$vs = [System.Windows.Forms.SystemInformation]::VirtualScreen

$script:media = New-Object System.Windows.Controls.MediaElement
$script:media.LoadedBehavior   = [System.Windows.Controls.MediaState]::Manual
$script:media.UnloadedBehavior = [System.Windows.Controls.MediaState]::Manual
$script:media.Stretch          = [System.Windows.Media.Stretch]::$FitMode
$script:media.IsMuted          = $Muted
$script:media.Volume           = $Volume
$script:media.Source           = [Uri]$LocalFile
$script:media.Add_MediaEnded({ $script:media.Position = [TimeSpan]::Zero; $script:media.Play() })
$script:media.Add_MediaFailed({ Write-Host "[X] Windows nao conseguiu decodificar o video (instale o HEVC/AV1 ou use MP4 H.264)." -ForegroundColor Red })

$win = New-Object System.Windows.Window
$win.WindowStyle           = [System.Windows.WindowStyle]::None
$win.ResizeMode            = [System.Windows.ResizeMode]::NoResize
$win.ShowInTaskbar         = $false
$win.Topmost               = $false
$win.WindowStartupLocation = [System.Windows.WindowStartupLocation]::Manual
$win.Background            = [System.Windows.Media.Brushes]::Black
$win.Left = $vs.Left; $win.Top = $vs.Top; $win.Width = $vs.Width; $win.Height = $vs.Height
$win.Content = $script:media
$win.Show()

$hwnd   = (New-Object System.Windows.Interop.WindowInteropHelper($win)).Handle
$worker = [LivePaperNative]::GetWorkerW()
[LivePaperNative]::SetParent($hwnd, $worker) | Out-Null
[LivePaperNative]::MoveWindow($hwnd, 0, 0, $vs.Width, $vs.Height, $true) | Out-Null
$script:media.Play()

Write-Host "[+] Wallpaper ativo atras dos icones da area de trabalho!" -ForegroundColor Green
Write-Host "[i] Para parar: -Action Stop (ou feche esta janela do PowerShell)" -ForegroundColor Yellow

if ($PauseOnFullscreen) {
    $timer = New-Object System.Windows.Threading.DispatcherTimer
    $timer.Interval = [TimeSpan]::FromSeconds(2)
    $timer.Add_Tick({
        if ([LivePaperNative]::FullscreenActive()) { $script:media.Pause() } else { $script:media.Play() }
    })
    $timer.Start()
}

# mantem o runner vivo bombeando a fila de mensagens do WPF
[System.Windows.Threading.Dispatcher]::Run()
'''


def build_powershell(*, title: str, filename: str, media_url: str, fmt: str, fps: int,
                     resolution: str, fit_mode: str, muted: bool, volume: int,
                     pause_fullscreen: bool) -> str:
    fit = _FIT_MAP.get((fit_mode or "cover").lower(), "UniformToFill")
    safe_title = title.replace('"', "'")
    return (PS_TEMPLATE
            .replace("__TITLE__", safe_title)
            .replace("__FILENAME__", filename)
            .replace("__VIDEO_URL__", media_url)
            .replace("__FORMAT__", (fmt or "mp4").upper())
            .replace("__FPS__", str(fps))
            .replace("__RESOLUTION__", resolution)
            .replace("__FIT__", fit)
            .replace("__MUTED__", "true" if muted else "false")
            .replace("__VOLUME__", f"{max(0, min(100, volume)) / 100:.2f}")
            .replace("__PAUSE__", "true" if pause_fullscreen else "false"))


def build_batch(ps_content: str, title: str) -> str:
    """Self-contained .bat: rebuilds the .ps1 from base64 and runs it with ExecutionPolicy Bypass."""
    b64 = base64.b64encode(ps_content.encode("utf-8")).decode("ascii")
    chunks = [b64[i:i + 200] for i in range(0, len(b64), 200)]
    echo_lines = "\n".join(f'>>"%B64%" echo {c}' for c in chunks)
    safe_title = title.replace("%", "").replace("^", "").replace("&", "e")
    return f"""@echo off
:: =========================================================================
::  LIVEPAPER ENGINE PRO - LAUNCHER 1-CLICK PARA WINDOWS 10/11
::  Wallpaper: {safe_title}
::  Basta dar DOIS CLIQUES neste arquivo. Nada mais precisa ser instalado.
:: =========================================================================
setlocal
title LivePaper Pro - {safe_title}
color 0B
set "DIR=%LOCALAPPDATA%\\LivePaperPro"
set "PS1=%DIR%\\LivePaper.ps1"
set "B64=%TEMP%\\livepaper_payload.b64"
if not exist "%DIR%" mkdir "%DIR%"
if exist "%B64%" del /q "%B64%"

echo [*] Preparando o motor de wallpaper...
{echo_lines}

powershell -NoProfile -ExecutionPolicy Bypass -Command "[IO.File]::WriteAllBytes('%PS1%', [Convert]::FromBase64String(((Get-Content '%B64%') -join '')))"
del /q "%B64%"

echo [*] Iniciando LivePaper na area de trabalho...
powershell -NoProfile -ExecutionPolicy Bypass -File "%PS1%"

echo.
echo [i] Para parar o wallpaper rode:
echo     powershell -ExecutionPolicy Bypass -File "%PS1%" -Action Stop
pause
"""
