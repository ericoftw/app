export type WallpaperFormat = "mp4" | "webm" | "mkv" | "gif" | "shader" | "stream_url";

export type WallpaperCategory = 
  | "cyberpunk" 
  | "synthwave" 
  | "scifi" 
  | "anime" 
  | "rain_lofi" 
  | "gaming_esports" 
  | "abstract" 
  | "custom";

export type GamerResolutionKey = 
  | "1080p" 
  | "1440p" 
  | "4k" 
  | "ultrawide_21_9" 
  | "super_ultrawide_32_9";

export interface WallpaperShaderParams {
  speed?: number;
  glow?: number;
  particleCount?: number;
  audioSensitivity?: number;
  color1?: string;
  color2?: string;
  color3?: string;
  bloom?: boolean;
  fps_target?: number;
  [key: string]: unknown;
}

export interface Wallpaper {
  id: string;
  title: string;
  description: string;
  format: WallpaperFormat;
  category: WallpaperCategory | string;
  resolutions: string[];
  aspect_ratio: string;
  fps: number;
  media_url: string;
  thumbnail_url: string;
  shader_type?: string;
  shader_code?: string;
  shader_params?: WallpaperShaderParams;
  is_favorite: boolean;
  is_curated: boolean;
  tags: string[];
  file_size_mb: number;
  audio_supported: boolean;
  author: string;
  download_url?: string;
  created_at: string;
}

export interface WallpaperCreate {
  title: string;
  description: string;
  format: WallpaperFormat;
  category: string;
  resolutions: string[];
  aspect_ratio: string;
  fps: number;
  media_url: string;
  thumbnail_url?: string;
  shader_type?: string;
  shader_code?: string;
  shader_params?: WallpaperShaderParams;
  tags: string[];
  file_size_mb?: number;
  audio_supported: boolean;
  author?: string;
}

export interface WallpaperUpdate {
  title?: string;
  description?: string;
  category?: string;
  resolutions?: string[];
  aspect_ratio?: string;
  fps?: number;
  media_url?: string;
  thumbnail_url?: string;
  shader_type?: string;
  shader_code?: string;
  shader_params?: WallpaperShaderParams;
  is_favorite?: boolean;
  tags?: string[];
  audio_supported?: boolean;
}
