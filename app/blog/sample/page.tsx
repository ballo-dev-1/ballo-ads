"use client";
import { useEffect, useState } from "react";

type Member = {
  name: string;
  role: string;
  img: string;
};

const teamMembers: Member[] = [
  {
    name: "Emily Kim",
    role: "Founder",
    img: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e"
  },
  {
    name: "Michael Steward",
    role: "Creative Director",
    img: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5"
  },
  {
    name: "Emma Rodriguez",
    role: "Lead Developer",
    img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
  },
  {
    name: "Julia Gimmel",
    role: "UX Designer",
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
  },
  {
    name: "Lisa Anderson",
    role: "Marketing Manager",
    img: "https://images.unsplash.com/photo-1655249481446-25d575f1c054"
  },
  {
    name: "James Wilson",
    role: "Product Manager",
    img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7"
  }
];

export default function TeamCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const total = teamMembers.length;

  const updateCarousel = (newIndex: number) => {
    if (isAnimating) return;

    setIsAnimating(true);
    setCurrentIndex((newIndex + total) % total);

    setTimeout(() => setIsAnimating(false), 800);
  };

  // Arrow keys
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") updateCarousel(currentIndex - 1);
      if (e.key === "ArrowRight") updateCarousel(currentIndex + 1);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [currentIndex]);

  return (
    <div className="w-full flex flex-col items-center py-20">
      {/* Title */}
      <h1 className="text-[6rem] font-black uppercase tracking-tight absolute top-14 left-1/2 -translate-x-1/2 pointer-events-none text-transparent bg-gradient-to-b from-[#082A7B55] to-transparent bg-clip-text">
        Our Team
      </h1>

      {/* Carousel */}
      <div className="relative w-full max-w-[1200px] h-[450px] mt-24 perspective">
        {/* Left Arrow */}
        <button
          className="absolute left-5 top-1/2 -translate-y-1/2 bg-[#082a7b99] hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center z-20 text-2xl select-none"
          onClick={() => updateCarousel(currentIndex - 1)}
        >
          ‹
        </button>

        {/* Track */}
        <div className="relative w-full h-full flex items-center justify-center preserve-3d transition-transform duration-700">
          {teamMembers.map((m, i) => {
            const offset = (i - currentIndex + total) % total;

            let className = "absolute w-[280px] h-[380px] rounded-2xl overflow-hidden transition-all duration-700 shadow-xl cursor-pointer bg-white";

            if (offset === 0) className += " z-10 scale-110";
            else if (offset === 1) className += " translate-x-[200px] scale-90 z-5 opacity-90 grayscale";
            else if (offset === 2) className += " translate-x-[400px] scale-80 opacity-70 grayscale";
            else if (offset === total - 1) className += " -translate-x-[200px] scale-90 z-5 opacity-90 grayscale";
            else if (offset === total - 2) className += " -translate-x-[400px] scale-80 opacity-70 grayscale";
            else className += " opacity-0 pointer-events-none";

            return (
              <div key={i} className={className} onClick={() => updateCarousel(i)}>
                <img src={m.img} alt={m.name} className="w-full h-full object-cover" />
              </div>
            );
          })}
        </div>

        {/* Right Arrow */}
        <button
          className="absolute right-5 top-1/2 -translate-y-1/2 bg-[#082a7b99] hover:bg-black text-white w-10 h-10 rounded-full flex items-center justify-center z-20 text-2xl select-none"
          onClick={() => updateCarousel(currentIndex + 1)}
        >
          ›
        </button>
      </div>

      {/* Member Info */}
      <div className="text-center mt-10 transition-all">
        <h2 className="text-[#082A7B] text-4xl font-bold relative inline-block">
          {teamMembers[currentIndex].name}
        </h2>
        <p className="text-gray-500 text-xl uppercase tracking-widest mt-1">
          {teamMembers[currentIndex].role}
        </p>
      </div>

      {/* Dots */}
      <div className="flex gap-3 mt-10">
        {teamMembers.map((_, i) => (
          <div
            key={i}
            onClick={() => updateCarousel(i)}
            className={`w-3 h-3 rounded-full cursor-pointer transition-all ${
              currentIndex === i ? "bg-[#082A7B] scale-125" : "bg-[#082A7B33]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
