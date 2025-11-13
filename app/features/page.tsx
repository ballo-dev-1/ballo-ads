"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
//import background from "@/public/Backgrounds/hero-bg.png";
//import pattern from "@/public/Backgrounds/pattern.png";
import woman from "@/public/Assets/11.png";
import woman1 from "@/public/Assets/12.png";
import man from "@/public/Assets/14.png";
import woman2 from "@/public/Assets/13.png";
import ring from "@/public/Assets/8.png"
import person from "@/public/Assets/15.png";
import circle from "@/public/Assets/9.png"

const features = [
  {
    title: "WHATSAPP MARKETING WITH PRECISION",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman1, // Placeholder - replace with actual image
  },
  {
    title: "TARGETED BULK MESSAGING SOLUTIONS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: man, // Placeholder - replace with actual image
  },
  {
    title: "INITIATE WEB POP UPS AND PUSH NOTIFICATIONS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman2, // Placeholder - replace with actual image
  },
  {
    title: "EMAIL MARKETING AT YOUR FINGERTIPS",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman, // Placeholder - replace with actual image
  },
];

const chartSeries = [
  {
    label: "Engagement",
    color: "#6BDFFF",
    values: [20, 28, 45, 55, 72, 95],
  },
  {
    label: "Leads",
    color: "#90B6FF",
    values: [12, 22, 38, 44, 60, 82],
  },
  {
    label: "ROI",
    color: "#F4B942",
    values: [8, 15, 26, 40, 52, 88],
  },
  {
    label: "Reach",
    color: "#3D6BFF",
    values: [10, 18, 30, 42, 58, 76],
  },
];

const chartXAxisLabels = ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"];

export default function FeaturesPage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const maxChartValue = Math.max(
    ...chartSeries.flatMap((series) => series.values)
  );
  const yTickValues = [25, 50, 75];

  const getPolylinePoints = (values: number[]) =>
    values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 100;
        const y = 100 - (value / maxChartValue) * 100;
        return `${x},${y}`;
      })
      .join(" ");

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      {/* Hero Section with Carousel */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 md:px-8 py-20 overflow-hidden"
        style={{
         // background: `url(${background.src})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Background Pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            //background: `url(${pattern.src})`,
            backgroundSize: "cover",
          }}
        />

        {/* Concentric Circles Background */}
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 border border-[var(--brand-color-4)]/20 rounded-full" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] border border-[var(--brand-color-4)]/15 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/4 right-1/4 w-[700px] h-[700px] border border-[var(--brand-color-4)]/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Large Faded Text */}
        <div className="absolute bottom-0 left-0 pointer-events-none">
        <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none">
            REBRANDING THE FUTURE 
          </span>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center min-h-[70vh]">
            {/* Left Side - Content */}
            <div className="flex flex-col gap-8">
              <h1 className="text-4xl md:text-6xl lg:text-5xl font-bold leading-tight features-hero">
                {features[currentSlide].title}
              </h1>
              <p className="text-lg md:text-xl text-white/90 leading-relaxed">
                {features[currentSlide].description}
              </p>
              <Link
                href="#learn-more"
                className="inline-flex items-center gap-3 w-fit bg-[var(--brand-color-1)] border-2 border-white text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-[var(--brand-color-2)] transition-all group"
              >
                Learn more
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
              {/* Pagination Dots */}
              <div className="flex gap-2 mt-4">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentSlide
                        ? "bg-white w-8"
                        : "bg-white/30 hover:bg-white/50"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-md">
                <div className="relative">
                <Image
                  src={ring}
                  alt="Circles Ring"
                  width={1600}
                  height={1900}
                  className="w-full h-auto absolute right-0 bottom-0 scale-[2]"
                  priority
                />
                  <Image
                    src={features[currentSlide].image}
                    alt={features[currentSlide].title}
                    width={400}
                    height={600}
                    className="w-full h-auto transition-opacity duration-500 z-10 relative bottom-3.5 scale-[1.5]"
                    priority={currentSlide === 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Growth Section */}
      <section className="relative bg-[#F5F7FF] text-[var(--dark-blue)] px-4 md:px-8 py-24">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-64 h-64 rounded-full bg-[var(--brand-color-4)]/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-[var(--brand-color-1)]/10 blur-3xl" />
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] items-start">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                  Grow Your Audience
                </h2>
                <p className="text-base md:text-lg text-[var(--dark-blue)]/70 max-w-3xl leading-relaxed">
                  With integrated tools and strategic management, we help you reach the
                  full potential of your brand with our marketing expertise. We specialise
                  in growing your audience across all platforms, from social media to search
                  engines, ensuring maximum visibility and engagement.
                </p>
                <p className="text-base md:text-lg text-[var(--dark-blue)]/70 max-w-3xl leading-relaxed">
                  Let us help you reach new heights and connect with your target audience
                  like never before!
                </p>
              </div>

              <div className="rounded-[32px] bg-gradient-to-br from-[#0F1F4C] via-[#113474] to-[#0A4ACB] p-6 md:p-10 shadow-xl">
                <div className="flex justify-between items-center text-white/70 text-sm uppercase tracking-[0.2em]">
                  <span>Performance Overview</span>
                  <span>01 Oct - 31 Oct</span>
                </div>
                <div className="mt-8">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-72">
                    <defs>
                      <linearGradient id="chart-grid" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="100" height="100" fill="url(#chart-grid)" rx="12" />
                    {yTickValues.map((value) => {
                      const y = 100 - (value / maxChartValue) * 100;
                      return (
                        <line
                          key={value}
                          x1="0"
                          x2="100"
                          y1={y}
                          y2={y}
                          stroke="rgba(255,255,255,0.15)"
                          strokeWidth="0.4"
                        />
                      );
                    })}
                    {chartSeries[0].values.map((_, index, arr) => {
                      const x = (index / (arr.length - 1)) * 100;
                      return (
                        <line
                          key={`x-${x}`}
                          x1={x}
                          x2={x}
                          y1="0"
                          y2="100"
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="0.4"
                        />
                      );
                    })}
                    {chartSeries.map((series) => (
                      <g key={series.label}>
                        <polyline
                          points={getPolylinePoints(series.values)}
                          fill="none"
                          stroke={series.color}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        {series.values.map((value, index, arr) => {
                          const x = (index / (arr.length - 1)) * 100;
                          const y = 100 - (value / maxChartValue) * 100;
                          return (
                            <circle
                              key={`${series.label}-${index}`}
                              cx={x}
                              cy={y}
                              r="1.2"
                              fill={series.color}
                              stroke="rgba(15, 31, 76, 0.4)"
                              strokeWidth="0.6"
                            />
                          );
                        })}
                      </g>
                    ))}
                  </svg>
                  <div className="mt-4 flex flex-wrap justify-between text-xs md:text-sm text-white/70">
                    {chartXAxisLabels.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {chartSeries.map((series) => (
                    <div key={series.label} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: series.color }}
                      />
                      <span className="text-sm text-white/80 uppercase tracking-[0.18em]">
                        {series.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-[28px] bg-white shadow-lg p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-color-2)]">
                  Reach
                </p>
                <p className="mt-4 text-5xl md:text-6xl font-bold text-[var(--dark-blue)]">
                  3.5mill
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dark-blue)]/70">
                  Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.
                </p>
              </div>

              <div className="rounded-[28px] bg-white shadow-lg p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--brand-color-2)]">
                  ROI
                </p>
                <p className="mt-4 text-5xl md:text-6xl font-bold text-[var(--dark-blue)]">
                  56%
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--dark-blue)]/70">
                  Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[#EEF2FF] text-[var(--dark-blue)] px-4 md:px-8 py-24">
        <div className="container mx-auto relative z-10 flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl flex flex-col gap-6">
            <h3 className="text-4xl md:text-5xl font-bold drop-shadow-2xl leading-tight text-[var(--dark-blue)]">
              Rebranding the future of your industry starts here.
            </h3>
            <p className="text-base md:text-lg text-[var(--dark-blue)]/70 leading-relaxed max-w-xl">
              Book a tailored BalloAds demo and see how our omnichannel marketing platform can help you
              unlock new revenue, accelerate growth and engage your audience in real time.
            </p>
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-3 w-fit px-8 py-4 rounded-full bg-[var(--brand-color-1)] text-white font-semibold text-lg shadow-lg hover:bg-[var(--brand-color-2)] transition-colors"
            >
              Book a free demo
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14" />
                <path d="M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="relative flex justify-center md:justify-end w-full md:w-auto">
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#0A4ACB]/20 via-[#3D6BFF]/30 to-[#6BDFFF]/10 blur-2xl" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white via-[#EFF3FF] to-[#DCE7FF] shadow-2xl" />
              <div className="absolute inset-8 flex items-center justify-center">
              <Image
                  src={circle}
                  alt="Circles Ring"
                  width={1600}
                  height={1900}
                  className="w-full h-auto absolute right-0 -bottom-13 scale-[2]"
                  priority
                />
                <Image
                  src={person}
                  alt="Happy customer using BalloAds"
                  width={280}
                  height={280}
                  className="object-contain drop-shadow-2xl bottom-5 scale-[1.5]"
                  priority
                />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-[var(--brand-color-4)]/30 blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-[var(--brand-color-1)]/20 blur-[120px]" />
        </div>
      </section>
    </main>
  );
}
