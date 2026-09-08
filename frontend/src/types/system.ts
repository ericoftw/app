export interface GamingProfile {
  id: "ultra_esports" | "balanced" | "battery_saver" | "custom";
  name: string;
  description: string;
  target_fps: number;
  gpu_throttle: string;
  auto_pause_games: boolean;
  auto_pause_battery: boolean;
  hardware_acceleration: boolean;
  rendering_engine: string;
}

export interface SupportedResolution {
  key: string;
  label: string;
  width: number;
  height: number;
  aspect_ratio: string;
  description: string;
  gamer_tier: string;
}

export interface SupportedFormat {
  key: string;
  label: string;
  extensions: string[];
  description: string;
  decoder: string;
  windows_support: string;
  fps_range: string;
  audio_reactivity: boolean;
}
