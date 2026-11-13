"use client";

import { useEffect, useRef } from "react";

export function HeroAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cellWidth = 12;
    const cellHeight = 18;
    const glyphs = " .:-=+*#%@";
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let width = 0;
    let height = 0;
    let columns = 0;
    let rows = 0;
    let raf = 0;

    const draw = (time: number) => {
      if (!width || !height) return;

      context.clearRect(0, 0, width, height);
      context.font = "12px 'Courier New', monospace";
      context.textBaseline = "middle";
      context.textAlign = "center";

      const motion = reducedMotion.matches ? 0 : time * 0.00032;

      for (let row = 0; row < rows; row++) {
        const y = row / Math.max(1, rows - 1);
        for (let column = 0; column < columns; column++) {
          const x = column / Math.max(1, columns - 1);
          const waveA = Math.sin(x * 10.5 + motion * 1.4 + Math.sin(y * 5.2) * 0.8);
          const waveB = Math.cos(y * 12 - motion * 0.8 + x * 3.4);
          const ridge = Math.exp(-Math.pow((x - 0.52 + Math.sin(motion) * 0.08) * 3.1, 2));
          const distance = Math.abs(y - (0.5 + waveA * 0.12 + waveB * 0.035));
          const field = Math.max(0, 1 - distance * 4.2) * 0.66 + ridge * 0.28;
          const shimmer = 0.5 + 0.5 * Math.sin(column * 0.21 + row * 0.13 - motion * 3);
          // Shape the lower edge into a moving ASCII wave instead of a flat cutoff.
          const waveEdge = 0.72
            + Math.sin(x * 8.4 + motion * 0.9) * 0.045
            + Math.sin(x * 16.2 - motion * 0.55) * 0.014;
          const edgeFade = Math.min(1, Math.max(0, (waveEdge - y) / 0.075));
          const intensity = Math.min(1, Math.max(0, field * (0.72 + shimmer * 0.28) * edgeFade));
          if (intensity < 0.09) continue;

          const glyphIndex = Math.min(glyphs.length - 1, Math.floor(intensity * (glyphs.length - 1)));
          const alpha = 0.12 + intensity * 0.76;
          context.fillStyle = `rgba(126, 232, 181, ${alpha})`;
          context.fillText(glyphs[glyphIndex], column * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2);
        }
      }
    };

    const animate = (time: number) => {
      draw(time);
      if (!reducedMotion.matches) raf = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      columns = Math.ceil(width / cellWidth);
      rows = Math.ceil(height / cellHeight);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    if (!reducedMotion.matches) raf = window.requestAnimationFrame(animate);

    const onMotionChange = () => {
      window.cancelAnimationFrame(raf);
      draw(0);
      if (!reducedMotion.matches) raf = window.requestAnimationFrame(animate);
    };
    reducedMotion.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(raf);
      reducedMotion.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />
    </div>
  );
}
