"use client";

import { useEffect, useRef } from "react";

// Hero background: rows of Drew commands drifting in perspective, tinted with
// the brand green and faded at the edges (inspired by text-field heroes).
const WORDS = [
  "/opsec enable nuke", "/sudo enter", "/api token create", "anti-raid", "/verify setup", "audit log",
  "/bkp save full", "join_rate_limit", "whitelist", "/giveaway start", "dry_run: true", "/logs channel",
  "nuke_punishment: ban", "PATCH /settings", "shard 0 · online", "/api docs", "verification_role_id",
  "anti_nuke_enabled", "GET /schema", "/music play", "/av scanfile", "log_enabled_events",
];

export function CommandField({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let rows: { y: number; speed: number; offset: number; text: string; alpha: number }[] = [];
    let frame = 0;
    const mono = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim() || "ui-monospace";

    const build = () => {
      // Layout size, not the transformed (perspective) bounding box.
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const lineHeight = 22;
      rows = Array.from({ length: Math.ceil(height / lineHeight) + 1 }, (_, i) => {
        let text = "";
        while (text.length < 260) text += WORDS[Math.floor(Math.random() * WORDS.length)] + "     ";
        return {
          y: i * lineHeight + 14,
          speed: (0.12 + Math.random() * 0.35) * (i % 2 ? 1 : -1),
          offset: Math.random() * 600,
          text,
          alpha: 0.1 + Math.random() * 0.32,
        };
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.font = `500 12.5px ${mono}, ui-monospace, monospace`;
      for (const row of rows) {
        row.offset += reduce ? 0 : row.speed;
        const textWidth = ctx.measureText(row.text).width;
        const x = -((row.offset % textWidth) + textWidth) % textWidth;
        ctx.fillStyle = `rgba(126, 232, 181, ${row.alpha})`;
        ctx.fillText(row.text, x, row.y);
        ctx.fillText(row.text, x + textWidth, row.y);
      }
      if (!reduce) frame = requestAnimationFrame(draw);
    };

    build();
    draw();
    const onResize = () => {
      build();
      if (reduce) draw();
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className={`pointer-events-none absolute inset-x-0 bottom-0 top-[76px] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_12%)] ${className}`} aria-hidden>
      <div className="absolute inset-x-[-10%] top-0 h-full [perspective:900px] [mask-image:linear-gradient(to_bottom,black_55%,transparent)]">
        <canvas
          ref={ref}
          className="h-full w-full [transform:rotateX(38deg)_scale(1.25)] [transform-origin:50%_0%] opacity-50 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,black_20%,transparent_80%)]"
        />
      </div>
      {/* Keep the headline readable over the moving text. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_42%_38%_at_50%_52%,var(--color-ink)_25%,transparent_75%)]" />
    </div>
  );
}
