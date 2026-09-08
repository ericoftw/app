import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sparkles, 
  Terminal, 
  Monitor, 
  Film, 
  Activity 
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { apiGet, apiPost } from "@/lib/api";
import type { Wallpaper, GamerResolutionKey } from "@/types/wallpaper";
import type { MultiMonitorSetup } from "@/types/monitor";
import type { SupportedFormat, SupportedResolution, GamingProfile } from "@/types/system";

import { DesktopSimulator } from "@/components/desktop/DesktopSimulator";
import { FXStudioPanel } from "@/components/studio/FXStudioPanel";
import { WallpaperLibrary } from "@/components/library/WallpaperLibrary";
import { ScriptGeneratorModal } from "@/components/exporter/ScriptGeneratorModal";
import { AIPromptStudio } from "@/components/ai/AIPromptStudio";
import { MultiMonitorManager } from "@/components/monitors/MultiMonitorManager";
import { SupportedFormatsModal } from "@/components/formats/SupportedFormatsModal";
import { UploadWallpaperModal } from "@/components/upload/UploadWallpaperModal";
import { PerformanceProfilesModal } from "@/components/performance/PerformanceProfilesModal";

// Fallback initial wallpaper for static preview safety
const DEFAULT_FALLBACK_WALLPAPER: Wallpaper = {
  id: "curated-1",
  title: "Cyberpunk Matrix Data Grid 4K",
  description: "Grade de dados cyberpunk em movimento com partículas neon verdes e telemetria digital em 4K a 60 FPS.",
  format: "mp4",
  category: "cyberpunk",
  resolutions: ["1080p", "1440p", "4k", "ultrawide_21_9"],
  aspect_ratio: "16:9",
  fps: 60,
  media_url: "/wallpapers/neon-city.mp4",
  thumbnail_url: "/wallpapers/neon-city.jpg",
  is_favorite: true,
  is_curated: true,
  tags: ["Cyberpunk", "4K", "Neon", "Matrix", "60FPS"],
  file_size_mb: 45.2,
  audio_supported: true,
  author: "CyberGamer Studios",
  created_at: new Date().toISOString()
};

const DEFAULT_MONITOR_SETUP: MultiMonitorSetup = {
  mode: "independent",
  monitors: [
    {
      id: "monitor-1",
      name: "Monitor 1 (Principal - Gamer 240Hz)",
      resolution: "2560x1440 (2K QHD)",
      resolution_key: "1440p",
      aspect_ratio: "16:9",
      refresh_rate_hz: 240,
      wallpaper_id: "curated-1",
      fit_mode: "cover",
      brightness: 100,
      contrast: 100,
      saturation: 105,
      playback_speed: 1.0,
      volume: 0,
      is_primary: true,
      orientation: "landscape",
      crt_filter: false,
      audio_reactive: true,
    },
    {
      id: "monitor-2",
      name: "Monitor 2 (Secundário - Chat 144Hz)",
      resolution: "1920x1080 (Full HD)",
      resolution_key: "1080p",
      aspect_ratio: "16:9",
      refresh_rate_hz: 144,
      wallpaper_id: "curated-2",
      fit_mode: "cover",
      brightness: 95,
      contrast: 100,
      saturation: 100,
      playback_speed: 1.0,
      volume: 0,
      is_primary: false,
      orientation: "landscape",
      crt_filter: false,
      audio_reactive: false,
    },
    {
      id: "monitor-3",
      name: "Monitor 3 (Ultrawide Imersivo 21:9)",
      resolution: "3440x1440 (UW-QHD)",
      resolution_key: "ultrawide_21_9",
      aspect_ratio: "21:9",
      refresh_rate_hz: 144,
      wallpaper_id: "curated-4",
      fit_mode: "cover",
      brightness: 100,
      contrast: 100,
      saturation: 110,
      playback_speed: 1.0,
      volume: 0,
      is_primary: false,
      orientation: "landscape",
      crt_filter: true,
      audio_reactive: true,
    }
  ]
};

export default function Home() {
  const queryClient = useQueryClient();

  // Queries
  const { data: wallpapersData } = useQuery<Wallpaper[]>({
    queryKey: ["wallpapers"],
    queryFn: () => apiGet<Wallpaper[]>("/wallpapers"),
  });

  const { data: monitorsData } = useQuery<MultiMonitorSetup>({
    queryKey: ["monitors"],
    queryFn: () => apiGet<MultiMonitorSetup>("/monitors"),
  });

  const { data: formatsData } = useQuery<SupportedFormat[]>({
    queryKey: ["formats"],
    queryFn: () => apiGet<SupportedFormat[]>("/system/formats"),
  });

  const { data: resolutionsData } = useQuery<SupportedResolution[]>({
    queryKey: ["resolutions"],
    queryFn: () => apiGet<SupportedResolution[]>("/system/resolutions"),
  });

  const { data: profilesData } = useQuery<GamingProfile[]>({
    queryKey: ["gaming-profiles"],
    queryFn: () => apiGet<GamingProfile[]>("/system/gaming-profiles"),
  });

  const wallpapers = wallpapersData && wallpapersData.length > 0 ? wallpapersData : [DEFAULT_FALLBACK_WALLPAPER];
  const monitorSetup = monitorsData || DEFAULT_MONITOR_SETUP;
  const formats = formatsData || [];
  const resolutions = resolutionsData || [];
  const profiles = profilesData || [];

  // Active Simulator State
  const [activeWallpaper, setActiveWallpaper] = useState<Wallpaper>(wallpapers[0] || DEFAULT_FALLBACK_WALLPAPER);
  const [activeResolution, setActiveResolution] = useState<GamerResolutionKey>("1440p");

  // Video FX Controls State
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(105);
  const [hueRotate, setHueRotate] = useState(0);
  const [blur, setBlur] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [crtFilter, setCrtFilter] = useState(false);
  const [fitMode, setFitMode] = useState<"cover" | "contain" | "stretch" | "center">("cover");
  const [audioReactive, setAudioReactive] = useState(true);
  const [audioSensitivity, setAudioSensitivity] = useState(1.2);
  const [activeGamingProfileId, setActiveGamingProfileId] = useState("ultra_esports");

  // Modals state
  const [isScriptModalOpen, setIsScriptModalOpen] = useState(false);
  const [isFormatsModalOpen, setIsFormatsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPerformanceModalOpen, setIsPerformanceModalOpen] = useState(false);
  const [targetExportWallpaper, setTargetExportWallpaper] = useState<Wallpaper>(activeWallpaper);

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: (id: string) => apiPost<Wallpaper>(`/wallpapers/${id}/favorite`, {}),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
      if (activeWallpaper.id === updated.id) {
        setActiveWallpaper(updated);
      }
      toast.success(updated.is_favorite ? "Adicionado aos favoritos!" : "Removido dos favoritos.");
    },
  });

  const handleResetFX = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setHueRotate(0);
    setBlur(0);
    setPlaybackSpeed(1.0);
    setVolume(0);
    setIsMuted(true);
    setCrtFilter(false);
    setFitMode("cover");
    setAudioSensitivity(1.2);
    toast.info("Ajustes de vídeo resetados para o padrão.");
  };

  const handleSelectWallpaper = (wp: Wallpaper) => {
    setActiveWallpaper(wp);
    if (wp.resolutions && wp.resolutions.length > 0) {
      if (!wp.resolutions.includes(activeResolution)) {
        setActiveResolution(wp.resolutions[0] as GamerResolutionKey);
      }
    }
    toast.success(`Wallpaper "${wp.title}" ativado no desktop!`);
  };

  const handleOpenExport = (wp: Wallpaper) => {
    setTargetExportWallpaper(wp);
    setIsScriptModalOpen(true);
  };

  const handleWallpaperAdded = (newWp: Wallpaper) => {
    queryClient.invalidateQueries({ queryKey: ["wallpapers"] });
    setActiveWallpaper(newWp);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#06070B] text-[#F0F4FF] flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      <Toaster position="top-right" richColors />

      {/* Top Cyberpunk / Gamer Navigation Bar */}
      <header className="sticky top-0 z-40 w-full bg-[#06070B]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 text-black shadow-[0_0_20px_rgba(0,240,255,0.6)]">
            <Sparkles className="w-5 h-5 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg lg:text-xl font-black font-heading tracking-wider bg-gradient-to-r from-cyan-400 via-white to-pink-500 bg-clip-text text-transparent">
                LIVEPAPER PRO
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/40">
                WINDOWS ENGINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Dynamic Gamer Video Wallpaper Studio & Windows Hooking Runner
            </p>
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="flex items-center gap-2">
          {/* Formats info button */}
          <button
            onClick={() => setIsFormatsModalOpen(true)}
            data-testid="header-formats-button"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10141E] hover:bg-cyan-500/20 text-slate-300 hover:text-cyan-300 border border-white/10 text-xs font-mono transition-all"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>Formatos & Resoluções</span>
          </button>

          {/* Performance Profile Button */}
          <button
            onClick={() => setIsPerformanceModalOpen(true)}
            data-testid="header-performance-button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/15 hover:bg-green-500/25 text-green-300 border border-green-500/30 text-xs font-mono transition-all"
          >
            <Activity className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span className="hidden sm:inline">Perfil:</span>
            <span className="font-bold">240Hz Ultra</span>
          </button>

          {/* Multi-monitor jump */}
          <button
            onClick={() => scrollToSection("multi-monitor-section")}
            data-testid="header-monitors-button"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#10141E] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
          >
            <Monitor className="w-3.5 h-3.5 text-pink-400" />
            <span>Multi-Monitor</span>
          </button>

          {/* AI Synthesizer jump */}
          <button
            onClick={() => scrollToSection("ai-studio-section")}
            data-testid="header-ai-studio-button"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/30 text-xs font-mono transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Studio</span>
          </button>

          {/* Windows Script Launcher */}
          <button
            onClick={() => handleOpenExport(activeWallpaper)}
            data-testid="header-export-script-button"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono text-xs shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-all"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Exportar .ps1</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-8">
        {/* Section 1: Desktop Simulator + FX Studio Bento Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Desktop Simulator (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                <h2 className="text-base font-bold text-white font-heading tracking-wide">
                  Simulador de Desktop Windows 10/11
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Wallpaper: <span className="text-cyan-400 font-bold">{activeWallpaper.title}</span>
              </span>
            </div>

            <DesktopSimulator
              wallpaper={activeWallpaper}
              resolution={activeResolution}
              onResolutionChange={setActiveResolution}
              brightness={brightness}
              contrast={contrast}
              saturation={saturation}
              hueRotate={hueRotate}
              blur={blur}
              playbackSpeed={playbackSpeed}
              volume={volume}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              crtFilter={crtFilter}
              onToggleCrt={() => setCrtFilter(!crtFilter)}
              fitMode={fitMode}
              audioReactive={audioReactive}
              onOpenFxStudio={() => scrollToSection("fx-studio-section")}
              onOpenScriptModal={() => handleOpenExport(activeWallpaper)}
              onOpenAiStudio={() => scrollToSection("ai-studio-section")}
            />
          </div>

          {/* FX Studio Panel (4 cols) */}
          <div id="fx-studio-section" className="lg:col-span-4">
            <FXStudioPanel
              brightness={brightness}
              setBrightness={setBrightness}
              contrast={contrast}
              setContrast={setContrast}
              saturation={saturation}
              setSaturation={setSaturation}
              hueRotate={hueRotate}
              setHueRotate={setHueRotate}
              blur={blur}
              setBlur={setBlur}
              playbackSpeed={playbackSpeed}
              setPlaybackSpeed={setPlaybackSpeed}
              volume={volume}
              setVolume={setVolume}
              isMuted={isMuted}
              setIsMuted={setIsMuted}
              crtFilter={crtFilter}
              setCrtFilter={setCrtFilter}
              fitMode={fitMode}
              setFitMode={setFitMode}
              audioReactive={audioReactive}
              setAudioReactive={setAudioReactive}
              audioSensitivity={audioSensitivity}
              setAudioSensitivity={setAudioSensitivity}
              onReset={handleResetFX}
            />
          </div>
        </section>

        {/* Section 2: Wallpaper Library (Full Width Bento) */}
        <section id="library-section">
          <WallpaperLibrary
            wallpapers={wallpapers}
            activeWallpaper={activeWallpaper}
            onSelectWallpaper={handleSelectWallpaper}
            onToggleFavorite={(id) => favoriteMutation.mutate(id)}
            onOpenExportModal={handleOpenExport}
            onOpenUploadModal={() => setIsUploadModalOpen(true)}
            onAssignToMonitor={(_monId, wp) => {
              handleSelectWallpaper(wp);
            }}
          />
        </section>

        {/* Section 3: AI Studio + Multi-Monitor Studio (Bento Grid 6 + 6 cols) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* AI Prompt Studio (6 cols) */}
          <div id="ai-studio-section" className="lg:col-span-6">
            <AIPromptStudio
              onWallpaperCreated={handleWallpaperAdded}
              onActivateWallpaper={handleSelectWallpaper}
            />
          </div>

          {/* Multi Monitor Manager (6 cols) */}
          <div id="multi-monitor-section" className="lg:col-span-6">
            <MultiMonitorManager
              setup={monitorSetup}
              wallpapers={wallpapers}
              onUpdateSetup={(newSetup) => {
                queryClient.setQueryData(["monitors"], newSetup);
              }}
              onSelectMonitorPreview={handleSelectWallpaper}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-white/10 bg-[#06070B] py-8 px-4 lg:px-8 mt-12 text-xs font-mono text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">LivePaper Engine Pro</span>
            <span className="text-slate-600">|</span>
            <span>Compatível com Windows 10 & 11 (DirectX 12 / DirectShow / WorkerW Hooking)</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button onClick={() => setIsFormatsModalOpen(true)} className="hover:text-cyan-300">
              Formatos Suportados
            </button>
            <button onClick={() => setIsPerformanceModalOpen(true)} className="hover:text-green-300">
              Perfis de Performance
            </button>
            <button onClick={() => handleOpenExport(activeWallpaper)} className="hover:text-pink-300">
              Gerador de Scripts
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ScriptGeneratorModal
        isOpen={isScriptModalOpen}
        onClose={() => setIsScriptModalOpen(false)}
        wallpaper={targetExportWallpaper}
      />

      <SupportedFormatsModal
        isOpen={isFormatsModalOpen}
        onClose={() => setIsFormatsModalOpen(false)}
        formats={formats}
        resolutions={resolutions}
      />

      <UploadWallpaperModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onWallpaperAdded={handleWallpaperAdded}
      />

      <PerformanceProfilesModal
        isOpen={isPerformanceModalOpen}
        onClose={() => setIsPerformanceModalOpen(false)}
        profiles={profiles}
        activeProfileId={activeGamingProfileId}
        onSelectProfile={setActiveGamingProfileId}
      />
    </div>
  );
}
