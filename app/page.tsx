"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import playStore from "@/public/elements small/19.png";
import appleStore from "@/public/elements small/18.png";

import building from "@/public/Assets/46.png";
import buildingFinance from "@/public/Assets/48.png";
import buildingNonprofit from "@/public/Assets/49.png";
import buildingRetail from "@/public/Assets/51.png";
import buildingHealthcare from "@/public/Assets/53.png";
import buildingEducation from "@/public/Assets/57.png"
import bglight from "@/public/Assets/2.png"
import {
  Building, // 🏢 Building / Corporation
  Landmark, // 🏦 Bank / Finance
  Globe,    // 🌍 Globe / Nonprofit / Government
  ShoppingCart, // 🛒 Shopping Cart / Retail
  Heart,    // 🏥 Heart/Medical / Healthcare
  GraduationCap // 🎓 Graduation Cap / Education
} from "lucide-react";

import woman from "@/public/Assets/11.png";
import woman1 from "@/public/Assets/12.png";
import woman2 from "@/public/Assets/13.png";
import woman3 from "@/public/Assets/10.png";
import man from "@/public/Assets/14.png";
import ring from "@/public/Assets/8.png";
import bank from "@/public/Assets/19.png";
import phone1 from "@/public/Assets/4.png";
import phone from "@/public/Assets/38.png";

// Define the structure for our navigable items
interface UseCase {
  id: string;
  icon: React.ReactNode; // Changed from string (emoji) to React.ReactNode (component)
  text: string;
  subtext: string;
  image: StaticImageData; // Image source
}

const useCases: UseCase[] = [
  {
    id: 'sme',
    icon: <Building className="w-6 h-6" />,
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers.",
    image: building
  },
  {
    id: 'finance',
    icon: <Landmark className="w-6 h-6" />,
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and offers.",
    image: buildingFinance
  },
  {
    id: 'nonprofit',
    icon: <Globe className="w-6 h-6" />,
    text: "Nonprofits & Government Initiatives",
    subtext: "Spread awareness with mass communication.",
    image: buildingNonprofit
  },
  {
    id: 'retail',
    icon: <ShoppingCart className="w-6 h-6" />,
    text: "Retail & E-commerce",
    subtext: "Drive sales and customer engagement.",
    image: buildingRetail
  },
  {
    id: 'healthcare',
    icon: <Heart className="w-6 h-6" />,
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and health campaigns.",
    image: buildingHealthcare
  },
  {
    id: 'education',
    icon: <GraduationCap className="w-6 h-6" />,
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with updates.",
    image: buildingEducation
  },
];

function FeatureLabel({
  text,
  icon,
  position,
}: {
  text: string;
  icon: React.ReactNode;
  position: string;
}) {
  return (
    <div
      className={`absolute ${position} flex items-center gap-3 bg-white shadow-lg px-4 py-2 rounded-full text-[var(--dark-blue)] text-sm md:text-base font-semibold z-20`}
    >
      <span>{icon}</span>
      {text}
    </div>
  );
}

const features = [
  {
    title: "WHATSAPP MARKETING WITH PRECISION",
    description:
      "Experience automated email marketing for higher conversions. BalloAds gives you....",
    image: woman3 // Placeholder - replace with actual image
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

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const nextSlide = (currentSlide + 1) % features.length;
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const shouldReduceMotion = useReducedMotion();
  const resumeAutoPlayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const marqueeTrackRef = useRef<HTMLDivElement | null>(null);
  const marqueeLoopWidthRef = useRef(0);
  const marqueeX = useMotionValue(0);
  const { scrollY } = useScroll();
  const rawScrollVelocity = useVelocity(scrollY);
  const smoothScrollVelocity = useSpring(rawScrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(
    smoothScrollVelocity,
    [-2000, 0, 2000],
    [-2, 0, 2],
    { clamp: false }
  );
  //const maxChartValue = Math.max(
  //...chartSeries.flatMap((series) => series.values));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    if (!isAutoPlaying || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % features.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, shouldReduceMotion]);

  useEffect(() => {
    return () => {
      if (resumeAutoPlayTimeoutRef.current) {
        clearTimeout(resumeAutoPlayTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateMarqueeWidth = () => {
      if (!marqueeTrackRef.current) return;
      marqueeLoopWidthRef.current = marqueeTrackRef.current.scrollWidth / 2;
    };

    updateMarqueeWidth();
    window.addEventListener("resize", updateMarqueeWidth);
    return () => window.removeEventListener("resize", updateMarqueeWidth);
  }, []);

  const goToSlide = (index: number) => {
    if (resumeAutoPlayTimeoutRef.current) {
      clearTimeout(resumeAutoPlayTimeoutRef.current);
    }

    setCurrentSlide(index);
    setIsAutoPlaying(false);

    if (!shouldReduceMotion) {
      // Resume auto-play after 10 seconds
      resumeAutoPlayTimeoutRef.current = setTimeout(() => {
        setIsAutoPlaying(true);
      }, 10000);
    }
  };

  // Initialize state with the first item's ID
  const [activeCaseId, setActiveCaseId] = useState<string>(useCases[0].id);

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) return;

    // Base motion is right-to-left.
    // Scroll down => faster leftward motion. Scroll up => temporary rightward reversal.
    const smoothedVelocity = smoothScrollVelocity.get();
    const isActivelyScrolling = Math.abs(smoothedVelocity) > 20;
    const speedBoost = Math.min(Math.abs(velocityFactor.get()) * 22, 88);

    let pixelsPerSecond = -36;
    if (isActivelyScrolling && smoothedVelocity > 0) {
      // Scrolling down: keep left direction, increase speed.
      pixelsPerSecond = -36 - speedBoost;
    } else if (isActivelyScrolling && smoothedVelocity < 0) {
      // Scrolling up: reverse direction while scroll is active.
      pixelsPerSecond = 20 + speedBoost;
    }

    let nextX = marqueeX.get() + (pixelsPerSecond * delta) / 1000;
    const loopWidth = marqueeLoopWidthRef.current;

    // Wrap both directions for a continuous loop based on actual track width.
    if (loopWidth > 0) {
      if (nextX <= -loopWidth) nextX += loopWidth;
      if (nextX >= 0) nextX -= loopWidth;
    }
    marqueeX.set(nextX);
  });

  // Find the currently active case object to get its image
  const activeCase = useCases.find(c => c.id === activeCaseId) || useCases[0];

  return (
    <motion.main
      className="min-h-screen text-white pt-3"
      style={{
        background: "linear-gradient(180deg, #060648 0%, #000000 100%)",
        backgroundSize: "100% 200%",
      }}
      animate={
        shouldReduceMotion
          ? { backgroundPosition: "50% 0%" }
          : { backgroundPosition: ["50% 0%", "50% 100%", "50% 0%"] }
      }
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { duration: 14, ease: "linear", repeat: Infinity }
      }
    >
      {/* Hero Section */}
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

        {/* Large Faded Text */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden pointer-events-none">
          <motion.div
            ref={marqueeTrackRef}
            className="flex whitespace-nowrap"
            style={{ x: shouldReduceMotion ? 0 : marqueeX }}
          >
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
            <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none pr-10">
              REBRANDING THE FUTURE
            </span>
          </motion.div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[70vh]">
            {/* Left Side - Content */}
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="relative min-h-[180px] md:min-h-[220px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={`hero-text-${currentSlide}`}
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: 24 }
                    }
                    animate={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 1, y: 0 }
                    }
                    exit={
                      shouldReduceMotion
                        ? { opacity: 1 }
                        : { opacity: 0, y: -16 }
                    }
                    transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
                    className="w-full"
                  >
                    <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight uppercase max-w-[18ch] features-hero">
                      {features[currentSlide].title}
                    </h1>
                  </motion.div>
                </AnimatePresence>
              </div>
              <Link
                href="#learn-more"
                className="inline-flex items-center gap-3 w-fit bg-white text-[var(--dark-blue-2)] px-5 py-2 rounded-full font-bold text-2xl md:text-3xl leading-none hover:bg-white/90 transition-all group shadow-sm"
              >
                Try it now
                <div className="w-8 h-8 rounded-full bg-[var(--dark-blue-2)]/15 flex items-center justify-center group-hover:bg-[var(--dark-blue-2)]/25 transition-colors">
                  <svg
                    className="w-4 h-4"
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
              <div className="flex items-center gap-3 mt-3">
                {features.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full border border-white/85 transition-all ${index === currentSlide
                      ? "bg-white"
                      : "bg-transparent hover:bg-white/25"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Right Side - Image */}
            <div className="relative flex justify-center items-center">
              <div className="relative w-full max-w-md h-[420px] md:h-[560px]">
                <div className="relative w-full h-full">
                  <Image
                    src={ring}
                    alt="Circles Ring"
                    width={1600}
                    height={1900}
                    className="w-full h-auto absolute right-0 bottom-0 scale-[2]"
                    priority
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`hero-image-${currentSlide}`}
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, x: 24, scale: 0.98 }
                      }
                      animate={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 1, x: 0, scale: 1 }
                      }
                      exit={
                        shouldReduceMotion
                          ? { opacity: 1 }
                          : { opacity: 0, x: -24, scale: 1.02 }
                      }
                      transition={{ duration: shouldReduceMotion ? 0 : 0.55, ease: "easeOut" }}
                      className="z-10 relative w-full h-full will-change-transform"
                    >
                      <Image
                        src={features[currentSlide].image}
                        alt={features[currentSlide].title}
                        fill
                        sizes="(max-width: 768px) 85vw, 40vw"
                        className={`object-contain object-bottom ${features[currentSlide].title === "EMAIL MARKETING AT YOUR FINGERTIPS"
                          ? "scale-[1.42] mt-5 -ml-2"
                          : "scale-[1.35] mt-8 -ml-4"
                          }`}
                        priority={currentSlide === 0}
                      />
                    </motion.div>
                  </AnimatePresence>
                  {/* Preload upcoming slide image to avoid first-transition decode hitch */}
                  <div className="hidden" aria-hidden="true">
                    <Image
                      src={features[nextSlide].image}
                      alt=""
                      width={400}
                      height={600}
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Powerful and Versatile Banner */}
      <section className="relative z-40 pb-16 px-4">
        <div className="container mx-auto flex justify-center relative z-40">
          <div className="relative w-full max-w-[72rem] rounded-[2.25rem] px-8 py-14 md:px-20 md:py-24 text-center overflow-hidden shadow-[0_28px_58px_-20px_rgba(0,0,0,0.85)] bg-[linear-gradient(90deg,#060648_0%,#060648_50%,#060648_100%)]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(63,219,255,0.15)_0%,rgba(34,115,175,0.08)_40%,rgba(0,0,0,0)_75%)] pointer-events-none" />
            <h2
              className="relative z-10 whitespace-nowrap text-[clamp(2.4rem,6.15vw,5.8rem)] font-black leading-none [transform:scaleY(1.24)_scaleX(0.9)] overflow-hidden"
              style={{
                fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                letterSpacing: "0.005em",
                backgroundColor: "#060648", // Matching banner background for the darken blend
                color: "#fff",
                margin: 0
              }}
            >
              POWERFUL AND VERSATILE

              {/* Aurora Effect Layer */}
              <div className="home-banner__aurora-container">
                <div className="home-banner__aurora-item"></div>
                <div className="home-banner__aurora-item"></div>
                <div className="home-banner__aurora-item"></div>
                <div className="home-banner__aurora-item"></div>
              </div>
            </h2>
          </div>
        </div>
      </section>

      {/* What We're About Section */}
      <section className="py-20 px-4 bg-[var(--dark-blue-2)]">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - iPhone Mockup */}
          <div className="relative flex justify-center">
            <div /*className="relative w-full max-w-xs"*/>
              <div /*className="absolute inset-0 bg-[var(--brand-color-4)]/20 rounded-full blur-3xl"*/ />
              <div className="relative">
                <Image
                  src={phone}
                  alt="BalloAds App"
                  width={300}
                  height={600}
                  className="w-full h-auto scale-[1.5]"
                />
                {/* App Store Buttons */}
                <div className="flex flex-col gap-3 mt-6 items-center">
                  <Link href="#" className="w-48">
                    <Image
                      src={playStore}
                      alt="Get it on the App Store"
                      width={50}
                      height={60}
                      className="w-1/4 h-auto absolute -left-10 bottom-20 scale-[2]"
                    />
                  </Link>
                  <Link href="#" className="w-48">
                    <Image
                      src={appleStore}
                      alt="Get it on Google Play"
                      width={50}
                      height={60}
                      className="w-1/4 h-auto absolute -left-10 bottom-0 scale-[2]"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Content Card */}
          <div className="gradient-blue-purple rounded-3xl p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What We&apos;re About
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-white/90">
              BalloAds is an AI-powered digital advertising platform designed for
              bulk SMS, targeted message ads, and data-driven campaign management.
              We help businesses reach their audience effectively and efficiently.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose BalloAds Section */}
      <section className="py-20 px-4 bg-[var(--dark-blue-2)]">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content Card */}
          <div className="gradient-blue-purple rounded-3xl p-8 md:p-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Why Choose BalloAds?
            </h2>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <span className="font-bold text-[var(--brand-color-4)]">•</span>
                <span className="text-lg">
                  <strong>AI-Powered Targeting</strong> - Reach the right audience
                  at the right time
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[var(--brand-color-4)]">•</span>
                <span className="text-lg">
                  <strong>Bulk & Personalized Messaging</strong> - Scale your
                  campaigns with personalization
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[var(--brand-color-4)]">•</span>
                <span className="text-lg">
                  <strong>Real-Time Analytics</strong> - Track performance and
                  optimize on the go
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[var(--brand-color-4)]">•</span>
                <span className="text-lg">
                  <strong>User-Friendly Dashboard</strong> - Manage campaigns
                  with ease
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="font-bold text-[var(--brand-color-4)]">•</span>
                <span className="text-lg">
                  <strong>Affordable & Scalable</strong> - Grow without breaking
                  the bank
                </span>
              </li>
            </ul>
            <Link
              href="#signup"
              className="inline-flex items-center gap-2 border-2 border-white bg-white text-[var(--brand-color-1)] px-8 py-3 rounded-full font-semibold text-lg hover:bg-white/90 transition-all"
            >
              Sign up for free today
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
            </Link>
          </div>

          {/* Right Side - iPhone Mockup */}
          <div className="relative flex justify-center">
            <div /*className="relative w-full max-w-xs"*/>
              <div /*className="absolute inset-0 bg-[var(--brand-color-4)]/20 rounded-full blur-3xl"*/ />
              <div className="relative">
                <Image
                  src={phone}
                  alt="BalloAds App"
                  width={300}
                  height={600}
                  className="w-full h-auto scale-[1.5]"
                />
                {/* App Store Buttons */}
                <div className="flex flex-col gap-3 mt-6 items-center">
                  <Link href="#" className="w-48">
                    <Image
                      src={playStore}
                      alt="Get it on the App Store"
                      width={50}
                      height={60}
                      className="w-1/4 h-auto absolute -left-10 bottom-20 scale-[2]"
                    />
                  </Link>
                  <Link href="#" className="w-48">
                    <Image
                      src={appleStore}
                      alt="Get it on Google Play"
                      width={50}
                      height={60}
                      className="w-1/4 h-auto absolute -left-10 bottom-0 scale-[2]"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 px-4 bg-[var(--dark-blue-2)]">
        <div className="container mx-auto text-center">
          <p className="text-sm text-white/70 mb-8">Trusted by the very best</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 opacity-60">
            {[
              "MAKHULU INVESTMENTS LTD",
              "PARAMOUNT LOGISTICS",
              "INSIZWE",
              "Mudenda Capital",
              "FI",
              "TINGE",
              "The IV Lounge",
            ].map((company, index) => (
              <div
                key={index}
                className="text-white/80 text-sm md:text-base font-medium"
              >
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can use BalloAds Section */}
      <section className="py-20 px-4 text-white bg-[var(--dark-blue-2)]">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Who can use BalloAds?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left Side - Clickable Navigation List */}
            <div className="space-y-6">
              {useCases.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 cursor-pointer p-3 rounded-xl transition-colors ${
                    // Conditional styling: active item has a background
                    activeCaseId === item.id
                      ? 'bg-[var(--brand-color-1)]/20 border-l-4 border-[var(--brand-color-1)] text-white'
                      : 'hover:bg-gray-700/30 text-gray-300'
                    }`}
                  // Make the entire div clickable to update the state
                  onClick={() => setActiveCaseId(item.id)}
                >
                  <span className="text-3xl shrink-0">{item.icon}</span>

                  <div className="flex flex-col">
                    <span className="text-xl font-semibold">{item.text}</span>
                    <span className="text-sm text-gray-400 mt-1">{item.subtext}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Dynamic Image Slider */}
            <div className="relative h-[600px] flex items-center justify-center">

              {/* STATIC BACKGROUND IMAGE */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Background Ring/Light effect (Static) */}
                <Image
                  src={bglight}
                  alt="Static Background Light"
                  fill
                  className="object-contain opacity-50"
                  priority
                />
              </div>

              {/* DYNAMIC BUILDING IMAGE (The Sliding Element) */}
              <div className="relative w-full h-full flex items-center justify-center transition-opacity duration-500">
                <Image
                  key={activeCase.id} // IMPORTANT: Use key to force re-render and trigger CSS transitions
                  src={activeCase.image}
                  alt={`${activeCase.text} Building`}
                  width={350} // Set appropriate dimensions
                  height={700}
                  className="object-contain w-auto h-full scale-[1.3] absolute transition-transform duration-500 ease-in-out"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-[var(--dark-blue-2)]">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            <span className="text-gradient-cyan">HEAR FROM THOSE WHO HAVE TRIED AND TESTED</span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="gradient-blue-purple rounded-3xl p-8 md:p-12">
              <p className="text-xl md:text-2xl leading-relaxed mb-8 italic">
                &quot;Undoubtedly one of the best decisions I&apos;ve made for my
                company. This platform is a game changer and I&apos;m grateful
                for the impact it has had on our business.&quot;
              </p>
              <div className="mb-6">
                <p className="text-xl font-bold mb-1">Maybin Mudenda</p>
                <p className="text-white/80">Board Chairperson</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </motion.main>
  );
}
