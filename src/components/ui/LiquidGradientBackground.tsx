"use client";

import { useEffect, useMemo, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

type Rgb = {
  r: number;
  g: number;
  b: number;
};

const DEFAULT_COLORS = ["#F6C1FF", "#BFF3E6", "#FFF2C2", "#CDBBFF", "#AEEEEE"];

function hexToRgb(hex: string): Rgb {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 255, g: 255, b: 255 };
}

function paintGradient(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  colors: Rgb[],
  time: number,
  distortionAmount: number,
  distortionScale: number,
  overlayOffset = 0
) {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;
  const scale = distortionScale * 3;

  const noise = (x: number, y: number, t: number) =>
    Math.sin(x * scale + t) * Math.cos(y * scale - t * 0.5) +
    Math.sin((x + y) * scale * 0.5 + t * 0.7) * 0.5;

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const nx = x / width;
      const ny = y / height;
      const distortion =
        noise(nx * 2 + overlayOffset, ny * 2 + overlayOffset, time + overlayOffset) *
        distortionAmount;
      const angle = Math.atan2(ny - 0.5, nx - 0.5) + distortion + overlayOffset * 1.6;
      const dist = Math.sqrt((nx - 0.5) ** 2 + (ny - 0.5) ** 2);
      const gradientPos =
        (Math.sin(angle * 2 + time * 0.5) * 0.5 + 0.5 + dist + time * 0.3) % 1;

      const colorIndex = gradientPos * (colors.length - 1);
      const colorIdx1 = Math.floor(colorIndex);
      const colorIdx2 = Math.min(colorIdx1 + 1, colors.length - 1);
      const colorMix = colorIndex - colorIdx1;
      const c1 = colors[colorIdx1];
      const c2 = colors[colorIdx2];
      const r = c1.r + (c2.r - c1.r) * colorMix;
      const g = c1.g + (c2.g - c1.g) * colorMix;
      const b = c1.b + (c2.b - c1.b) * colorMix;

      for (let dy = 0; dy < 2 && y + dy < height; dy++) {
        for (let dx = 0; dx < 2 && x + dx < width; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function LiquidGradientBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const colors = useMemo(() => DEFAULT_COLORS.map(hexToRgb), []);

  useEffect(() => {
    if (theme !== "light") {
      return;
    }

    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!canvas || !overlayCanvas) {
      return;
    }

    const ctx = canvas.getContext("2d", { willReadFrequently: false });
    const overlayCtx = overlayCanvas.getContext("2d", { willReadFrequently: false });

    if (!ctx || !overlayCtx) {
      return;
    }

    const resize = () => {
      const renderScale = 0.34;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.ceil(window.innerWidth * dpr * renderScale));
      const height = Math.max(1, Math.ceil(window.innerHeight * dpr * renderScale));

      canvas.width = width;
      canvas.height = height;
      overlayCanvas.width = width;
      overlayCanvas.height = height;
    };

    const render = () => {
      timeRef.current += 0.1 * 0.016;

      paintGradient(ctx, canvas.width, canvas.height, colors, timeRef.current, 0.6, 0.35);
      paintGradient(
        overlayCtx,
        overlayCanvas.width,
        overlayCanvas.height,
        colors,
        timeRef.current,
        0.6,
        0.35,
        0.3
      );

      if (!prefersReducedMotion) {
        animationFrameRef.current = requestAnimationFrame(render);
      }
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      window.removeEventListener("resize", resize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [colors, theme]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#FAF6FA] opacity-100 transition-opacity duration-500 dark:opacity-0"
    >
      <canvas
        ref={canvasRef}
        className="block h-full w-full scale-110"
        style={{
          filter: "blur(25px) saturate(122%) contrast(93%)",
        }}
      />
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 block h-full w-full scale-110 opacity-[0.18]"
        style={{
          filter: "blur(40px) saturate(122%) contrast(93%)",
        }}
      />
      <div className="absolute inset-0 bg-white/20" />
    </div>
  );
}
