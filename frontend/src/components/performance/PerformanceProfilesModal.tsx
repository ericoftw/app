import React from "react";
import { 
  X, 
  Zap, 
  Activity, 
  Gamepad2, 
  BatteryCharging, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import type { GamingProfile } from "@/types/system";
import { toast } from "sonner";

interface PerformanceProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: GamingProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
}

export const PerformanceProfilesModal: React.FC<PerformanceProfilesModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
}) => {
  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    onSelectProfile(id);
    const p = profiles.find((prof) => prof.id === id);
    if (p) {
      toast.success(`Perfil gamer "${p.name}" ativado!`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      data-testid="performance-profiles-modal"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-[#0B0E14] border-2 border-green-500/30 shadow-[0_0_50px_rgba(0,255,102,0.2)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#0E131E]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-green-500 text-black">
              <Zap className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-heading">
                Perfis de Performance & Otimização Gamer
              </h3>
              <p className="text-xs text-green-400 font-mono">
                Gerencie uso de GPU, VRAM e latência durante jogos competitivos
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            data-testid="close-performance-modal-button"
            className="p-2 rounded-xl bg-[#141A28] text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          <div className="grid grid-cols-1 gap-4">
            {profiles.map((p) => {
              const isSelected = activeProfileId === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p.id)}
                  data-testid={`profile-card-${p.id}`}
                  className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex flex-col gap-3 ${
                    isSelected
                      ? "bg-green-500/10 border-green-400 shadow-[0_0_20px_rgba(0,255,102,0.25)]"
                      : "bg-[#10141E] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isSelected ? "bg-green-500 text-black" : "bg-slate-800 text-slate-300"}`}>
                        {p.id === "ultra_esports" ? <Activity className="w-5 h-5" /> :
                         p.id === "balanced" ? <Gamepad2 className="w-5 h-5" /> : <BatteryCharging className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm font-heading">{p.name}</h4>
                        <span className="text-xs font-mono text-green-400 font-semibold">{p.target_fps} FPS Cap</span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500 text-black font-mono font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>ATIVO</span>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{p.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-400">
                    <div>
                      <span>Engine:</span>{" "}
                      <span className="text-slate-200 font-semibold">{p.rendering_engine}</span>
                    </div>
                    <div>
                      <span>GPU Throttle:</span>{" "}
                      <span className="text-slate-200 font-semibold">{p.gpu_throttle}</span>
                    </div>
                    <div>
                      <span>Pausa em Jogos:</span>{" "}
                      <span className={p.auto_pause_games ? "text-green-400 font-bold" : "text-slate-400"}>
                        {p.auto_pause_games ? "Sim (0% CPU/GPU)" : "Não"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Telemetry info card */}
          <div className="p-4 rounded-xl bg-[#06070B] border border-white/10 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Proteção Anti-Lag de Jogos Ativada: 0ms de atraso de entrada (Input Lag)</span>
            </div>
            <span className="text-slate-400">WorkerW Hook v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
};
