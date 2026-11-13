"use client";

import { useEffect, useRef } from "react";

type Particle = { x: number; z: number; phase: number; size: number; alpha: number };

export function HeroAtmosphere() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !context) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let width = 0;
    let height = 0;
    let raf = 0;
    let particles: Particle[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const createParticles = () => {
      const side = Math.ceil(Math.sqrt(Math.min(1250, Math.max(420, Math.floor((width * height) / 1250)))));
      const count = side * side;
      particles = Array.from({ length: count }, (_, index) => ({
        x: (index % side) / (side - 1) * 2 - 1,
        z: Math.floor(index / side) / (side - 1),
        phase: Math.random() * Math.PI * 2,
        size: 0.45 + Math.random() * 0.75,
        alpha: 0.22 + Math.random() * 0.62,
      }));
    };

    const draw = (time: number) => {
      if (!width || !height) return;
      context.clearRect(0, 0, width, height);

      const glow = context.createRadialGradient(width * 0.52, height * 0.5, 0, width * 0.52, height * 0.5, width * 0.78);
      glow.addColorStop(0, "rgba(7, 35, 91, 0.48)");
      glow.addColorStop(0.48, "rgba(3, 19, 55, 0.32)");
      glow.addColorStop(1, "rgba(2, 5, 20, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const speed = reducedMotion.matches ? 0 : time * 0.00022;
      const centerY = height * 0.56;
      const amplitude = Math.min(height * 0.3, 190);
      const project = (x: number, z: number, phase: number) => {
        const flow = Math.sin(x * 4.1 + speed + phase * 0.12) * 0.42
          + Math.sin(x * 8.3 - speed * 1.3 + z * 5.2) * 0.19
          + Math.cos(z * 8 + speed * 0.7 + phase) * 0.1;
        const ridge = Math.exp(-Math.pow((x - 0.08) * 2.1, 2)) * 0.48
          - Math.exp(-Math.pow((x - 0.58) * 2.8, 2)) * 0.24;
        const y = centerY + (flow + ridge) * amplitude + (z - 0.5) * height * 0.34;
        const perspective = 0.62 + z * 0.65;
        return {
          x: width * 0.5 + x * width * 0.54 * perspective,
          y,
          scale: perspective,
        };
      };

      for (let line = 0; line < 34; line++) {
        const z = line / 34;
        context.beginPath();
        for (let step = 0; step <= 100; step++) {
          const x = step / 50 - 1;
          const point = project(x, z, line * 0.11);
          if (step === 0) context.moveTo(point.x, point.y);
          else context.lineTo(point.x, point.y);
        }
        context.strokeStyle = `rgba(28, 105, 231, ${0.035 + z * 0.055})`;
        context.lineWidth = 0.55 + z * 0.45;
        context.stroke();
      }

      for (const particle of particles) {
        const point = project(particle.x, particle.z, particle.phase);
        if (point.y < -10 || point.y > height + 10) continue;
        const pulse = reducedMotion.matches ? 1 : 0.72 + Math.sin(speed * 5 + particle.phase) * 0.22;
        const alpha = particle.alpha * pulse * (0.38 + particle.z * 0.62);
        context.fillStyle = `rgba(92, 160, 255, ${alpha})`;
        context.beginPath();
        context.arc(point.x, point.y, particle.size * point.scale, 0, Math.PI * 2);
        context.fill();
      }

      context.fillStyle = "rgba(60, 115, 210, 0.035)";
      for (let y = 0; y < height; y += 5) context.fillRect(0, y, width, 0.6);

      const vignette = context.createLinearGradient(0, 0, 0, height);
      vignette.addColorStop(0, "rgba(3, 5, 20, 0.12)");
      vignette.addColorStop(0.72, "rgba(3, 5, 20, 0)");
      vignette.addColorStop(1, "rgba(3, 5, 20, 0.5)");
      context.fillStyle = vignette;
      context.fillRect(0, 0, width, height);
    };

    const animate = (time: number) => {
      draw(time);
      if (!reducedMotion.matches) raf = window.requestAnimationFrame(animate);
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
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
