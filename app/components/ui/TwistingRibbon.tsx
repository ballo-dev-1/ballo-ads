"use client";

import React from "react";

export const TwistingRibbon = () => {
  return (
    <>
      {/* Main ribbon — static shape based on the twisting ribbon design */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "520px",
          height: "780px",
          right: "-220px",
          top: "-240px",
          borderRadius: "46% 54% 52% 48% / 42% 46% 54% 58%",
          rotate: "18deg",
          background: "linear-gradient(170deg, #3b82f6 0%, #1d4ed8 28%, #0c1a80 58%, #020920 90%)",
          boxShadow: "inset 20px 20px 40px rgba(255,255,255,0.09), inset -40px -40px 80px rgba(0,0,0,0.5), 0 0 80px rgba(59,130,246,0.28)",
          zIndex: 0
        }}
      />
      {/* Rim light — static glow highlight */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "14px",
          height: "280px",
          right: "68px",
          top: "-20px",
          borderRadius: "50%",
          rotate: "18deg",
          background: "linear-gradient(180deg, rgba(160,220,255,0.98) 0%, rgba(80,160,255,0.55) 55%, rgba(30,80,255,0.08) 100%)",
          filter: "blur(7px)",
          opacity: 0.9,
          zIndex: 1
        }}
      />
      {/* Secondary ribbon — static bottom-left element */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "220px",
          height: "380px",
          left: "-80px",
          bottom: "-140px",
          borderRadius: "40% 60% 55% 45% / 50% 40% 60% 50%",
          rotate: "-15deg",
          background: "linear-gradient(160deg, rgba(37,99,235,0.5) 0%, rgba(10,30,120,0.4) 50%, rgba(2,6,30,0.88) 100%)",
          boxShadow: "inset 10px 10px 30px rgba(255,255,255,0.05), inset -20px -20px 50px rgba(0,0,0,0.5)",
          filter: "blur(3px)",
          zIndex: 0
        }}
      />
      {/* Secondary rim light */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: "10px",
          height: "160px",
          left: "30px",
          bottom: "10px",
          borderRadius: "50%",
          rotate: "-15deg",
          background: "linear-gradient(0deg, rgba(80,160,255,0.7) 0%, rgba(40,100,255,0.2) 70%, transparent 100%)",
          filter: "blur(6px)",
          opacity: 0.8,
          zIndex: 1
        }}
      />
    </>
  );
};
