export interface ScriptExportRequest {
  wallpaper_id: string;
  target_os?: string;
  script_type: "powershell" | "batch" | "lively_zip" | "wallpaper_engine_json";
  resolution: string;
  fps_limit?: number;
  auto_pause_fullscreen?: boolean;
  audio_enabled?: boolean;
  volume?: number;
  fit_mode?: string;
  hardware_acceleration?: boolean;
}

export interface ScriptExportResponse {
  script_type: string;
  filename: string;
  content: string;
  instructions: string[];
  download_ready: boolean;
  metadata?: Record<string, unknown>;
}
