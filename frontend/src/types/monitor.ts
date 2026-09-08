export interface MonitorConfig {
  id: string;
  name: string;
  resolution: string;
  resolution_key: string;
  aspect_ratio: string;
  refresh_rate_hz: number;
  wallpaper_id: string;
  fit_mode: "cover" | "contain" | "stretch" | "center";
  brightness: number;
  contrast: number;
  saturation: number;
  playback_speed: number;
  volume: number;
  is_primary: boolean;
  orientation: "landscape" | "portrait";
  crt_filter: boolean;
  audio_reactive: boolean;
}

export interface MultiMonitorSetup {
  mode: "independent" | "span" | "clone";
  monitors: MonitorConfig[];
  updated_at?: string;
}
