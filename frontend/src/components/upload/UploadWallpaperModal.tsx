import React, { useState } from "react";
import { 
  X, 
  Upload, 
  Link2, 
  Check 
} from "lucide-react";
import type { Wallpaper, WallpaperCreate, WallpaperFormat } from "@/types/wallpaper";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

interface UploadWallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWallpaperAdded: (wp: Wallpaper) => void;
}

export const UploadWallpaperModal: React.FC<UploadWallpaperModalProps> = ({
  isOpen,
  onClose,
  onWallpaperAdded,
}) => {
  const [mode, setMode] = useState<"url" | "file">("url");
  const [title, setTitle] = useState("");
  const [description] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [format, setFormat] = useState<WallpaperFormat>("mp4");
  const [category, setCategory] = useState("cyberpunk");
  const [fps, setFps] = useState(60);
  const [selectedResolutions, setSelectedResolutions] = useState<string[]>(["1080p", "1440p", "4k"]);
  const [tagsInput, setTagsInput] = useState("Gamer, 60FPS, 4K");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format from extension
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    if (ext === "webm") setFormat("webm");
    else if (ext === "mkv" || ext === "avi" || ext === "mov") setFormat("mkv");
    else if (ext === "gif") setFormat("gif");
    else setFormat("mp4");

    const blobUrl = URL.createObjectURL(file);
    setMediaUrl(blobUrl);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
    toast.success(`Arquivo "${file.name}" carregado com sucesso para teste em memória!`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !mediaUrl.trim()) {
      toast.error("Preencha o título e a URL/arquivo do vídeo.");
      return;
    }

    setLoading(true);
    try {
      const tags = tagsInput.split(",").map((t) => t.trim()).filter(Boolean);
      const payload: WallpaperCreate = {
        title,
        description: description || `Papel de parede personalizado adicionado pelo usuário.`,
        format,
        category,
        resolutions: selectedResolutions,
        aspect_ratio: "16:9",
        fps,
        media_url: mediaUrl,
        thumbnail_url: mediaUrl,
        tags,
        audio_supported: true,
        author: "User Custom"
      };

      const res = await apiPost<Wallpaper>("/wallpapers", payload);
      onWallpaperAdded(res);
      toast.success(`Wallpaper "${res.title}" adicionado à sua biblioteca!`);
      onClose();
    } catch {
      toast.error("Erro ao salvar wallpaper.");
    } finally {
      setLoading(false);
    }
  };

  const toggleResolution = (resKey: string) => {
    if (selectedResolutions.includes(resKey)) {
      if (selectedResolutions.length > 1) {
        setSelectedResolutions(selectedResolutions.filter((r) => r !== resKey));
      }
    } else {
      setSelectedResolutions([...selectedResolutions, resKey]);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      data-testid="upload-wallpaper-modal"
    >
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0E14] border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0E131E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-pink-500 text-white">
              <Upload className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Adicionar Novo Vídeo ou Papel de Parede
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Suporta MP4, WebM, MKV, GIFs, Shaders e URLs de streaming
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-upload-modal-button"
            className="p-2 rounded-xl bg-[#141A28] text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {/* Source Mode Toggle */}
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#10141E] border border-white/5">
            <button
              type="button"
              onClick={() => setMode("url")}
              className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                mode === "url"
                  ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(0,240,255,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>URL / Link Direto de Vídeo</span>
            </button>
            <button
              type="button"
              onClick={() => setMode("file")}
              className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
                mode === "file"
                  ? "bg-pink-500 text-white shadow-[0_0_10px_rgba(255,0,85,0.4)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Arquivo do Computador (MP4/WebM/MKV)</span>
            </button>
          </div>

          {mode === "url" ? (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300">URL Direta do Vídeo (.mp4, .webm ou stream):</label>
              <input
                type="url"
                required
                placeholder="https://exemplo.com/meu-video-gamer.mp4"
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                data-testid="upload-video-url-input"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300">Selecione o arquivo de vídeo do seu PC:</label>
              <input
                type="file"
                accept="video/mp4,video/webm,video/mkv,video/avi,video/quicktime,image/gif"
                onChange={handleFileChange}
                data-testid="upload-video-file-input"
                className="w-full p-3 bg-slate-900 border border-white/10 rounded-xl text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:text-black file:font-bold file:text-xs hover:file:bg-cyan-400 cursor-pointer"
              />
            </div>
          )}

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300">Título do Wallpaper:</label>
              <input
                type="text"
                required
                placeholder="Ex: Cyberpunk Neon Samurai 4K"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                data-testid="upload-title-input"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 font-sans focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300">Categoria:</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                data-testid="upload-category-select"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="cyberpunk">Cyberpunk Neon</option>
                <option value="synthwave">Synthwave 80s</option>
                <option value="scifi">Sci-Fi HUD</option>
                <option value="anime">Anime Gamer</option>
                <option value="rain_lofi">Chuva / Lo-Fi</option>
                <option value="gaming_esports">eSports & RGB</option>
                <option value="abstract">Partículas / Abstrato</option>
              </select>
            </div>
          </div>

          {/* Format & FPS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300">Formato / Decoder:</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as WallpaperFormat)}
                data-testid="upload-format-select"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="mp4">MP4 (H.264 / HEVC)</option>
                <option value="webm">WebM (VP9 / AV1)</option>
                <option value="mkv">MKV / AVI / MOV</option>
                <option value="gif">GIF Animado / WebP</option>
                <option value="stream_url">Stream URL / Live Feed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-mono text-slate-300">Taxa de Quadros (FPS):</label>
              <select
                value={fps}
                onChange={(e) => setFps(Number(e.target.value))}
                data-testid="upload-fps-select"
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value={30}>30 FPS</option>
                <option value={60}>60 FPS</option>
                <option value={120}>120 FPS</option>
                <option value={144}>144 FPS (Gamer 144Hz)</option>
                <option value={240}>240 FPS (Ultra 240Hz)</option>
              </select>
            </div>
          </div>

          {/* Resolutions Supported Checkboxes */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-slate-300">Resoluções Suportadas:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: "1080p", label: "1080p Full HD" },
                { key: "1440p", label: "1440p 2K QHD" },
                { key: "4k", label: "4K Ultra HD" },
                { key: "ultrawide_21_9", label: "21:9 Ultrawide" },
                { key: "super_ultrawide_32_9", label: "32:9 Super UW" },
              ].map((res) => {
                const checked = selectedResolutions.includes(res.key);
                return (
                  <button
                    key={res.key}
                    type="button"
                    onClick={() => toggleResolution(res.key)}
                    data-testid={`toggle-res-check-${res.key}`}
                    className={`p-2 rounded-lg border text-left text-xs font-mono flex items-center justify-between transition-all ${
                      checked
                        ? "bg-cyan-500/20 border-cyan-400 text-cyan-300"
                        : "bg-slate-900 border-white/5 text-slate-400 hover:text-white"
                    }`}
                  >
                    <span>{res.label}</span>
                    {checked && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description & Tags */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono text-slate-300">Tags (separadas por vírgula):</label>
            <input
              type="text"
              placeholder="Ex: Cyberpunk, Neon, 4K, 60FPS"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            data-testid="submit-new-wallpaper-button"
            className="mt-2 w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-bold font-mono text-sm uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50"
          >
            {loading ? "Salvando Wallpaper..." : "Salvar & Adicionar à Biblioteca"}
          </button>
        </form>
      </div>
    </div>
  );
};
