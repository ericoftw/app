import React from "react";
import { 
  Sliders, 
  Sun, 
  Contrast, 
  Palette, 
  Eye, 
  RotateCcw, 
  Zap, 
  Volume2, 
  VolumeX, 
  Tv, 
  Gauge,
  Sparkles,
  Maximize
} from "lucide-react";

interface FXStudioPanelProps {
  brightness: number;
  setBrightness: (val: number) => void;
  contrast: number;
  setContrast: (val: number) => void;
  saturation: number;
  setSaturation: (val: number) => void;
  hueRotate: number;
  setHueRotate: (val: number) => void;
  blur: number;
  setBlur: (val: number) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (val: number) => void;
  volume: number;
  setVolume: (val: number) => void;
  isMuted: boolean;
  setIsMuted: (val: boolean) => void;
  crtFilter: boolean;
  setCrtFilter: (val: boolean) => void;
  fitMode: "cover" | "contain" | "stretch" | "center";
  setFitMode: (mode: "cover" | "contain" | "stretch" | "center") => void;
  audioReactive: boolean;
  setAudioReactive: (val: boolean) => void;
  audioSensitivity: number;
  setAudioSensitivity: (val: number) => void;
  onReset: () => void;
}

export const FXStudioPanel: React.FC<FXStudioPanelProps> = ({
  brightness,
  setBrightness,
  contrast,
  setContrast,
  saturation,
  setSaturation,
  hueRotate,
  setHueRotate,
  blur,
  setBlur,
  playbackSpeed,
  setPlaybackSpeed,
  volume,
  setVolume,
  isMuted,
  setIsMuted,
  crtFilter,
  setCrtFilter,
  fitMode,
  setFitMode,
  audioReactive,
  setAudioReactive,
  audioSensitivity,
  setAudioSensitivity,
  onReset,
}) => {
  return (
    <div 
      className="p-5 rounded-2xl bg-[#0B0E14]/90 border border-cyan-500/20 backdrop-blur-xl flex flex-col gap-5 shadow-[0_0_25px_rgba(0,0,0,0.5)]"
      data-testid="fx-studio-panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-heading tracking-wide">FX Studio & Vídeo</h3>
            <p className="text-xs text-slate-400 font-mono">Ajustes em tempo real e filtros de GPU</p>
          </div>
        </div>

        <button
          onClick={onReset}
          data-testid="reset-fx-button"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#141A28] hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 text-xs font-mono transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Resetar</span>
        </button>
      </div>

      {/* Adjustments Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Brightness */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#10141E] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sun className="w-3.5 h-3.5 text-yellow-400" />
              Brilho
            </span>
            <span className="font-mono text-cyan-400 font-bold">{brightness}%</span>
          </div>
          <input
            type="range"
            min="40"
            max="180"
            value={brightness}
            onChange={(e) => setBrightness(Number(e.target.value))}
            data-testid="fx-brightness-slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Contrast */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#10141E] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Contrast className="w-3.5 h-3.5 text-blue-400" />
              Contraste
            </span>
            <span className="font-mono text-cyan-400 font-bold">{contrast}%</span>
          </div>
          <input
            type="range"
            min="50"
            max="180"
            value={contrast}
            onChange={(e) => setContrast(Number(e.target.value))}
            data-testid="fx-contrast-slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Saturation */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#10141E] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Palette className="w-3.5 h-3.5 text-pink-400" />
              Saturação
            </span>
            <span className="font-mono text-pink-400 font-bold">{saturation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            value={saturation}
            onChange={(e) => setSaturation(Number(e.target.value))}
            data-testid="fx-saturation-slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
          />
        </div>

        {/* Hue Rotate */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#10141E] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              Matiz (Hue)
            </span>
            <span className="font-mono text-purple-400 font-bold">{hueRotate}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            value={hueRotate}
            onChange={(e) => setHueRotate(Number(e.target.value))}
            data-testid="fx-huerotate-slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#10141E] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Gauge className="w-3.5 h-3.5 text-green-400" />
              Velocidade do Vídeo
            </span>
            <span className="font-mono text-green-400 font-bold">{playbackSpeed}x</span>
          </div>
          <input
            type="range"
            min="0.25"
            max="2.0"
            step="0.25"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
            data-testid="fx-speed-slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
        </div>

        {/* Blur */}
        <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#10141E] border border-white/5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Desfoque (Gaussian Blur)
            </span>
            <span className="font-mono text-cyan-400 font-bold">{blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="15"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            data-testid="fx-blur-slider"
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      {/* Audio & Audio Reactivity Settings */}
      <div className="p-4 rounded-xl bg-[#10141E] border border-white/5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Áudio & Reatividade Sonora</span>
          </div>
          <button
            onClick={() => setIsMuted(!isMuted)}
            data-testid="fx-mute-toggle"
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
              isMuted 
                ? "bg-pink-500/20 text-pink-400 border border-pink-500/30" 
                : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
            }`}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            <span>{isMuted ? "Mutado" : `${volume}%`}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Volume Slider */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Volume do Papel de Parede</span>
              <span className="text-white">{isMuted ? "0%" : `${volume}%`}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              disabled={isMuted}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              data-testid="fx-volume-slider"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 disabled:opacity-30"
            />
          </div>

          {/* Audio Reactivity Sensitivity */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Sensibilidade às Músicas/Jogos</span>
              <span className="text-cyan-400">{audioSensitivity}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.5"
              step="0.1"
              value={audioSensitivity}
              onChange={(e) => setAudioSensitivity(Number(e.target.value))}
              data-testid="fx-audio-sensitivity-slider"
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* Toggles & Aspect Fit Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* CRT Scanline Toggle */}
        <button
          onClick={() => setCrtFilter(!crtFilter)}
          data-testid="fx-crt-toggle"
          className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
            crtFilter 
              ? "bg-pink-500/10 border-pink-500/40 text-pink-300 shadow-[0_0_15px_rgba(255,0,85,0.2)]" 
              : "bg-[#10141E] border-white/5 text-slate-400 hover:text-white"
          }`}
        >
          <div className="flex items-center gap-2">
            <Tv className="w-4 h-4" />
            <span className="text-xs font-semibold">CRT Scanlines HUD</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 uppercase">
            {crtFilter ? "Ativo" : "Desligado"}
          </span>
        </button>

        {/* Fit Mode Selector */}
        <div className="p-3 rounded-xl bg-[#10141E] border border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-300">
            <Maximize className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold">Ajuste de Tela:</span>
          </div>
          <div className="flex items-center gap-1">
            {(["cover", "contain", "stretch", "center"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFitMode(mode)}
                data-testid={`fit-mode-${mode}`}
                className={`px-2 py-1 rounded text-[10px] font-mono uppercase transition-all ${
                  fitMode === mode
                    ? "bg-cyan-500 text-black font-bold"
                    : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {mode === "cover" ? "Fill" : mode === "contain" ? "Fit" : mode === "stretch" ? "Stretch" : "Center"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
