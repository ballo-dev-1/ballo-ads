"use client";

import { useEffect, useRef } from "react";

// Pre-allocated object pool — avoids GC pressure from creating/destroying objects every frame
const POOL_SIZE = 120;

interface StarData {
  x: number;
  y: number;
  finalSize: number;
  size: number;
  alpha: number;
  vx: number;
  vy: number;
  turbX: number; // pre-baked turbulence offset, re-randomised on spawn
  turbY: number;
  elapsed: number;
  active: boolean;
}

function makePool(): StarData[] {
  return Array.from({ length: POOL_SIZE }, () => ({
    x: 0, y: 0, finalSize: 0, size: 0, alpha: 0,
    vx: 0, vy: 0, turbX: 0, turbY: 0, elapsed: 0, active: false,
  }));
}

function spawnStar(
  pool: StarData[],
  x: number,
  y: number,
  mvx: number,
  mvy: number
) {
  // Find a free slot in the pool — O(n) but n≤120 so negligible
  const slot = pool.find(s => !s.active);
  if (!slot) return; // pool exhausted — silently drop (rare at 120 cap)

  const finalSize = Math.random() * 2;
  slot.x = x;
  slot.y = y;
  slot.finalSize = finalSize;
  slot.size = finalSize * 2;
  slot.alpha = 1;
  slot.vx = mvx * 0.05 + (Math.random() - 0.5) * 5;
  slot.vy = 1 + Math.random() + mvy * 0.05 + (Math.random() - 0.5) * 5;
  slot.turbX = (Math.random() - 0.5) * 0.5;
  slot.turbY = 0;
  slot.elapsed = 0;
  slot.active = true;
}

export function StarTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pool = makePool();
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let rafId = 0;
    let lastTime = 0;
    let lastMouseX = 0;
    let lastMouseY = 0;
    let lastSpawnTime = 0; // throttle: max one star per frame (~16ms)
    let paused = false;

    // --- Event handlers ---

    function onResize() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }

    function onMouseMove(e: MouseEvent) {
      const now = performance.now();
      if (now - lastSpawnTime < 16) return; // throttle to ~60 stars/s max
      lastSpawnTime = now;

      const mvx = e.clientX - lastMouseX;
      const mvy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;

      spawnStar(pool, e.clientX, e.clientY, mvx, mvy);
    }

    function onVisibilityChange() {
      paused = document.hidden;
      // Reset lastTime so delta doesn't spike when tab becomes visible again
      if (!paused) lastTime = 0;
    }

    // --- Render loop ---

    function tick(time: number) {
      rafId = requestAnimationFrame(tick);
      if (paused) return;

      const dt = lastTime === 0 ? 16 : Math.min(time - lastTime, 50); // cap dt at 50ms
      lastTime = time;

      ctx!.clearRect(0, 0, width, height);

      // Single pass: update + draw + deactivate — avoids two separate forEach loops
      ctx!.beginPath();
      for (const s of pool) {
        if (!s.active) continue;

        // Update
        s.x  += s.vx + s.turbX;
        s.vx *= 0.97;
        s.y  += s.vy;
        s.vy += 0.02;
        s.alpha = Math.max(0, s.alpha - 0.005);
        s.elapsed += dt;
        s.size = s.elapsed < 2000
          ? s.finalSize * 2 - (s.finalSize * s.elapsed) / 2000
          : s.finalSize;

        // Deactivate if invisible or out of bounds
        if (s.alpha <= 0 || s.y > height || s.x < 0 || s.x > width) {
          s.active = false;
          continue;
        }

        // Draw — reuse a single path for all stars of the same alpha where possible
        // (full batching would need sorting by alpha; this is a good middle ground)
        ctx!.globalAlpha = s.alpha;
        ctx!.arc(s.x, s.y, Math.max(0.1, s.size), 0, Math.PI * 2);
        ctx!.closePath();
      }
      ctx!.fillStyle = "rgba(255,255,255,1)";
      ctx!.fill();
      ctx!.globalAlpha = 1;
    }

    // --- Wire up ---
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  );
}
