import React, { useState } from "react";
import { 
  Monitor, 
  Settings2 
} from "lucide-react";
import type { MultiMonitorSetup } from "@/types/monitor";
import type { Wallpaper } from "@/types/wallpaper";
import { apiPut } from "@/lib/api";
import { toast } from "sonner";

interface MultiMonitorManagerProps {
  setup: MultiMonitorSetup;
  wallpapers: Wallpaper[];
  onUpdateSetup: (newSetup: MultiMonitorSetup) => void;
  onSelectMonitorPreview: (wallpaper: Wallpaper) => void;
}

export const MultiMonitorManager: React.FC<MultiMonitorManagerProps> = ({
  setup,
  wallpapers,
  onUpdateSetup,
  onSelectMonitorPreview,
}) => {
  const [selectedMonitorId, setSelectedMonitorId] = useState<string>("monitor-1");

  const activeMonitor = setup.monitors.find((m) => m.id === selectedMonitorId) || setup.monitors[0];

  const handleModeChange = async (mode: "independent" | "span" | "clone") => {
    const updated: MultiMonitorSetup = {
      ...setup,
      mode,
    };
    onUpdateSetup(updated);
    try {
      await apiPut<MultiMonitorSetup>("/monitors", updated);
      toast.success(`Modo multi-monitor alterado para: ${mode === "independent" ? "Independente" : mode === "span" ? "Estendido (Span)" : "Espelhado"}`);
    } catch {
      toast.error("Erro ao salvar configuração de monitores.");
    }
  };

  const handleAssignWallpaper = async (monitorId: string, wallpaperId: string) => {
    const updatedMonitors = setup.monitors.map((m) => {
      if (m.id === monitorId) {
        return { ...m, wallpaper_id: wallpaperId };
      }
      return m;
    });

    const updated: MultiMonitorSetup = {
      ...setup,
      monitors: updatedMonitors,
    };

    onUpdateSetup(updated);
    try {
      await apiPut<MultiMonitorSetup>("/monitors", updated);
      const wp = wallpapers.find((w) => w.id === wallpaperId);
      if (wp) {
        toast.success(`"${wp.title}" aplicado ao ${activeMonitor.name}!`);
      }
    } catch {
      toast.error("Erro ao atualizar monitor.");
    }
  };

  return (
    <div 
      className="p-6 rounded-2xl bg-[#0B0E14]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-col gap-6 shadow-[0_0_30px_rgba(0,0,0,0.6)]"
      data-testid="multi-monitor-manager-section"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading">
              Gerenciador Multi-Monitor Gamer
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Configure papéis de parede em vídeo individuais para cada tela do seu setup
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#10141E] border border-white/5">
          {[
            { key: "independent", label: "Independente" },
            { key: "span", label: "Estendido (Span)" },
            { key: "clone", label: "Espelhado" },
          ].map((modeItem) => (
            <button
              key={modeItem.key}
              onClick={() => handleModeChange(modeItem.key as typeof setup.mode)}
              data-testid={`monitor-mode-${modeItem.key}`}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                setup.mode === modeItem.key
                  ? "bg-cyan-500 text-black font-bold shadow-[0_0_10px_rgba(0,240,255,0.5)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {modeItem.label}
            </button>
          ))}
        </div>
      </div>

      {/* Visual Multi-Monitor Setup Canvas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-6 rounded-2xl bg-[#06070B] border border-white/5">
        {setup.monitors.map((mon, index) => {
          const isSelected = selectedMonitorId === mon.id;
          const assignedWp = wallpapers.find((w) => w.id === mon.wallpaper_id) || wallpapers[0];

          return (
            <div
              key={mon.id}
              onClick={() => {
                setSelectedMonitorId(mon.id);
                if (assignedWp) onSelectMonitorPreview(assignedWp);
              }}
              data-testid={`monitor-card-${mon.id}`}
              className={`group cursor-pointer flex flex-col rounded-2xl overflow-hidden border-2 transition-all ${
                isSelected
                  ? "border-cyan-400 shadow-[0_0_25px_rgba(0,240,255,0.4)] scale-[1.02]"
                  : "border-white/10 hover:border-cyan-500/40 bg-[#10141E]"
              }`}
            >
              {/* Monitor Screen Frame */}
              <div className="relative aspect-video w-full bg-black overflow-hidden flex items-center justify-center">
                {assignedWp && (
                  <img
                    src={assignedWp.thumbnail_url || assignedWp.media_url}
                    alt={assignedWp.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-xs" />

                {/* Display ID Badge */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-cyan-300 font-mono text-[10px] border border-cyan-500/30">
                  <span className="font-bold">DISPLAY {index + 1}</span>
                  {mon.is_primary && <span className="text-yellow-400 font-bold">(MAIN)</span>}
                </div>

                {/* Hz Badge */}
                <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-green-500/20 text-green-300 font-mono text-[10px] border border-green-500/40 font-bold">
                  {mon.refresh_rate_hz}Hz
                </div>

                {/* Wallpaper Title on Screen */}
                <div className="absolute bottom-2.5 inset-x-2.5 p-2 rounded-lg bg-black/70 backdrop-blur-md text-center">
                  <span className="text-[11px] font-bold text-white line-clamp-1">
                    {assignedWp?.title || "Nenhum selecionado"}
                  </span>
                </div>
              </div>

              {/* Monitor Stand */}
              <div className="p-3 bg-[#0B0E14] flex flex-col gap-1 border-t border-white/5 text-xs font-mono">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-200 truncate">{mon.name}</span>
                  <span className="text-[10px] text-cyan-400 font-bold">{mon.resolution_key.toUpperCase()}</span>
                </div>
                <span className="text-[11px] text-slate-400">{mon.resolution}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Monitor Configuration Details */}
      {activeMonitor && (
        <div className="p-4 rounded-xl bg-[#10141E] border border-white/5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white font-mono uppercase">
                Ajustes do {activeMonitor.name}
              </span>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Resolução: <span className="text-cyan-400 font-bold">{activeMonitor.resolution}</span>
            </span>
          </div>

          {/* Quick Wallpaper Selector for this monitor */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-mono text-slate-400">Trocar Wallpaper Deste Monitor:</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
              {wallpapers.slice(0, 6).map((wp) => {
                const isAssigned = activeMonitor.wallpaper_id === wp.id;
                return (
                  <button
                    key={wp.id}
                    onClick={() => handleAssignWallpaper(activeMonitor.id, wp.id)}
                    data-testid={`assign-wp-${wp.id}-to-${activeMonitor.id}`}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-left ${
                      isAssigned
                        ? "bg-cyan-500/20 border-cyan-400 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                        : "bg-slate-900 border-white/5 hover:border-white/20"
                    }`}
                  >
                    <div className="aspect-video w-full rounded-lg overflow-hidden bg-black">
                      <img src={wp.thumbnail_url || wp.media_url} alt={wp.title} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-200 line-clamp-1 w-full text-center">
                      {wp.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
