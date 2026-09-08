import React, { useState } from "react";
import { 
  Sparkles, 
  Wand2, 
  Cpu, 
  Zap, 
  Play, 
  Palette, 
  CheckCircle2, 
  Loader2 
} from "lucide-react";
import type { AIGenerateWallpaperRequest, AIGenerateWallpaperResponse } from "@/types/ai";
import type { Wallpaper } from "@/types/wallpaper";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

interface AIPromptStudioProps {
  onWallpaperCreated: (wp: Wallpaper) => void;
  onActivateWallpaper: (wp: Wallpaper) => void;
}

const GAMER_PROMPT_PRESETS = [
  "Samurai cibernético com katana neon sob chuva torrencial em Neo-Tóquio",
  "Estrada infinita Synthwave dos anos 80 com grade wireframe e sol gigante",
  "Buraco negro cósmico com horizonte de eventos em partículas roxas 4K",
  "Cockpit holográfico de caça espacial com telemetria tática reativa a som",
  "Quarto aconchegante Lo-Fi com gotas de chuva no vidro e reflexos de néon",
  "Visualizador de áudio RGB eSports com ondas de choque em 240Hz"
];

export const AIPromptStudio: React.FC<AIPromptStudioProps> = ({
  onWallpaperCreated,
  onActivateWallpaper,
}) => {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<"cyberpunk" | "synthwave" | "scifi" | "anime" | "rain_lofi" | "abstract">("cyberpunk");
  const [resolution, setResolution] = useState("1440p");
  const [fpsTarget, setFpsTarget] = useState(144);
  const [audioReactive, setAudioReactive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<AIGenerateWallpaperResponse | null>(null);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Por favor, digite uma descrição para o wallpaper.");
      return;
    }

    setLoading(true);
    setGeneratedResult(null);
    try {
      const payload: AIGenerateWallpaperRequest = {
        prompt,
        style,
        target_resolution: resolution,
        fps_target: fpsTarget,
        include_audio_reactivity: audioReactive,
      };

      const res = await apiPost<AIGenerateWallpaperResponse>("/ai/generate-wallpaper", payload);
      setGeneratedResult(res);

      const newWallpaper: Wallpaper = {
        id: res.id,
        title: res.title,
        description: res.description,
        format: "shader",
        category: res.category,
        resolutions: ["1080p", "1440p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"],
        aspect_ratio: "16:9",
        fps: res.fps,
        media_url: res.media_url,
        thumbnail_url: res.preview_thumbnail,
        shader_type: res.shader_type,
        shader_params: res.shader_params,
        is_favorite: true,
        is_curated: false,
        tags: ["AI Generated", style, `${fpsTarget}FPS`],
        file_size_mb: 2.5,
        audio_supported: audioReactive,
        author: "AI LivePaper Studio",
        created_at: new Date().toISOString()
      };

      onWallpaperCreated(newWallpaper);
      toast.success(`Wallpaper "${res.title}" gerado com sucesso por IA!`);
    } catch {
      toast.error("Erro ao sintetizar wallpaper com IA.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="p-6 rounded-2xl bg-[#0B0E14]/90 border border-purple-500/30 backdrop-blur-xl flex flex-col gap-6 shadow-[0_0_35px_rgba(112,0,255,0.15)]"
      data-testid="ai-prompt-studio-section"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-[0_0_15px_rgba(255,0,85,0.4)]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              AI Dynamic Wallpaper Synthesizer
            </h3>
            <p className="text-xs text-purple-300 font-mono">
              Gere papéis de parede animados procedurais e configurações de shaders com IA
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
          <Cpu className="w-3.5 h-3.5 text-purple-400" />
          <span>OPENAI & CLAUDE INTEGRATED</span>
        </div>
      </div>

      {/* Preset Suggestions Chips */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-mono text-slate-400">Sugestões de Prompts Gamers Populares:</span>
        <div className="flex flex-wrap gap-2">
          {GAMER_PROMPT_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(preset)}
              data-testid={`preset-prompt-${idx}`}
              className="px-3 py-1.5 rounded-xl bg-[#141A28] hover:bg-purple-500/20 hover:text-purple-300 hover:border-purple-500/40 text-slate-300 border border-white/5 text-xs text-left transition-all font-sans"
            >
              "{preset}"
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleGenerate} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-bold text-white font-mono uppercase tracking-wider">
            Descreva seu Wallpaper Gamer Desejado:
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ex: Samurai cibernético em chuva de neon roxo e azul com partículas flutuantes e visualizador sonoro reativo..."
              data-testid="ai-prompt-input"
              className="w-full p-4 bg-[#10141E] border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 font-sans transition-all leading-relaxed"
            />
          </div>
        </div>

        {/* Style & Configuration Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Style */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300 font-mono">Estilo Visual:</label>
            <select
              value={style}
              onChange={(e) => setStyle(e.target.value as typeof style)}
              data-testid="ai-style-select"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-purple-400"
            >
              <option value="cyberpunk">Cyberpunk Neon</option>
              <option value="synthwave">Synthwave 80s</option>
              <option value="scifi">Sci-Fi Hologram HUD</option>
              <option value="anime">Anime Sakura Katana</option>
              <option value="rain_lofi">Chuva Relaxante Lo-Fi</option>
              <option value="abstract">Partículas 3D / Vortex</option>
            </select>
          </div>

          {/* Resolution */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300 font-mono">Resolução Alvo:</label>
            <select
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              data-testid="ai-resolution-select"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-purple-400"
            >
              <option value="1080p">1080p Full HD</option>
              <option value="1440p">1440p 2K QHD (Sweet Spot)</option>
              <option value="4k">4K Ultra HD</option>
              <option value="ultrawide_21_9">Ultrawide 21:9</option>
              <option value="super_ultrawide_32_9">Super Ultrawide 32:9</option>
            </select>
          </div>

          {/* FPS Target */}
          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-slate-300 font-mono">FPS Gamer:</label>
            <select
              value={fpsTarget}
              onChange={(e) => setFpsTarget(Number(e.target.value))}
              data-testid="ai-fps-select"
              className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-purple-400"
            >
              <option value={60}>60 FPS Suave</option>
              <option value={120}>120 FPS Alta Taxa</option>
              <option value={144}>144 FPS Pro Gamer</option>
              <option value={240}>240 FPS Ultra eSports</option>
            </select>
          </div>

          {/* Audio Reactivity Toggle */}
          <div className="flex flex-col justify-end">
            <button
              type="button"
              onClick={() => setAudioReactive(!audioReactive)}
              data-testid="ai-audio-reactivity-toggle"
              className={`w-full px-3 py-2 rounded-lg border font-mono font-medium flex items-center justify-between transition-all ${
                audioReactive
                  ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  : "bg-slate-900 text-slate-400 border-white/10"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Reatividade de Áudio</span>
              </div>
              <span className="text-[10px] font-bold uppercase">{audioReactive ? "Sim" : "Não"}</span>
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !prompt.trim()}
          data-testid="generate-ai-wallpaper-button"
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-500 hover:from-purple-500 hover:via-pink-500 hover:to-cyan-400 text-white font-bold font-heading text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(255,0,85,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Sintetizando Shader & Vídeo com IA...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5" />
              <span>Sintetizar Wallpaper Gamer com IA</span>
            </>
          )}
        </button>
      </form>

      {/* Generated Result Card */}
      {generatedResult && (
        <div 
          className="p-5 rounded-2xl bg-[#10141E] border border-cyan-500/30 flex flex-col md:flex-row gap-5 animate-in fade-in slide-in-from-bottom-3"
          data-testid="ai-generated-result-card"
        >
          <div className="w-full md:w-56 aspect-video rounded-xl overflow-hidden relative border border-white/10 bg-black">
            <img
              src={generatedResult.preview_thumbnail}
              alt={generatedResult.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-black font-mono font-bold text-[10px]">
              AI CREATED
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-green-400 text-xs font-mono mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Gerado com Sucesso!</span>
              </div>
              <h4 className="text-base font-bold text-white font-heading">{generatedResult.title}</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{generatedResult.description}</p>
            </div>

            {/* Color Palette Display */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5" />
                Paleta:
              </span>
              <div className="flex items-center gap-1.5">
                {generatedResult.color_palette.map((color, i) => (
                  <div
                    key={i}
                    className="w-5 h-5 rounded-md border border-white/20 shadow-xs"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const wp: Wallpaper = {
                    id: generatedResult.id,
                    title: generatedResult.title,
                    description: generatedResult.description,
                    format: "shader",
                    category: generatedResult.category,
                    resolutions: ["1080p", "1440p", "4k", "ultrawide_21_9", "super_ultrawide_32_9"],
                    aspect_ratio: "16:9",
                    fps: generatedResult.fps,
                    media_url: generatedResult.media_url,
                    thumbnail_url: generatedResult.preview_thumbnail,
                    shader_type: generatedResult.shader_type,
                    shader_params: generatedResult.shader_params,
                    is_favorite: true,
                    is_curated: false,
                    tags: ["AI", "Shader", `${generatedResult.fps}FPS`],
                    file_size_mb: 2.5,
                    audio_supported: true,
                    author: "LivePaper AI",
                    created_at: new Date().toISOString()
                  };
                  onActivateWallpaper(wp);
                  toast.success(`Wallpaper "${wp.title}" ativado no simulador!`);
                }}
                data-testid="activate-ai-wallpaper-button"
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold font-mono text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)] transition-all"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Ativar no Simulador</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
