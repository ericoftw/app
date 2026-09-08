import React, { useEffect, useRef } from "react";
import type { WallpaperShaderParams } from "@/types/wallpaper";

interface ShaderRendererProps {
  shaderType?: string;
  params?: WallpaperShaderParams;
  fpsLimit?: number;
  audioReactive?: boolean;
  audioSensitivity?: number;
}

export const ShaderRenderer: React.FC<ShaderRendererProps> = ({
  shaderType = "matrix_rain",
  params,
  fpsLimit = 60,
  audioReactive = true,
  audioSensitivity = 1.0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1280);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 720);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const color1 = params?.color1 || "#00F0FF";
    const color2 = params?.color2 || "#FF0055";
    const speed = params?.speed || 1.0;
    const particleCount = params?.particleCount || 100;

    let tick = 0;
    let lastTime = performance.now();
    const interval = 1000 / (fpsLimit || 60);

    // Matrix rain setup
    const fontSize = 16;
    const columns = Math.floor(width / fontSize);
    const drops = Array.from({ length: columns }, () => Math.floor(Math.random() * -50));
    const chars = "01LivePaperCyberゲーマー010101XYZΩλπµ§8400PROGPU240HZRTX";

    // Starfield setup
    const stars = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      size: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? color1 : color2,
    }));

    // Rain glass drops
    const rainDrops = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 20 + 10,
      speed: Math.random() * 8 + 4,
      radius: Math.random() * 2 + 1,
    }));

    const render = (now: number) => {
      animationFrameId = requestAnimationFrame(render);

      const delta = now - lastTime;
      if (delta < interval) return;
      lastTime = now - (delta % interval);

      tick += speed * 0.05;
      const audioPulse = audioReactive
        ? Math.sin(tick * 3) * 0.3 * audioSensitivity + 1.0
        : 1.0;

      // Render based on shader type
      if (shaderType === "matrix_rain") {
        ctx.fillStyle = "rgba(6, 7, 11, 0.15)";
        ctx.fillRect(0, 0, width, height);

        ctx.font = `${fontSize}px 'JetBrains Mono Variable', monospace`;
        for (let i = 0; i < drops.length; i++) {
          const text = chars.charAt(Math.floor(Math.random() * chars.length));
          const x = i * fontSize;
          const y = drops[i] * fontSize;

          // Glowing head
          ctx.fillStyle = i % 4 === 0 ? "#FFFFFF" : color1;
          ctx.shadowBlur = 8 * audioPulse;
          ctx.shadowColor = color1;
          ctx.fillText(text, x, y);

          if (y > height && Math.random() > 0.975) {
            drops[i] = 0;
          }
          drops[i] += 1;
        }
        ctx.shadowBlur = 0;
      } else if (shaderType === "synthwave_sun") {
        // Synthwave sunset & perspective grid
        ctx.fillStyle = "#06070B";
        ctx.fillRect(0, 0, width, height);

        // Gradient sky
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
        skyGrad.addColorStop(0, "#080014");
        skyGrad.addColorStop(0.6, "#240046");
        skyGrad.addColorStop(1, "#5A189A");
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height * 0.65);

        // Sun
        const sunRadius = Math.min(width, height) * 0.22 * audioPulse;
        const sunX = width / 2;
        const sunY = height * 0.55;

        const sunGrad = ctx.createLinearGradient(sunX, sunY - sunRadius, sunX, sunY + sunRadius);
        sunGrad.addColorStop(0, "#FFDD00");
        sunGrad.addColorStop(0.5, "#FF007F");
        sunGrad.addColorStop(1, "#7928CA");

        ctx.save();
        ctx.beginPath();
        ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
        ctx.fillStyle = sunGrad;
        ctx.shadowBlur = 40 * audioPulse;
        ctx.shadowColor = "#FF007F";
        ctx.fill();

        // Sun stripes
        ctx.fillStyle = "#080014";
        for (let i = 0; i < 8; i++) {
          const stripeY = sunY + (i * sunRadius) / 9;
          const stripeH = 3 + i * 1.5;
          ctx.fillRect(sunX - sunRadius - 10, stripeY, (sunRadius + 10) * 2, stripeH);
        }
        ctx.restore();

        // 3D Grid Floor
        const horizon = height * 0.65;
        const gridGrad = ctx.createLinearGradient(0, horizon, 0, height);
        gridGrad.addColorStop(0, "#080014");
        gridGrad.addColorStop(1, "#16002C");
        ctx.fillStyle = gridGrad;
        ctx.fillRect(0, horizon, width, height - horizon);

        ctx.strokeStyle = color1;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = color1;

        // Perspective vertical lines
        const numPerspLines = 24;
        for (let i = -numPerspLines; i <= numPerspLines; i++) {
          ctx.beginPath();
          ctx.moveTo(sunX, horizon);
          ctx.lineTo(sunX + i * 80, height);
          ctx.stroke();
        }

        // Horizontal moving lines
        const gridOffset = (tick * 40) % 35;
        for (let y = horizon; y < height; y += (y - horizon) * 0.18 + 4) {
          const drawY = y + gridOffset * ((y - horizon) / (height - horizon));
          if (drawY > horizon && drawY < height) {
            ctx.beginPath();
            ctx.moveTo(0, drawY);
            ctx.lineTo(width, drawY);
            ctx.stroke();
          }
        }
        ctx.shadowBlur = 0;
      } else if (shaderType === "audio_waves") {
        // Audio reactive holographic waveforms
        ctx.fillStyle = "rgba(6, 7, 11, 0.2)";
        ctx.fillRect(0, 0, width, height);

        const centerY = height / 2;
        const waveCount = 5;

        for (let w = 0; w < waveCount; w++) {
          ctx.beginPath();
          ctx.strokeStyle = w % 2 === 0 ? color1 : color2;
          ctx.lineWidth = 2 + w * 0.8;
          ctx.shadowBlur = 15 * audioPulse;
          ctx.shadowColor = w % 2 === 0 ? color1 : color2;

          for (let x = 0; x < width; x += 10) {
            const freq = 0.006 + w * 0.002;
            const amp = (60 + w * 25) * audioPulse;
            const y = centerY + Math.sin(x * freq + tick * (w + 1) * 0.6) * amp * Math.cos(tick * 0.5 + x * 0.003);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }

        // Central audio visualizer bars
        const barCount = 48;
        const barWidth = width / barCount - 6;
        for (let b = 0; b < barCount; b++) {
          const barHeight = Math.abs(Math.sin(tick * 2 + b * 0.3)) * (height * 0.35) * audioPulse;
          const bx = b * (barWidth + 6) + 3;
          const by = height - barHeight - 40;

          const barGrad = ctx.createLinearGradient(bx, by, bx, height - 40);
          barGrad.addColorStop(0, color1);
          barGrad.addColorStop(0.5, color2);
          barGrad.addColorStop(1, "transparent");

          ctx.fillStyle = barGrad;
          ctx.fillRect(bx, by, barWidth, barHeight);
        }
        ctx.shadowBlur = 0;
      } else if (shaderType === "starfield_vortex") {
        // 3D Starfield warp speed
        ctx.fillStyle = "rgba(6, 7, 11, 0.25)";
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2;
        const cy = height / 2;

        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          star.z -= speed * 12 * audioPulse;

          if (star.z <= 0) {
            star.z = width;
            star.x = (Math.random() - 0.5) * width * 2;
            star.y = (Math.random() - 0.5) * height * 2;
          }

          const k = 250 / star.z;
          const px = star.x * k + cx;
          const py = star.y * k + cy;

          if (px >= 0 && px <= width && py >= 0 && py <= height) {
            const size = (1 - star.z / width) * star.size * 2 * audioPulse;
            ctx.beginPath();
            ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
            ctx.fillStyle = star.color;
            ctx.shadowBlur = 6;
            ctx.shadowColor = star.color;
            ctx.fill();
          }
        }
        ctx.shadowBlur = 0;
      } else if (shaderType === "cyber_particles") {
        // Floating neon cyber particles with connecting data links
        ctx.fillStyle = "rgba(6, 7, 11, 0.22)";
        ctx.fillRect(0, 0, width, height);

        for (let i = 0; i < stars.length; i++) {
          const p = stars[i];
          // Reuse the star pool as 2D drifting particles
          p.x += Math.sin(tick + i) * 0.9 * speed;
          p.y += Math.cos(tick * 0.7 + i) * 0.9 * speed;

          const px = ((p.x % width) + width) % width;
          const py = ((p.y % height) + height) % height;
          const size = p.size * audioPulse;

          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.8, size), 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.shadowBlur = 10 * audioPulse;
          ctx.shadowColor = p.color;
          ctx.fill();

          // Data link lines between nearby particles
          if (i > 0) {
            const prev = stars[i - 1];
            const qx = ((prev.x % width) + width) % width;
            const qy = ((prev.y % height) + height) % height;
            const dist = Math.hypot(px - qx, py - qy);
            if (dist < 140) {
              ctx.beginPath();
              ctx.strokeStyle = color1;
              ctx.globalAlpha = 1 - dist / 140;
              ctx.lineWidth = 0.7;
              ctx.moveTo(px, py);
              ctx.lineTo(qx, qy);
              ctx.stroke();
              ctx.globalAlpha = 1;
            }
          }
        }
        ctx.shadowBlur = 0;
      } else {
        // Rain on glass
        ctx.fillStyle = "rgba(10, 14, 24, 0.3)";
        ctx.fillRect(0, 0, width, height);

        ctx.strokeStyle = "rgba(100, 200, 255, 0.6)";
        ctx.lineWidth = 1.5;

        for (let i = 0; i < rainDrops.length; i++) {
          const drop = rainDrops[i];
          ctx.beginPath();
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.len);
          ctx.stroke();

          drop.y += drop.speed * speed;
          if (drop.y > height) {
            drop.y = -drop.len;
            drop.x = Math.random() * width;
          }
        }
      }
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [shaderType, params, fpsLimit, audioReactive, audioSensitivity]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block absolute inset-0 pointer-events-none"
      data-testid="shader-canvas"
    />
  );
};
