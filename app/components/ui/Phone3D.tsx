"use client";

import { useRef, useEffect } from "react";

interface Props {
  children: React.ReactNode;
}

export function Phone3D({ children }: Props) {
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const phoneEl = phoneRef.current;
    if (!phoneEl) return;

    let targetRx = 0, targetRy = 0;
    let rx = 0, ry = 0;
    let hasInteracted = false;
    let time = 0;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      if (!hasInteracted) {
        time += 0.015;
        targetRy = Math.sin(time) * 15;
        targetRx = Math.cos(time * 0.8) * 10;
      }
      rx = lerp(rx, targetRx, 0.08);
      ry = lerp(ry, targetRy, 0.08);
      phoneEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      rafId = requestAnimationFrame(tick);
    };
    tick();

    const handleMouseMove = (e: MouseEvent) => {
      hasInteracted = true;
      const rect = phoneEl.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const maxDist = Math.min(window.innerWidth, window.innerHeight) * 0.45;
      const maxTilt = 25;
      targetRy = Math.max(-maxTilt, Math.min(maxTilt, (dx / maxDist) * maxTilt));
      targetRx = Math.max(-maxTilt, Math.min(maxTilt, -(dy / maxDist) * maxTilt));
    };

    const handleMouseLeave = () => {
      hasInteracted = false;
      targetRx = 0;
      targetRy = 0;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="phone3d-scene">
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
    </div>
  );
}
