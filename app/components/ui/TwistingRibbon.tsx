"use client";

import { motion } from "framer-motion";
import React from "react";

export const TwistingRibbon = () => {
  return (
    <>
      {/* Main ribbon — animates like a slow twisting ribbon */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          rotate: [18, 23, 20, 15, 18],
          y: [0, -18, -8, -22, 0],
          scaleX: [1, 1.03, 1, 0.97, 1],
          borderRadius: [
            "46% 54% 52% 48% / 42% 46% 54% 58%",
            "50% 50% 45% 55% / 46% 42% 58% 54%",
            "44% 56% 54% 46% / 40% 48% 52% 60%",
            "48% 52% 50% 50% / 44% 44% 56% 56%",
            "46% 54% 52% 48% / 42% 46% 54% 58%",
          ],
        }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        style={{
          width: "520px",
          height: "780px",
          right: "-220px",
          top: "-240px",
          background: "linear-gradient(170deg, #3b82f6 0%, #1d4ed8 28%, #0c1a80 58%, #020920 90%)",
          boxShadow: "inset 20px 20px 40px rgba(255,255,255,0.09), inset -40px -40px 80px rgba(0,0,0,0.5), 0 0 80px rgba(59,130,246,0.28)",
        }}
      />
      {/* Rim light — follows main ribbon */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          rotate: [18, 23, 20, 15, 18],
          y: [0, -18, -8, -22, 0],
          opacity: [0.9, 1, 0.85, 1, 0.9],
        }}
        transition={{ duration: 10, ease: "easeInOut", repeat: Infinity }}
        style={{
          width: "14px",
          height: "280px",
          right: "68px",
          top: "-20px",
          borderRadius: "50%",
          background: "linear-gradient(180deg, rgba(160,220,255,0.98) 0%, rgba(80,160,255,0.55) 55%, rgba(30,80,255,0.08) 100%)",
          filter: "blur(7px)",
        }}
      />
      {/* Secondary ribbon — opposite phase, slower */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          rotate: [-15, -11, -17, -13, -15],
          y: [0, 14, 6, 18, 0],
          scaleX: [1, 0.97, 1, 1.03, 1],
          borderRadius: [
            "40% 60% 55% 45% / 50% 40% 60% 50%",
            "44% 56% 50% 50% / 54% 44% 56% 46%",
            "38% 62% 58% 42% / 48% 42% 58% 52%",
            "42% 58% 52% 48% / 52% 46% 54% 48%",
            "40% 60% 55% 45% / 50% 40% 60% 50%",
          ],
        }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
        style={{
          width: "220px",
          height: "380px",
          left: "-80px",
          bottom: "-140px",
          background: "linear-gradient(160deg, rgba(37,99,235,0.5) 0%, rgba(10,30,120,0.4) 50%, rgba(2,6,30,0.88) 100%)",
          boxShadow: "inset 10px 10px 30px rgba(255,255,255,0.05), inset -20px -20px 50px rgba(0,0,0,0.5)",
          filter: "blur(3px)",
        }}
      />
      {/* Secondary rim light — follows secondary ribbon */}
      <motion.div
        className="absolute pointer-events-none"
        animate={{
          rotate: [-15, -11, -17, -13, -15],
          y: [0, 14, 6, 18, 0],
          opacity: [0.8, 1, 0.7, 1, 0.8],
        }}
        transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
        style={{
          width: "10px",
          height: "160px",
          left: "30px",
          bottom: "10px",
          borderRadius: "50%",
          background: "linear-gradient(0deg, rgba(80,160,255,0.7) 0%, rgba(40,100,255,0.2) 70%, transparent 100%)",
          filter: "blur(6px)",
        }}
      />
    </>
  );
};
