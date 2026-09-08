import React from "react";
import { 
  X, 
  Film, 
  Monitor, 
  Zap 
} from "lucide-react";
import type { SupportedFormat, SupportedResolution } from "@/types/system";

interface SupportedFormatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  formats: SupportedFormat[];
  resolutions: SupportedResolution[];
}

export const SupportedFormatsModal: React.FC<SupportedFormatsModalProps> = ({
  isOpen,
  onClose,
  formats,
  resolutions,
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      data-testid="supported-formats-modal"
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0E14] border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0E131E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500 text-black">
              <Film className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Formatos de Vídeo & Resoluções Gamers Suportadas
              </h3>
              <p className="text-xs text-cyan-400 font-mono">
                Compatibilidade nativa do LivePaper Engine Pro para Windows 10/11
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-formats-modal-button"
            className="p-2 rounded-xl bg-[#141A28] text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Section 1: Formatos de Vídeo (Min 5+ suportes) */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                1. Formatos de Vídeo & Mecanismos de Renderização (6 Formatos)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {formats.map((fmt) => (
                <div
                  key={fmt.key}
                  data-testid={`format-spec-${fmt.key}`}
                  className="p-4 rounded-xl bg-[#10141E] border border-white/10 flex flex-col gap-2.5 hover:border-cyan-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono">{fmt.label}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[10px] font-bold">
                      {fmt.fps_range}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{fmt.description}</p>

                  <div className="pt-2 border-t border-white/5 flex flex-col gap-1 text-[11px] font-mono text-slate-400">
                    <div className="flex justify-between">
                      <span>Decodificador:</span>
                      <span className="text-slate-200">{fmt.decoder}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Suporte Windows:</span>
                      <span className="text-green-400 font-semibold">{fmt.windows_support}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Resoluções Gamers */}
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-pink-400" />
              <h4 className="text-sm font-bold text-white font-heading uppercase tracking-wider">
                2. Resoluções Gamers Mais Usadas & Aspect Ratios
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {resolutions.map((res) => (
                <div
                  key={res.key}
                  data-testid={`resolution-spec-${res.key}`}
                  className="p-4 rounded-xl bg-[#10141E] border border-white/10 flex flex-col gap-2 hover:border-pink-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono">{res.label}</span>
                    <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-mono text-[10px] font-bold">
                      {res.aspect_ratio}
                    </span>
                  </div>

                  <div className="text-xs font-mono text-cyan-400 font-bold">
                    {res.width} x {res.height} px
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{res.description}</p>

                  <div className="mt-auto pt-2 border-t border-white/5 text-[10px] font-mono text-purple-300">
                    Nível: {res.gamer_tier}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
