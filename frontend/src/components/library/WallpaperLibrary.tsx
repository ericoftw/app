import React, { useState } from "react";
import { 
  Search, 
  Star, 
  Play, 
  Terminal, 
  Monitor, 
  Upload, 
  Check, 
  Layers,
  Film
} from "lucide-react";
import type { Wallpaper } from "@/types/wallpaper";

interface WallpaperLibraryProps {
  wallpapers: Wallpaper[];
  activeWallpaper: Wallpaper;
  onSelectWallpaper: (wp: Wallpaper) => void;
  onToggleFavorite: (id: string) => void;
  onOpenExportModal: (wp: Wallpaper) => void;
  onOpenUploadModal: () => void;
  onAssignToMonitor?: (monitorId: string, wp: Wallpaper) => void;
}

const CATEGORIES = [
  { key: "all", label: "Todos os Estilos" },
  { key: "cyberpunk", label: "Cyberpunk Neon" },
  { key: "synthwave", label: "Synthwave 80s" },
  { key: "scifi", label: "Sci-Fi HUD" },
  { key: "anime", label: "Anime Gamer" },
  { key: "rain_lofi", label: "Chuva / Lo-Fi" },
  { key: "gaming_esports", label: "eSports & RGB" },
  { key: "abstract", label: "Partículas / 3D" },
];

const FORMAT_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Todos os Formatos" },
  { key: "mp4", label: "MP4 (H.264/HEVC)" },
  { key: "webm", label: "WebM (VP9/AV1)" },
  { key: "mkv", label: "MKV / Desktop" },
  { key: "gif", label: "GIF Animado" },
  { key: "shader", label: "Shaders WebGL" },
  { key: "stream_url", label: "Stream / HLS" },
];

const RESOLUTION_TABS = [
  { key: "all", label: "Todas Resoluções" },
  { key: "1080p", label: "1080p FHD" },
  { key: "1440p", label: "1440p 2K" },
  { key: "4k", label: "4K UHD" },
  { key: "ultrawide_21_9", label: "21:9 Ultrawide" },
  { key: "super_ultrawide_32_9", label: "32:9 Super UW" },
];

export const WallpaperLibrary: React.FC<WallpaperLibraryProps> = ({
  wallpapers,
  activeWallpaper,
  onSelectWallpaper,
  onToggleFavorite,
  onOpenExportModal,
  onOpenUploadModal,
  onAssignToMonitor,
}) => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");
  const [selectedResolution, setSelectedResolution] = useState("all");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredWallpapers = wallpapers.filter((wp) => {
    if (favoritesOnly && !wp.is_favorite) return false;
    if (selectedCategory !== "all" && wp.category !== selectedCategory) return false;
    if (selectedFormat !== "all" && wp.format !== selectedFormat) return false;
    if (selectedResolution !== "all" && !wp.resolutions.includes(selectedResolution)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = wp.title.toLowerCase().includes(q);
      const matchDesc = wp.description.toLowerCase().includes(q);
      const matchTags = wp.tags.some((t) => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchTags) return false;
    }
    return true;
  });

  return (
    <div 
      className="flex flex-col gap-5 p-6 rounded-2xl bg-[#0B0E14]/90 border border-cyan-500/20 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.6)]"
      data-testid="wallpaper-library-section"
    >
      {/* Top Header & Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 text-black">
              <Film className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-heading tracking-wide">
                Biblioteca Gamer de Papéis de Parede
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Suporte para resoluções gamers e os principais formatos de vídeo ({wallpapers.length} disponíveis)
              </p>
            </div>
          </div>
        </div>

        {/* Search bar & Upload Button */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome, tag ou estilo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="search-wallpapers-input"
              className="w-full pl-9 pr-4 py-2 bg-[#10141E] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-mono transition-all"
            />
          </div>

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            data-testid="filter-favorites-button"
            className={`p-2.5 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-all ${
              favoritesOnly
                ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-[0_0_12px_rgba(255,215,0,0.3)]"
                : "bg-[#10141E] text-slate-400 border-white/10 hover:text-white"
            }`}
            title="Mostrar apenas favoritos"
          >
            <Star className={`w-4 h-4 ${favoritesOnly ? "fill-yellow-400 text-yellow-400" : ""}`} />
            <span className="hidden sm:inline">Favoritos</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            data-testid="open-upload-modal-button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(255,0,85,0.4)]"
          >
            <Upload className="w-4 h-4" />
            <span>Adicionar Vídeo</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            data-testid={`category-tab-${cat.key}`}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.key
                ? "bg-cyan-500 text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                : "bg-[#10141E] text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-white/5"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Format & Resolution Filter Sub-bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#10141E]/80 border border-white/5 text-xs">
        {/* Format Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-mono flex items-center gap-1 mr-1">
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            Formato:
          </span>
          {FORMAT_TABS.map((fmt) => (
            <button
              key={fmt.key}
              onClick={() => setSelectedFormat(fmt.key)}
              data-testid={`format-tab-${fmt.key}`}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                selectedFormat === fmt.key
                  ? "bg-purple-600 text-white font-bold"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>

        {/* Resolution Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <span className="text-slate-400 font-mono flex items-center gap-1 mr-1">
            <Monitor className="w-3.5 h-3.5 text-pink-400" />
            Resolução:
          </span>
          {RESOLUTION_TABS.map((res) => (
            <button
              key={res.key}
              onClick={() => setSelectedResolution(res.key)}
              data-testid={`res-filter-tab-${res.key}`}
              className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all ${
                selectedResolution === res.key
                  ? "bg-pink-600 text-white font-bold"
                  : "bg-slate-800/60 text-slate-400 hover:text-white"
              }`}
            >
              {res.label}
            </button>
          ))}
        </div>
      </div>

      {/* Wallpapers Grid */}
      {filteredWallpapers.length === 0 ? (
        <div className="py-16 text-center text-slate-400 font-mono flex flex-col items-center gap-3">
          <Layers className="w-10 h-10 text-slate-600 animate-pulse" />
          <p className="text-sm">Nenhum papel de parede encontrado para este filtro.</p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSelectedFormat("all");
              setSelectedResolution("all");
              setFavoritesOnly(false);
              setSearchQuery("");
            }}
            className="px-4 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold"
          >
            Limpar Filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredWallpapers.map((wp) => {
            const isActive = activeWallpaper.id === wp.id;
            return (
              <div
                key={wp.id}
                data-testid={`wallpaper-card-${wp.id}`}
                className={`group relative flex flex-col rounded-2xl overflow-hidden bg-[#10141E] border transition-all duration-300 hover:scale-[1.02] ${
                  isActive
                    ? "border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)]"
                    : "border-white/10 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(0,240,255,0.15)]"
                }`}
              >
                {/* Thumbnail Preview Area */}
                <div className="relative aspect-video w-full overflow-hidden bg-black/80">
                  <img
                    src={wp.thumbnail_url || wp.media_url}
                    alt={wp.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#10141E] via-transparent to-black/40" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
                    {/* Format Badge */}
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500 text-black font-mono font-bold text-[10px] uppercase tracking-wider shadow-sm">
                      {wp.format === "shader" ? "WebGL Shader" : wp.format.toUpperCase()}
                    </span>

                    {/* FPS Badge */}
                    <span className="px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-green-400 font-mono font-semibold text-[10px] border border-green-500/30">
                      {wp.fps} FPS
                    </span>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(wp.id);
                    }}
                    data-testid={`favorite-btn-${wp.id}`}
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-md text-slate-300 hover:text-yellow-400 transition-all z-10"
                    title="Favoritar"
                  >
                    <Star className={`w-4 h-4 ${wp.is_favorite ? "fill-yellow-400 text-yellow-400" : ""}`} />
                  </button>

                  {/* Active Indicator Pulse */}
                  {isActive && (
                    <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500 text-black font-mono font-bold text-[10px] z-10 shadow-[0_0_12px_rgba(0,240,255,0.8)]">
                      <Check className="w-3 h-3 stroke-[3]" />
                      <span>EM EXECUÇÃO</span>
                    </div>
                  )}

                  {/* Play Overlay on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs">
                    <button
                      onClick={() => onSelectWallpaper(wp)}
                      data-testid={`activate-wallpaper-${wp.id}`}
                      className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold shadow-[0_0_20px_rgba(0,240,255,0.8)] transform scale-90 group-hover:scale-100 transition-all"
                      title="Ativar no Desktop"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                  </div>
                </div>

                {/* Content & Metadata */}
                <div className="p-4 flex flex-col gap-2.5 flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm tracking-wide font-heading line-clamp-1 group-hover:text-cyan-300 transition-colors">
                      {wp.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {wp.description}
                    </p>
                  </div>

                  {/* Resolution Tags */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {wp.resolutions.map((resKey) => (
                      <span
                        key={resKey}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/5"
                      >
                        {resKey === "1080p" ? "1080p FHD" :
                         resKey === "1440p" ? "1440p 2K" :
                         resKey === "4k" ? "4K UHD" :
                         resKey === "ultrawide_21_9" ? "21:9 UW" : "32:9 Super UW"}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons Footer */}
                  <div className="pt-2 border-t border-white/5 flex items-center gap-2">
                    <button
                      onClick={() => onSelectWallpaper(wp)}
                      data-testid={`select-button-${wp.id}`}
                      className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all ${
                        isActive
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                          : "bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isActive ? "Ativo" : "Ativar"}</span>
                    </button>

                    <button
                      onClick={() => onOpenExportModal(wp)}
                      data-testid={`export-script-btn-${wp.id}`}
                      className="p-2 rounded-xl bg-[#141A28] hover:bg-purple-600 hover:text-white text-purple-400 border border-purple-500/30 text-xs transition-all"
                      title="Gerar Script Windows .ps1"
                    >
                      <Terminal className="w-4 h-4" />
                    </button>

                    {onAssignToMonitor && (
                      <button
                        onClick={() => onAssignToMonitor("monitor-1", wp)}
                        data-testid={`assign-monitor-btn-${wp.id}`}
                        className="p-2 rounded-xl bg-[#141A28] hover:bg-cyan-500 hover:text-black text-cyan-400 border border-cyan-500/30 text-xs transition-all"
                        title="Enviar para Monitor 1"
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
