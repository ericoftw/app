#!/usr/bin/env python3
"""Render self-hosted gamer live-wallpaper video loops (VP9 WebM + H.264 MP4).

Frames are generated procedurally with numpy so the loops are seamless and need
no external asset. Output lands in frontend/public/wallpapers/ and is served by
Vite at /wallpapers/<name>.<ext>, so playback never depends on a third-party CDN.
"""
import math
import subprocess
import sys
from pathlib import Path

import numpy as np

OUT_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "public" / "wallpapers"
OUT_DIR.mkdir(parents=True, exist_ok=True)

W, H = 1280, 720
FPS = 30
SECONDS = 6
N_FRAMES = FPS * SECONDS


def hex_rgb(h):
    h = h.lstrip("#")
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], dtype=np.float32)


def frame_neon_city(t):
    """Cyberpunk skyline: parallax neon towers + scanning light sweep."""
    img = np.zeros((H, W, 3), dtype=np.float32)
    yy = np.linspace(0, 1, H)[:, None]
    # Night sky gradient
    img += (hex_rgb("#0A0420") * (1 - yy) + hex_rgb("#2B0B4A") * yy)[None, :] if False else 0
    sky = hex_rgb("#0A0420")[None, None, :] * (1 - yy)[:, :, None] + hex_rgb("#3A0F5F")[None, None, :] * yy[:, :, None]
    img += sky

    rng = np.random.default_rng(7)
    xs = np.arange(W)
    # Three parallax layers of buildings
    for layer, (depth, base_col, speed) in enumerate([
        (0.45, hex_rgb("#12043A"), 0.15),
        (0.65, hex_rgb("#1E0A55"), 0.35),
        (0.85, hex_rgb("#2A0E6E"), 0.70),
    ]):
        n_b = 16 + layer * 8
        widths = rng.integers(40, 130, n_b)
        heights = rng.integers(int(H * 0.20), int(H * 0.62), n_b)
        offset = (t * speed * W) % W
        x = -offset
        for i in range(n_b):
            bw, bh = int(widths[i]), int(heights[i])
            top = int(H * depth) - bh // 2
            top = max(top, 0)
            x0, x1 = int(x), int(x + bw)
            for xa, xb in ((x0, x1), (x0 + W, x1 + W)):
                xa_c, xb_c = max(xa, 0), min(xb, W)
                if xb_c > xa_c:
                    img[top:H, xa_c:xb_c] = base_col
                    # Lit windows
                    for wy in range(top + 8, H - 6, 16):
                        for wx in range(xa_c + 5, xb_c - 4, 14):
                            if rng.random() < 0.30:
                                col = hex_rgb("#00F0FF") if rng.random() < 0.6 else hex_rgb("#FF0055")
                                img[wy:wy + 6, wx:wx + 6] = col * (0.55 + 0.45 * math.sin(t * 6.283 + wx))
            x += bw + rng.integers(10, 40)

    # Horizontal scanning light sweep
    sweep = (math.sin(t * 2 * math.pi) * 0.5 + 0.5) * H
    band = np.exp(-((np.arange(H) - sweep) ** 2) / (2 * 40.0 ** 2))[:, None, None]
    img += band * hex_rgb("#00F0FF")[None, None, :] * 0.35

    return np.clip(img, 0, 255).astype(np.uint8)


def frame_synthwave(t):
    """Retro synthwave sun + infinite perspective grid."""
    img = np.zeros((H, W, 3), dtype=np.float32)
    horizon = int(H * 0.58)

    yy = np.linspace(0, 1, horizon)[:, None, None]
    img[:horizon] = hex_rgb("#150033")[None, None, :] * (1 - yy) + hex_rgb("#7A1B8B")[None, None, :] * yy

    # Sun with retro slats
    cx, cy, r = W // 2, int(horizon * 0.92), int(H * 0.30)
    Y, X = np.ogrid[:H, :W]
    d = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
    sun = d < r
    grad = np.clip((cy + r - Y) / (2 * r), 0, 1)
    grad_f = np.broadcast_to(grad, (H, W))[:, :, None]
    sun_col = np.broadcast_to(
        hex_rgb("#FFD400")[None, None, :] * grad_f + hex_rgb("#FF007F")[None, None, :] * (1 - grad_f),
        (H, W, 3),
    )
    img[sun] = sun_col[sun]
    for i, sy in enumerate(range(cy, cy + r, 12)):
        thick = 2 + i // 2
        img[sy:sy + thick, :][sun[sy:sy + thick, :]] = hex_rgb("#150033")

    # Ground
    img[horizon:] = hex_rgb("#10001F")

    # Perspective grid lines (vertical)
    for i in range(-26, 27):
        for yg in range(horizon, H):
            frac = (yg - horizon) / max(H - horizon, 1)
            xg = int(cx + i * 34 * (frac ** 1.35) * 3.2)
            if 0 <= xg < W:
                img[yg, max(xg - 1, 0):xg + 2] = hex_rgb("#00F0FF") * 0.85

    # Horizontal grid lines scrolling toward the viewer
    phase = (t * FPS * 0.9) % 26
    k = 0.0
    while k < 60:
        frac = ((k + phase) % 60) / 60.0
        yg = horizon + int((H - horizon) * (frac ** 2.4))
        if horizon < yg < H:
            img[yg:yg + 2, :] = hex_rgb("#FF3DAE") * 0.9
        k += 2.4

    return np.clip(img, 0, 255).astype(np.uint8)


def frame_matrix(t):
    """Green digital rain."""
    img = np.zeros((H, W, 3), dtype=np.float32)
    img += hex_rgb("#020A05")[None, None, :]
    rng = np.random.default_rng(11)
    cols = W // 14
    speeds = rng.uniform(0.6, 2.2, cols)
    starts = rng.uniform(0, H, cols)
    for c in range(cols):
        x = c * 14
        head = (starts[c] + t * FPS * speeds[c] * 9) % (H + 260) - 130
        for k in range(24):
            y = int(head - k * 16)
            if 0 <= y < H - 12:
                fade = max(0.0, 1.0 - k / 24.0)
                col = hex_rgb("#CFFFE0") if k == 0 else hex_rgb("#00FF66") * fade
                img[y:y + 12, x:x + 9] = np.maximum(img[y:y + 12, x:x + 9], col)
    return np.clip(img, 0, 255).astype(np.uint8)


def frame_starfield(t):
    """Warp-speed starfield with streaks."""
    img = np.zeros((H, W, 3), dtype=np.float32)
    img += hex_rgb("#02030A")[None, None, :]
    rng = np.random.default_rng(3)
    n = 420
    ang = rng.uniform(0, 2 * math.pi, n)
    rad0 = rng.uniform(0.02, 1.0, n)
    cx, cy = W / 2, H / 2
    for i in range(n):
        rr = (rad0[i] + t * 0.55) % 1.0
        r_px = rr ** 2.2 * (W * 0.72)
        x, y = int(cx + math.cos(ang[i]) * r_px), int(cy + math.sin(ang[i]) * r_px * 0.62)
        streak = int(2 + rr * 26)
        col = hex_rgb("#00F0FF") if i % 3 else hex_rgb("#B36BFF")
        for s in range(streak):
            xs = int(x - math.cos(ang[i]) * s)
            ys = int(y - math.sin(ang[i]) * s * 0.62)
            if 0 <= xs < W - 2 and 0 <= ys < H - 2:
                img[ys:ys + 2, xs:xs + 2] = np.maximum(img[ys:ys + 2, xs:xs + 2], col * (1 - s / streak))
    return np.clip(img, 0, 255).astype(np.uint8)


def frame_audio_waves(t):
    """Audio-reactive neon spectrum bars + waveforms."""
    img = np.zeros((H, W, 3), dtype=np.float32)
    img += hex_rgb("#05070F")[None, None, :]

    # Waveforms
    xs = np.arange(W)
    for wv, col in enumerate([hex_rgb("#00F0FF"), hex_rgb("#FF0055"), hex_rgb("#B36BFF")]):
        amp = (70 + wv * 26)
        ys = (H * 0.42 + np.sin(xs * (0.006 + wv * 0.0022) + t * 6.283 * (wv + 1)) * amp
              * np.cos(t * 3.1 + xs * 0.003)).astype(int)
        for k in range(-2, 3):
            yk = np.clip(ys + k, 0, H - 1)
            img[yk, xs] = np.maximum(img[yk, xs], col * (1 - abs(k) / 3.5))

    # Spectrum bars
    n_bars = 56
    bw = W // n_bars
    for b in range(n_bars):
        h_b = abs(math.sin(t * 6.283 * 2 + b * 0.36)) * (H * 0.40) + 12
        x0 = b * bw + 3
        y0 = int(H - h_b - 30)
        grad = np.linspace(1.0, 0.0, H - 30 - y0)[:, None]
        seg = hex_rgb("#00F0FF")[None, :] * grad + hex_rgb("#FF0055")[None, :] * (1 - grad)
        img[y0:H - 30, x0:x0 + bw - 6] = np.maximum(img[y0:H - 30, x0:x0 + bw - 6], seg[:, None, :])
    return np.clip(img, 0, 255).astype(np.uint8)


def frame_rain(t):
    """Rain on neon-lit glass."""
    img = np.zeros((H, W, 3), dtype=np.float32)
    yy = np.linspace(0, 1, H)[:, None, None]
    img += hex_rgb("#050A18")[None, None, :] * (1 - yy) + hex_rgb("#12213F")[None, None, :] * yy

    rng = np.random.default_rng(23)
    # Blurred neon bokeh behind the glass
    for _ in range(26):
        bx, by = rng.integers(0, W), rng.integers(0, H)
        rr = rng.integers(26, 80)
        col = hex_rgb("#FF7A3D") if rng.random() < 0.5 else hex_rgb("#3DDBFF")
        Y, X = np.ogrid[:H, :W]
        g = np.exp(-(((X - bx) ** 2 + (Y - by) ** 2) / (2.0 * rr ** 2)))
        img += g[:, :, None] * col[None, None, :] * 0.30

    # Falling droplet trails
    n = 150
    xs = rng.integers(0, W, n)
    y0 = rng.uniform(0, H, n)
    sp = rng.uniform(3.5, 11.0, n)
    for i in range(n):
        y = int((y0[i] + t * FPS * sp[i] * 3) % (H + 60)) - 30
        ln = int(10 + sp[i] * 2.4)
        for s in range(ln):
            yy2 = y + s
            if 0 <= yy2 < H:
                img[yy2, max(xs[i] - 1, 0):xs[i] + 1] += hex_rgb("#CFEBFF") * 0.5 * (1 - s / ln)
    return np.clip(img, 0, 255).astype(np.uint8)


SCENES = {
    "neon-city": frame_neon_city,
    "synthwave-highway": frame_synthwave,
    "matrix-rain": frame_matrix,
    "warp-starfield": frame_starfield,
    "audio-spectrum": frame_audio_waves,
    "rainy-neon-glass": frame_rain,
}


def encode(name, fn):
    raw = OUT_DIR / f"{name}.raw"
    with open(raw, "wb") as f:
        for i in range(N_FRAMES):
            f.write(fn(i / N_FRAMES).tobytes())

    common = ["-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", str(raw)]

    # VP9 WebM — plays in every modern browser incl. codec-limited Chromium builds
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *common,
         "-c:v", "libvpx-vp9", "-b:v", "0", "-crf", "36", "-row-mt", "1",
         "-pix_fmt", "yuv420p", str(OUT_DIR / f"{name}.webm")],
        check=True,
    )
    # H.264 MP4 — the format Windows/Wallpaper Engine consumes natively
    subprocess.run(
        ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", *common,
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "26",
         "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(OUT_DIR / f"{name}.mp4")],
        check=True,
    )
    raw.unlink()
    wsz = (OUT_DIR / f"{name}.webm").stat().st_size / 1e6
    msz = (OUT_DIR / f"{name}.mp4").stat().st_size / 1e6
    print(f"[+] {name}: webm {wsz:.2f} MB | mp4 {msz:.2f} MB")


if __name__ == "__main__":
    only = sys.argv[1:] or list(SCENES)
    for n in only:
        print(f"[*] rendering {n} ...")
        encode(n, SCENES[n])
    print("[done] ->", OUT_DIR)
