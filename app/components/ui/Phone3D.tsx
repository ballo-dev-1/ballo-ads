"use client";

import { useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
  floating?: React.ReactNode;
}

export function Phone3D({ children, floating }: Props) {
  const tiltRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tiltEl = tiltRef.current;
    const phoneEl = phoneRef.current;
    if (!tiltEl || !phoneEl) return;

    const IDLE_DELAY = 1500;
    const MAX_TILT = 25;

    let targetRx = 0, targetRy = 0;
    let rx = 0, ry = 0;
    let isTracking = false;
    let lastMoveTime = 0;
    let rafId: number | null = null;
    let isVisible = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      if (isTracking && Date.now() - lastMoveTime > IDLE_DELAY) {
        isTracking = false;
        targetRx = 0;
        targetRy = 0;
      }

      const lerpFactor = isTracking ? 0.08 : 0.015;
      rx = lerp(rx, targetRx, lerpFactor);
      ry = lerp(ry, targetRy, lerpFactor);
      tiltEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;

      if (isVisible) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible && rafId === null) {
          rafId = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "300px" }
    );
    observer.observe(phoneEl);

    // Start immediately (optimistic — likely visible on load)
    isVisible = true;
    rafId = requestAnimationFrame(tick);

    const handleMouseMove = (e: MouseEvent) => {
      isTracking = true;
      lastMoveTime = Date.now();
      const rect = phoneEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.45;
      targetRy = Math.max(-MAX_TILT, Math.min(MAX_TILT, (dx / maxDist) * MAX_TILT));
      targetRx = Math.max(-MAX_TILT, Math.min(MAX_TILT, -(dy / maxDist) * MAX_TILT));
    };

    const handleMouseLeave = () => {
      isTracking = false;
      targetRx = 0;
      targetRy = 0;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      observer.disconnect();
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="phone3d-scene scale-110">
      <div
        ref={tiltRef}
        style={{ position: "relative", transformStyle: "preserve-3d" }}
      >
        <div ref={phoneRef} className="phone3d">
          <div className="phone3d-back" />
          <div className="phone3d-edge phone3d-edge-r" />
          <div className="phone3d-edge phone3d-edge-l" />
          <div className="phone3d-edge phone3d-edge-t" />
          <div className="phone3d-edge phone3d-edge-b" />

          {(["tl", "tr", "bl", "br"] as const).map((pos) => (
            <div key={pos} className={`phone3d-corner phone3d-corner-${pos}`}>
              {Array.from({ length: 16 }, (_, i) => (
                <div
                  key={i}
                  className="phone3d-clayer"
                  style={{ transform: `translateZ(-${i + 1}px)` }}
                />
              ))}
            </div>
          ))}

          <div className="phone3d-bezel">
            <div className="phone3d-inner-shell">
              <div className="phone3d-screen">
                {children}
                <div className="phone3d-home-bar" />
              </div>
            </div>
          </div>
        </div>

        {floating}
      </div>
    </div>
  );
}
