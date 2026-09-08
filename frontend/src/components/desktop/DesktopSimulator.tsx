import React, { useState, useEffect, useRef } from "react";
import { 
  Monitor, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Maximize2, 
  Minimize2, 
  Sliders, 
  Activity, 
  Tv, 
  Folder, 
  HardDrive, 
  Trash2, 
  Gamepad2, 
  Radio, 
  Sparkles, 
  Search, 
  Wifi, 
  BatteryCharging, 
  Terminal, 
  Settings 
} from "lucide-react";
import type { Wallpaper, GamerResolutionKey } from "@/types/wallpaper";
import { ShaderRenderer } from "./ShaderRenderer";
import { toast } from "sonner";

interface DesktopSimulatorProps {
  wallpaper: Wallpaper;
  resolution: GamerResolutionKey;
  onResolutionChange: (res: GamerResolutionKey) => void;
  brightness: number;
  contrast: number;
  saturation: number;
  hueRotate: number;
  blur: number;
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  onToggleMute: () => void;
  crtFilter: boolean;
  onToggleCrt: () => void;
  fitMode: "cover" | "contain" | "stretch" | "center";
  audioReactive: boolean;
  onOpenFxStudio: () => void;
  onOpenScriptModal: () => void;
  onOpenAiStudio: () => void;
}

const RESOLUTION_CONFIGS: Record<GamerResolutionKey, { label: string; aspect: string; widthPx: string; badge: string }> = {
  "1080p": { label: "1080p FHD (1920x1080)", aspect: "aspect-video", widthPx: "100%", badge: "16:9 eSports" },
  "1440p": { label: "1440p 2K QHD (2560x1440)", aspect: "aspect-video", widthPx: "100%", badge: "16:9 Sweet Spot" },
  "4k": { label: "4K UHD (3840x2160)", aspect: "aspect-video", widthPx: "100%", badge: "16:9 4K OLED" },
  "ultrawide_21_9": { label: "Ultrawide 21:9 (3440x1440)", aspect: "aspect-[21/9]", widthPx: "100%", badge: "21:9 Imersivo" },
  "super_ultrawide_32_9": { label: "Super Ultrawide 32:9 (5120x1440)", aspect: "aspect-[32/9]", widthPx: "100%", badge: "32:9 Dual-QHD" },
};

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  wallpaper,
  resolution,
  onResolutionChange,
  brightness,
  contrast,
  saturation,
  hueRotate,
  blur,
  playbackSpeed,
  volume,
  isMuted,
  onToggleMute,
  crtFilter,
  onToggleCrt,
  fitMode,
  audioReactive,
  onOpenFxStudio,
  onOpenScriptModal,
  onOpenAiStudio,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fpsCounter, setFpsCounter] = useState(wallpaper.fps || 60);
  const [gpuLoad, setGpuLoad] = useState(3.4);
  const [audioBarPulse, setAudioBarPulse] = useState<number[]>([40, 65, 85, 95, 70, 50, 90, 60]);
  // If a remote video source is unreachable/undecodable, fall back to the GPU shader engine
  // so the desktop is never a black rectangle.
  const [videoFailed, setVideoFailed] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Reset the failure flag whenever a new wallpaper is applied.
  useEffect(() => {
    setVideoFailed(false);
  }, [wallpaper.id, wallpaper.media_url]);

  // Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Simulated telemetry jitter
  useEffect(() => {
    const targetFps = wallpaper.fps || 60;
    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 2;
      setFpsCounter(Math.round(targetFps + jitter));
      setGpuLoad(Number((2.8 + Math.random() * 1.5).toFixed(1)));

      if (audioReactive) {
        setAudioBarPulse(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 80 + 20))
        );
      }
    }, 800);
    return () => clearInterval(interval);
  }, [wallpaper.fps, audioReactive]);

  // Video playback speed and volume sync.
  // `muted` must be set as a DOM *property* (not just the JSX attribute) or Chrome's
  // autoplay policy blocks play() and the wallpaper sits on a paused first frame.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = isMuted;
    v.playbackRate = playbackSpeed;
    v.volume = isMuted ? 0 : volume / 100;
    if (isPlaying) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [playbackSpeed, volume, isMuted, isPlaying, wallpaper.media_url, videoFailed]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play().catch(() => {});
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  const currentResConfig = RESOLUTION_CONFIGS[resolution];

  // CSS filter string
  const filterString = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) hue-rotate(${hueRotate}deg) blur(${blur}px)`;

  // Fit style
  const fitClass = 
    fitMode === "cover" ? "object-cover" :
    fitMode === "contain" ? "object-contain" :
    fitMode === "stretch" ? "object-fill" : "object-none";

  const handleDesktopIconClick = (appName: string) => {
    toast.info(`Aplicativo Windows: ${appName}`, {
      description: `Simulação de desktop gamer executando sobre o wallpaper em vídeo "${wallpaper.title}".`,
      duration: 3000
    });
  };

  return (
    <div 
      className="flex flex-col gap-3 w-full"
      data-testid="desktop-simulator-wrapper"
    >
      {/* Top HUD Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#0B0E14]/90 border border-cyan-500/20 backdrop-blur-md">
        {/* Active Resolution & Preset */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono">
            <Monitor className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-semibold">{currentResConfig.label}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 uppercase">
              {currentResConfig.badge}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-white font-bold">{fpsCounter} FPS</span>
            <span className="text-[10px] text-purple-300">GPU: {gpuLoad}%</span>
          </div>
        </div>

        {/* Aspect Ratio Quick Switcher Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
          {(["1080p", "1440p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"] as GamerResolutionKey[]).map((resKey) => {
            const isSelected = resolution === resKey;
            const shortLabel = 
              resKey === "1080p" ? "1080p FHD" :
              resKey === "1440p" ? "1440p 2K" :
              resKey === "4k" ? "4K UHD" :
              resKey === "ultrawide_21_9" ? "21:9 UW" : "32:9 Super UW";
            return (
              <button
                key={resKey}
                onClick={() => onResolutionChange(resKey)}
                data-testid={`aspect-ratio-${resKey}`}
                className={`px-2.5 py-1 text-xs rounded-lg font-mono font-medium transition-all ${
                  isSelected
                    ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]"
                    : "bg-[#141A28] text-slate-300 hover:bg-cyan-500/20 hover:text-cyan-300 border border-white/5"
                }`}
              >
                {shortLabel}
              </button>
            );
          })}
        </div>

        {/* Quick Simulator Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleCrt}
            title="Efeito CRT Scanlines Gamer"
            data-testid="toggle-crt-button"
            className={`p-2 rounded-lg text-xs font-mono transition-all border ${
              crtFilter 
                ? "bg-pink-500/20 text-pink-400 border-pink-500/40 shadow-[0_0_10px_rgba(255,0,85,0.4)]" 
                : "bg-[#141A28] text-slate-400 hover:text-white border-white/5"
            }`}
          >
            <Tv className="w-4 h-4" />
          </button>

          <button
            onClick={onToggleMute}
            title={isMuted ? "Desmutar Áudio" : "Mutar Áudio"}
            data-testid="toggle-mute-button"
            className="p-2 rounded-lg bg-[#141A28] text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-white/5 text-xs transition-all"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={togglePlayPause}
            title={isPlaying ? "Pausar Wallpaper" : "Reproduzir Wallpaper"}
            data-testid="toggle-play-button"
            className="p-2 rounded-lg bg-[#141A28] text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-white/5 text-xs transition-all"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-cyan-400" />}
          </button>

          <button
            onClick={onOpenFxStudio}
            title="Ajustes de Vídeo & FX Studio"
            data-testid="open-fx-studio-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold transition-all"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">FX Studio</span>
          </button>

          <button
            onClick={onOpenScriptModal}
            title="Exportar para Windows / Lively"
            data-testid="open-export-modal-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)]"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Executar no Windows</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Tela Cheia / Modo Imersivo"
            data-testid="toggle-fullscreen-button"
            className="p-2 rounded-lg bg-[#141A28] text-slate-400 hover:text-white border border-white/5 text-xs transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Desktop Simulator Screen */}
      <div 
        ref={containerRef}
        className={`relative w-full overflow-hidden rounded-2xl border-2 border-cyan-500/30 shadow-[0_0_35px_rgba(0,240,255,0.15)] bg-[#06070B] ${
          isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : currentResConfig.aspect
        }`}
        style={{ minHeight: isFullscreen ? "100vh" : "460px" }}
        data-testid="desktop-simulator-screen"
      >
        {/* Wallpaper Render Layer */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden"
          style={{ filter: filterString }}
        >
          {wallpaper.format === "shader" || videoFailed ? (
            <ShaderRenderer
              shaderType={wallpaper.shader_type || "matrix_rain"}
              params={wallpaper.shader_params}
              fpsLimit={wallpaper.fps || 60}
              audioReactive={audioReactive}
            />
          ) : (
            <video
              ref={videoRef}
              src={wallpaper.media_url}
              autoPlay
              loop
              muted
              playsInline
              onError={() => setVideoFailed(true)}
              onLoadedData={(e) => {
                // Kick playback once the media is decodable — covers the case where the
                // sync effect ran before this element finished loading its new source.
                const v = e.currentTarget;
                v.muted = isMuted;
                v.playbackRate = playbackSpeed;
                if (isPlaying) v.play().catch(() => {});
              }}
              className={`w-full h-full ${fitClass}`}
              data-testid="live-video-element"
            />
          )}
        </div>

        {/* CRT Scanline Overlay */}
        {crtFilter && (
          <div className="absolute inset-0 scanlines z-10 pointer-events-none" />
        )}

        {/* Audio Reactive Holographic Visualizer Overlay */}
        {audioReactive && (
          <div 
            className="absolute bottom-16 right-6 z-20 flex items-end gap-1.5 p-3 rounded-xl bg-black/40 backdrop-blur-md border border-cyan-500/20 pointer-events-none"
            data-testid="desktop-audio-visualizer"
          >
            <Radio className="w-3.5 h-3.5 text-cyan-400 mr-1 animate-pulse" />
            {audioBarPulse.map((heightPct, idx) => (
              <div
                key={idx}
                className="w-1.5 rounded-full transition-all duration-150"
                style={{
                  height: `${heightPct * 0.4}px`,
                  background: idx % 2 === 0 ? "linear-gradient(to top, #00F0FF, #7000FF)" : "linear-gradient(to top, #FF0055, #FFD700)",
                  boxShadow: "0 0 6px rgba(0, 240, 255, 0.6)"
                }}
              />
            ))}
            <span className="text-[10px] font-mono text-cyan-300 ml-1">AUDIO REACT</span>
          </div>
        )}

        {/* Desktop Hologram Clock Widget */}
        <div className="absolute top-6 right-6 z-20 flex flex-col items-end p-4 rounded-2xl bg-black/40 backdrop-blur-md border border-white/10 pointer-events-none select-none">
          <div className="text-3xl lg:text-4xl font-extrabold font-mono text-cyan-400 tracking-wider drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
            {currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
          </div>
          <div className="text-xs font-mono text-slate-300 tracking-wide mt-1 uppercase">
            {currentTime.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })}
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[11px] font-mono text-purple-300">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
            <span>DIRECTX 12 LIVE ENGINE</span>
          </div>
        </div>

        {/* Desktop Icons (Windows Style) */}
        <div className="absolute top-6 left-6 z-20 flex flex-col gap-5 select-none">
          <button
            onClick={() => handleDesktopIconClick("Este Computador")}
            className="flex flex-col items-center gap-1.5 group p-2 rounded-lg hover:bg-white/10 transition-all text-center w-20"
            data-testid="icon-this-pc"
          >
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/40 text-blue-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.5)] transition-all">
              <HardDrive className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Este PC</span>
          </button>

          <button
            onClick={() => handleDesktopIconClick("Lixeira")}
            className="flex flex-col items-center gap-1.5 group p-2 rounded-lg hover:bg-white/10 transition-all text-center w-20"
            data-testid="icon-recycle-bin"
          >
            <div className="p-2 rounded-xl bg-slate-500/20 border border-slate-400/40 text-slate-300 group-hover:scale-110 transition-all">
              <Trash2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Lixeira</span>
          </button>

          <button
            onClick={() => handleDesktopIconClick("Cyberpunk 2077")}
            className="flex flex-col items-center gap-1.5 group p-2 rounded-lg hover:bg-white/10 transition-all text-center w-20"
            data-testid="icon-cyberpunk-game"
          >
            <div className="p-2 rounded-xl bg-yellow-500/20 border border-yellow-400/40 text-yellow-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Cyberpunk</span>
          </button>

          <button
            onClick={() => handleDesktopIconClick("LivePaper Engine Pro")}
            className="flex flex-col items-center gap-1.5 group p-2 rounded-lg hover:bg-cyan-500/20 transition-all text-center w-20"
            data-testid="icon-livepaper-app"
          >
            <div className="p-2 rounded-xl bg-cyan-500/30 border border-cyan-400 text-cyan-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.8)] transition-all">
              <Sparkles className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-cyan-300 font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">LivePaper Pro</span>
          </button>

          <button
            onClick={() => handleDesktopIconClick("Papéis de Parede 4K")}
            className="flex flex-col items-center gap-1.5 group p-2 rounded-lg hover:bg-white/10 transition-all text-center w-20"
            data-testid="icon-wallpapers-folder"
          >
            <div className="p-2 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 group-hover:scale-110 transition-all">
              <Folder className="w-6 h-6" />
            </div>
            <span className="text-[11px] text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Wallpapers 4K</span>
          </button>
        </div>

        {/* Windows Start Menu Popup */}
        {isStartMenuOpen && (
          <div 
            className="absolute bottom-14 left-1/2 -translate-x-1/2 z-40 w-96 max-w-[90vw] p-5 rounded-2xl bg-[#0B0E14]/95 border border-cyan-500/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-5 duration-200"
            data-testid="windows-start-menu-popup"
          >
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <div className="p-2 rounded-xl bg-cyan-500 text-black font-black">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">LivePaper Engine Pro</h4>
                <p className="text-xs text-cyan-400 font-mono">Windows 11 Gaming Companion</p>
              </div>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fixados</span>
              <div className="grid grid-cols-4 gap-3 mt-3">
                <button 
                  onClick={() => { setIsStartMenuOpen(false); onOpenFxStudio(); }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-center transition-all"
                >
                  <Sliders className="w-5 h-5 text-cyan-400" />
                  <span className="text-[11px] text-slate-200">FX Studio</span>
                </button>
                <button 
                  onClick={() => { setIsStartMenuOpen(false); onOpenScriptModal(); }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-center transition-all"
                >
                  <Terminal className="w-5 h-5 text-green-400" />
                  <span className="text-[11px] text-slate-200">Scripts .ps1</span>
                </button>
                <button 
                  onClick={() => { setIsStartMenuOpen(false); onOpenAiStudio(); }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-center transition-all"
                >
                  <Sparkles className="w-5 h-5 text-pink-400" />
                  <span className="text-[11px] text-slate-200">AI Synthesizer</span>
                </button>
                <button 
                  onClick={() => { setIsStartMenuOpen(false); handleDesktopIconClick("Configurações Gamer"); }}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-white/10 text-center transition-all"
                >
                  <Settings className="w-5 h-5 text-purple-400" />
                  <span className="text-[11px] text-slate-200">Ajustes</span>
                </button>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-[#141A28] border border-white/5 flex items-center justify-between text-xs">
              <span className="text-slate-300">Wallpaper Atual:</span>
              <span className="text-cyan-400 font-bold truncate max-w-[160px]">{wallpaper.title}</span>
            </div>
          </div>
        )}

        {/* Windows 11/10 Taskbar */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-12 bg-[#0B0E14]/85 backdrop-blur-xl border-t border-cyan-500/20 z-30 flex items-center justify-between px-3 select-none"
          data-testid="windows-taskbar"
        >
          {/* Left / Widgets area */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono text-slate-300 cursor-pointer">
              <span className="text-cyan-400">22°C</span>
              <span className="text-slate-400">São Paulo, BR</span>
            </div>
          </div>

          {/* Centered Taskbar Icons (Windows 11 Style) */}
          <div className="flex items-center gap-1.5 absolute left-1/2 -translate-x-1/2">
            {/* Start Button */}
            <button
              onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
              data-testid="windows-start-button"
              className={`p-2 rounded-lg transition-all ${
                isStartMenuOpen
                  ? "bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.8)]"
                  : "hover:bg-white/10 text-cyan-400"
              }`}
            >
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current rounded-[1px]" />
                <div className="bg-current rounded-[1px]" />
                <div className="bg-current rounded-[1px]" />
                <div className="bg-current rounded-[1px]" />
              </div>
            </button>

            {/* Search */}
            <button 
              onClick={() => toast.info("Pesquisa do Windows", { description: "Digite para procurar papéis de parede, jogos ou aplicativos." })}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* LivePaper Taskbar Indicator */}
            <button 
              onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
              className="p-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all"
              title="LivePaper Pro Ativo"
            >
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </button>

            {/* Steam */}
            <button 
              onClick={() => handleDesktopIconClick("Steam")}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Steam"
            >
              <Gamepad2 className="w-4 h-4 text-blue-400" />
            </button>

            {/* File Explorer */}
            <button 
              onClick={() => handleDesktopIconClick("Explorador de Arquivos")}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="Explorador de Arquivos"
            >
              <Folder className="w-4 h-4 text-yellow-400" />
            </button>

            {/* Terminal / Powershell */}
            <button 
              onClick={onOpenScriptModal}
              className="p-2 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-all"
              title="PowerShell Runner"
            >
              <Terminal className="w-4 h-4 text-green-400" />
            </button>
          </div>

          {/* System Tray (Right) */}
          <div className="flex items-center gap-3 font-mono text-xs">
            <div className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span>{wallpaper.fps || 60}Hz SYNC</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <Wifi className="w-3.5 h-3.5" />
              <button onClick={onToggleMute} className="hover:text-cyan-400">
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-pink-400" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <BatteryCharging className="w-3.5 h-3.5 text-green-400" />
            </div>

            {/* Clock & Date in System Tray */}
            <div className="flex flex-col items-end text-[11px] leading-tight text-slate-200">
              <span>{currentTime.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
              <span className="text-[10px] text-slate-400">{currentTime.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" })}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
