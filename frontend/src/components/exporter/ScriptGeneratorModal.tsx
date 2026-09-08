import React, { useState, useEffect } from "react";
import { 
  X, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  FileCode, 
  FolderArchive, 
  Tv, 
  Gamepad2 
} from "lucide-react";
import type { Wallpaper } from "@/types/wallpaper";
import type { ScriptExportResponse, ScriptExportRequest } from "@/types/script";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

interface ScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpaper: Wallpaper;
}

export const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({
  isOpen,
  onClose,
  wallpaper,
}) => {
  const [scriptType, setScriptType] = useState<"powershell" | "batch" | "lively_zip" | "wallpaper_engine_json">("powershell");
  const [resolution, setResolution] = useState("1440p");
  const [fpsLimit, setFpsLimit] = useState(wallpaper.fps || 60);
  const [autoPauseGames, setAutoPauseGames] = useState(true);

  const [loading, setLoading] = useState(false);
  const [scriptData, setScriptData] = useState<ScriptExportResponse | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchScript = async () => {
      setLoading(true);
      try {
        const payload: ScriptExportRequest = {
          wallpaper_id: wallpaper.id,
          script_type: scriptType,
          resolution,
          fps_limit: fpsLimit,
          auto_pause_fullscreen: autoPauseGames,
          audio_enabled: false,
          volume: 0,
          fit_mode: "cover",
          hardware_acceleration: true
        };

        const res = await apiPost<ScriptExportResponse>("/scripts/generate", payload);
        setScriptData(res);
      } catch {
        toast.error("Erro ao gerar script Windows.");
      } finally {
        setLoading(false);
      }
    };

    fetchScript();
  }, [isOpen, scriptType, resolution, fpsLimit, autoPauseGames, wallpaper.id]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (!scriptData?.content) return;
    navigator.clipboard.writeText(scriptData.content);
    setCopied(true);
    toast.success("Script copiado para a área de transferência!");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    if (!scriptData?.content || !scriptData?.filename) return;
    const blob = new Blob([scriptData.content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = scriptData.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Download de ${scriptData.filename} concluído!`);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in"
      data-testid="script-generator-modal"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0E14] border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0E131E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-black">
              <Terminal className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Executar Wallpaper no Windows 10/11
              </h3>
              <p className="text-xs text-cyan-400 font-mono">
                {wallpaper.title} ({wallpaper.format.toUpperCase()} @ {fpsLimit}Hz)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-script-modal-button"
            className="p-2 rounded-xl bg-[#141A28] text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Target Engine Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: "powershell", label: "PowerShell Nativo (.ps1)", icon: Terminal, desc: "WorkerW Hooking direto" },
              { key: "batch", label: "Launcher Batch (.bat)", icon: FileCode, desc: "1-Click duplo clique" },
              { key: "lively_zip", label: "Lively Wallpaper", icon: FolderArchive, desc: "Manifesto LivelyInfo.json" },
              { key: "wallpaper_engine_json", label: "Wallpaper Engine", icon: Tv, desc: "Manifesto project.json" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = scriptType === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setScriptType(tab.key as typeof scriptType)}
                  data-testid={`script-tab-${tab.key}`}
                  className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                      : "bg-[#10141E] border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${isSelected ? "text-cyan-400" : "text-slate-500"}`} />
                    <span className="font-bold text-xs">{tab.label}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">{tab.desc}</span>
                </button>
              );
            })}
          </div>

          {/* Configuration Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-[#10141E] border border-white/5 text-xs">
            {/* Resolution */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300 font-mono">Resolução Gamer Alvo:</label>
              <select
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                data-testid="export-resolution-select"
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value="1080p">1080p Full HD (1920x1080)</option>
                <option value="1440p">1440p 2K QHD (2560x1440)</option>
                <option value="4k">4K Ultra HD (3840x2160)</option>
                <option value="ultrawide_21_9">Ultrawide 21:9 (3440x1440)</option>
                <option value="super_ultrawide_32_9">Super Ultrawide 32:9 (5120x1440)</option>
              </select>
            </div>

            {/* Target FPS */}
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-slate-300 font-mono">Taxa de Quadros (FPS):</label>
              <select
                value={fpsLimit}
                onChange={(e) => setFpsLimit(Number(e.target.value))}
                data-testid="export-fps-select"
                className="w-full px-3 py-2 bg-slate-900 border border-white/10 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
              >
                <option value={30}>30 FPS (Eco / Bateria)</option>
                <option value={60}>60 FPS (Padrão Suave)</option>
                <option value={120}>120 FPS (Gamer 120Hz)</option>
                <option value={144}>144 FPS (Gamer 144Hz)</option>
                <option value={240}>240 FPS (Ultra eSports 240Hz)</option>
              </select>
            </div>

            {/* Auto Pause Fullscreen */}
            <div className="flex flex-col justify-center gap-1.5">
              <label className="font-semibold text-slate-300 font-mono">Otimização para Jogos:</label>
              <button
                type="button"
                onClick={() => setAutoPauseGames(!autoPauseGames)}
                data-testid="toggle-auto-pause-games"
                className={`px-3 py-2 rounded-lg border font-mono font-medium flex items-center justify-between transition-all ${
                  autoPauseGames
                    ? "bg-green-500/20 text-green-300 border-green-500/40"
                    : "bg-slate-900 text-slate-400 border-white/10"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Gamepad2 className="w-3.5 h-3.5" />
                  <span>Pausar em Jogos</span>
                </div>
                <span className="text-[10px] uppercase font-bold">{autoPauseGames ? "Ativo" : "Off"}</span>
              </button>
            </div>
          </div>

          {/* Instructions Box */}
          {scriptData?.instructions && (
            <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex flex-col gap-2">
              <h4 className="text-xs font-bold text-cyan-400 font-mono flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Como aplicar no Windows:
              </h4>
              <ul className="text-xs text-slate-300 space-y-1 font-sans">
                {scriptData.instructions.map((inst, i) => (
                  <li key={i} className="leading-relaxed">{inst}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Code Preview Box */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">
                Arquivo Gerado: <span className="text-white font-bold">{scriptData?.filename || "script"}</span>
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  data-testid="copy-script-button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141A28] hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-mono transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copiado!" : "Copiar Código"}</span>
                </button>

                <button
                  onClick={handleDownload}
                  data-testid="download-script-button"
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black text-xs font-bold font-mono transition-all shadow-[0_0_15px_rgba(0,240,255,0.4)]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Script</span>
                </button>
              </div>
            </div>

            <pre 
              className="p-4 rounded-xl bg-[#06070B] border border-white/10 text-xs text-cyan-300 font-mono overflow-x-auto max-h-56 leading-relaxed select-all"
              data-testid="script-code-preview"
            >
              {loading ? "Gerando código otimizado para Windows..." : (scriptData?.content || "")}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
