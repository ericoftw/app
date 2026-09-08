import type { WallpaperShaderParams } from "./wallpaper";

export interface AIGenerateWallpaperRequest {
  prompt: string;
  style: "cyberpunk" | "synthwave" | "scifi" | "anime" | "rain_lofi" | "abstract";
  target_resolution: string;
  fps_target: number;
  include_audio_reactivity: boolean;
  color_vibe?: string;
}

export interface AIGenerateWallpaperResponse {
  id: string;
  title: string;
  description: string;
  prompt: string;
  shader_type: string;
  shader_params: WallpaperShaderParams;
  color_palette: string[];
  lively_config: Record<string, unknown>;
  recommended_resolution: string;
  fps: number;
  preview_thumbnail: string;
  media_url: string;
  category: string;
  format: string;
}
