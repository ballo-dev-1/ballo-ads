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
import { TwistingRibbon } from "./components/ui/TwistingRibbon";
import { Phone3D } from "./components/ui/Phone3D";
import playStore from "@/public/elements small/19.png";
import appleStore from "@/public/elements small/18.png";

import building from "@/public/Assets/46.png";
import buildingFinance from "@/public/Assets/48.png";
import buildingNonprofit from "@/public/Assets/49.png";
import buildingRetail from "@/public/Assets/51.png";
import buildingHealthcare from "@/public/Assets/53.png";
import buildingEducation from "@/public/Assets/57.png"
import bglight from "@/public/Assets/2.png"
import googlePlayIcon from "@/public/Assets/7.png";
import logoIcon from "@/public/BalloAds Logo New/BalloAds-Icon.png";
import {
  Building, // 🏢 Building / Corporation
  Landmark, // 🏦 Bank / Finance
  Globe,    // 🌍 Globe / Nonprofit / Government
  ShoppingCart, // 🛒 Shopping Cart / Retail
  Heart,    // 🏥 Heart/Medical / Healthcare
  GraduationCap, // 🎓 Graduation Cap / Education
  CloudUpload,
} from "lucide-react";

import woman from "@/public/Assets/11.png";
import woman1 from "@/public/Assets/12.png";
import woman2 from "@/public/Assets/13.png";
import woman3 from "@/public/Assets/10.png";
import man from "@/public/Assets/14.png";
import ring from "@/public/Assets/8.png";
import bank from "@/public/Assets/19.png";
import glowBg from "@/public/Assets/glow-bg.png";

import logoMakhulu from "@/public/Client Logos/Makhulu High Res Logo white.png";
import logoParamount from "@/public/Client Logos/paramount-1 white.png";
import logoOmphile from "@/public/Client Logos/Omphile-White.png";
import logoInsizwe from "@/public/Client Logos/logo-2 white.png";
import logoMudenda from "@/public/Client Logos/Mudenda Capital Logo to send-03.png";
import logoFI from "@/public/Client Logos/Financial Insights Logo white.png";
import logoTinge from "@/public/Client Logos/Tinge logo white.png";
import logoIVLounge from "@/public/Client Logos/iv1.png";
import logoSWR from "@/public/Client Logos/SWR Logo white.png";
import logoShane from "@/public/Client Logos/Shane Investments logo.png";
import logoShreeji from "@/public/Client Logos/Shreeji.png";
import logoBayport from "@/public/Client Logos/bayport color.png";
import logoSeneca from "@/public/Client Logos/seneca-logo new-02.png";
import logo9 from "@/public/Client Logos/9.png";

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

const testimonials = [
  {
    quote: "Undoubtedly one of the best decisions I've made for my company. This platform is a game changer and I'm grateful for the impact it has had on our business.",
    name: "Maybin Mudenda",
    title: "Board Chairperson",
    company: "Insizwe Private Brokers",
  },
  {
    quote: "BalloAds made it incredibly easy to reach thousands of customers with a single campaign. Our response rate doubled within the first month.",
    name: "Sarah Nkosi",
    title: "Marketing Director",
    company: "Paramount Logistics",
  },
  {
    quote: "The targeted messaging feature is unlike anything we've used before. We saw a measurable uplift in foot traffic after our very first campaign.",
    name: "James Okafor",
    title: "CEO",
    company: "Mudenda Capital",
  },
  {
    quote: "From setup to launch took less than an afternoon. The dashboard is intuitive and the results speak for themselves.",
    name: "Tendai Moyo",
    title: "Head of Growth",
    company: "Tinge Technology",
  },
  {
    quote: "We've tried other platforms but nothing compares to the reach and affordability BalloAds offers for small businesses like ours.",
    name: "Linda Phiri",
    title: "Founder",
    company: "Shane Investments",
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
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const tiltTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cardRef2 = useRef<HTMLDivElement>(null);
  const glareRef2 = useRef<HTMLDivElement>(null);
  const tiltRafRef2 = useRef<number | null>(null);
  const tiltTimeoutRef2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signupBtnRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.willChange = "transform";
    el.style.transform = "perspective(1400px) rotateY(-12deg) rotateX(2.5deg) scale3d(1,1,1)";
    return () => {
      if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
      if (tiltTimeoutRef.current) clearTimeout(tiltTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const el = cardRef2.current;
    if (!el) return;
    el.style.willChange = "transform";
    el.style.transform = "perspective(1400px) rotateY(12deg) rotateX(-2.5deg) scale3d(1,1,1)";
    const btn = signupBtnRef.current;
    if (btn) {
      btn.style.willChange = "transform";
      btn.style.transform = "perspective(1400px) rotateY(12deg) rotateX(-2.5deg)";
    }
    return () => {
      if (tiltRafRef2.current) cancelAnimationFrame(tiltRafRef2.current);
      if (tiltTimeoutRef2.current) clearTimeout(tiltTimeoutRef2.current);
    };
  }, []);

  const setTiltTransition = (ref: React.RefObject<HTMLDivElement | null>, glareRef: React.RefObject<HTMLDivElement | null>, timeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>) => {
    const el = ref.current;
    const glare = glareRef.current;
    if (!el) return;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    el.style.transition = `1200ms cubic-bezier(.03,.98,.52,.99)`;
    if (glare) glare.style.transition = `opacity 1200ms cubic-bezier(.03,.98,.52,.99)`;
    timeoutRef.current = setTimeout(() => {
      el.style.transition = "";
      if (glare) glare.style.transition = "";
    }, 1200);
  };

  const handleCardMouseEnter = () => setTiltTransition(cardRef, glareRef, tiltTimeoutRef);
  const handleCardMouseEnter2 = () => {
    setTiltTransition(cardRef2, glareRef2, tiltTimeoutRef2);
    const btn = signupBtnRef.current;
    if (btn) {
      btn.style.transition = "1200ms cubic-bezier(.03,.98,.52,.99)";
      setTimeout(() => { btn.style.transition = ""; }, 1200);
    }
  };

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    tiltRafRef.current = requestAnimationFrame(() => {
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1400px) rotateX(${y * -15}deg) rotateY(${x * 15}deg) scale3d(1.04,1.04,1.04)`;
      const glare = glareRef.current;
      if (glare) {
        glare.style.transform = `rotate(${Math.atan2(y, x) * (180 / Math.PI) + 90}deg)`;
        glare.style.opacity = `${Math.min(Math.sqrt(x * x + y * y) * 0.5, 0.2)}`;
      }
    });
  };

  const handleCardMouseMove2 = (e: React.MouseEvent<HTMLDivElement>) => {
    if (tiltRafRef2.current) cancelAnimationFrame(tiltRafRef2.current);
    const clientX = e.clientX;
    const clientY = e.clientY;
    tiltRafRef2.current = requestAnimationFrame(() => {
      const el = cardRef2.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = (clientX - rect.left) / rect.width - 0.5;
      const y = (clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(1400px) rotateX(${y * -15}deg) rotateY(${x * 15}deg) scale3d(1.04,1.04,1.04)`;
      const glare = glareRef2.current;
      if (glare) {
        glare.style.transform = `rotate(${Math.atan2(y, x) * (180 / Math.PI) + 90}deg)`;
        glare.style.opacity = `${Math.min(Math.sqrt(x * x + y * y) * 0.5, 0.2)}`;
      }
      const btn = signupBtnRef.current;
      if (btn) btn.style.transform = `perspective(1400px) rotateX(${y * -15}deg) rotateY(${x * 15}deg)`;
    });
  };

  const handleCardMouseLeave = () => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTiltTransition(cardRef, glareRef, tiltTimeoutRef);
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1400px) rotateY(-12deg) rotateX(2.5deg) scale3d(1,1,1)";
    const glare = glareRef.current;
    if (glare) glare.style.opacity = "0";
  };

  const handleCardMouseLeave2 = () => {
    if (tiltRafRef2.current) cancelAnimationFrame(tiltRafRef2.current);
    setTiltTransition(cardRef2, glareRef2, tiltTimeoutRef2);
    const el = cardRef2.current;
    if (el) el.style.transform = "perspective(1400px) rotateY(12deg) rotateX(-2.5deg) scale3d(1,1,1)";
    const glare = glareRef2.current;
    if (glare) glare.style.opacity = "0";
    const btn = signupBtnRef.current;
    if (btn) {
      btn.style.transition = "1200ms cubic-bezier(.03,.98,.52,.99)";
      btn.style.transform = "perspective(1400px) rotateY(12deg) rotateX(-2.5deg)";
      setTimeout(() => { btn.style.transition = ""; }, 1200);
    }
  };

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

  // Testimonials carousel state
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);

  // Initialize state with the first item's ID
  const [activeCaseId, setActiveCaseId] = useState<string>(useCases[0].id);

  // Use Case auto-play state
  const [isUseCasesAutoPlaying, setIsUseCasesAutoPlaying] = useState(true);

  // Auto-advance logic for Use Cases carousel
  useEffect(() => {
    if (!isUseCasesAutoPlaying || shouldReduceMotion) return;

    const interval = setInterval(() => {
      setActiveCaseId((current) => {
        const currentIndex = useCases.findIndex((item) => item.id === current);
        return useCases[(currentIndex + 1) % useCases.length].id;
      });
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [isUseCasesAutoPlaying, shouldReduceMotion]);

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
    <main className="relative min-h-screen text-white pt-3"
      style={{
        zIndex: -1,
        background: "linear-gradient(180deg, #070757 0%, #000000 100%)"
      }} >
      {/* Page Background */}
      {/* <div 
        className="fixed inset-0 pointer-events-none" 
       
      /> */}

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
          <div className="ring ring-[#446dd321] relative w-[92%] rounded-[3rem] text-center overflow-hidden bg-none">
            <div className="pv-border-wrapper">
              <div className="pv-blob1" />
              <h2
                className="pv-inner relative py-20 px-4 z-10 text-center whitespace-nowrap text-[clamp(2.4rem,6.15vw,5.8rem)] font-black leading-none [transform:scaleY(1.24)_scaleX(0.9)] overflow-hidden"
                style={{
                  fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif",
                  letterSpacing: "0.005em",
                  color: "#fff",
                  display: "block",
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
        </div>
      </section>

      {/* What We're About Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - 3D Phone Mockup */}
          <div className="relative flex justify-center scale-[0.9]">
            {/* Background glow */}
            <Image
              src={glowBg}
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{ width: "540px", height: "540px", objectFit: "contain" }}
              aria-hidden="true"
            />

            <div className="relative">
              <Phone3D>
                {/* Dark blue arc — top-left corner decoration */}
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "150px",
                    height: "150px",
                    top: "-48px",
                    left: "-48px",
                    background: "var(--dark-blue-2)",
                    zIndex: 1,
                  }}
                />
                <div className="relative z-10 flex flex-col items-center justify-between px-4 py-8 h-full w-full pt-14">
                  <div className="flex flex-col items-center gap-3">
                    <Image
                      src={logoIcon}
                      alt="BalloAds Logo"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                    <h3 className="text-[var(--dark-blue-2)] font-black text-center text-[9px] tracking-[0.2em] uppercase leading-tight">
                      Your Digital Marketing
                      <br />
                      Assistant
                    </h3>
                  </div>
                  <div className="w-36 h-36 rounded-[1.75rem] bg-[#2273af] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                    <CloudUpload className="w-12 h-12 text-white mb-1.5" strokeWidth={1.5} />
                    <span className="text-white font-bold text-[11px] text-center leading-tight">
                      Upload your
                      <br />
                      artwork here
                    </span>
                  </div>
                  <button className="w-fit bg-[#020055] text-white px-12 py-1.5 rounded-full font-bold text-base shadow-lg">
                    Next
                  </button>
                </div>
              </Phone3D>

              {/* Floating App Store buttons */}
              <div
                className="absolute z-40 flex flex-col gap-2.5"
                style={{ left: "-60px", top: "56%" }}
              >
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.28)] rounded-2xl px-3 py-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black shrink-0" aria-hidden="true">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.49 0-2.534-1.31-3.529-2.65-1.305-1.74-2.337-4.44-2.337-6.99 0-4.16 2.685-6.36 5.27-6.36 1.4 0 2.566.93 3.45.93.84 0 2.145-.98 3.81-.98.62 0 2.795.06 4.265 2.13-.13.08-2.508 1.46-2.483 4.37.03 3.4 2.965 4.53 3.002 4.55z" />
                  </svg>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[9px] text-zinc-600">Get it on the</span>
                    <span className="text-[11px] font-bold text-zinc-900">App Store</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.28)] rounded-2xl px-3 py-2"
                >
                  <Image
                    src={googlePlayIcon}
                    alt="Google Play"
                    width={20}
                    height={20}
                    className="w-5 h-5 shrink-0"
                  />
                  <div className="flex flex-col items-start leading-tight px-0.5">
                    <span className="text-[9px] text-zinc-600">Get it on</span>
                    <span className="text-[11px] font-bold text-zinc-900">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Content Card */}
          <div
            ref={cardRef}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
            onMouseEnter={handleCardMouseEnter}
            onMouseMove={handleCardMouseMove}
            onMouseLeave={handleCardMouseLeave}
            style={{
              background: "#010218",
              transformOrigin: "center center",
              boxShadow: "28px 32px 80px rgba(0,0,0,0.65), -6px 0 35px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            <TwistingRibbon />

            {/* Content — sits above the orb */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What We&apos;re About
              </h2>
              <p className="text-lg md:text-xl leading-relaxed text-white/90">
                BalloAds is an AI-powered digital advertising platform
                designed to help businesses and organisations
                connect with the right audience through bulk SMS,
                targeted message ads, and data-driven campaign
                management. Whether you&apos;re a startup, an
                enterprise, or a service provider, BalloAds gives you
                the tools to launch impactful marketing campaigns
                with ease
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BalloAds Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto grid md:grid-cols-2 gap-20 items-center">
          {/* Left Side - Content Card */}
          <div className="">
            <div
              ref={cardRef2}
              className="relative rounded-[3rem] p-8 md:p-12 overflow-hidden"
              onMouseEnter={handleCardMouseEnter2}
              onMouseMove={handleCardMouseMove2}
              onMouseLeave={handleCardMouseLeave2}
              style={{
                background: "#010218",
                transformOrigin: "center center",
                boxShadow: "28px 32px 80px rgba(0,0,0,0.65), -6px 0 35px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
              }}
            >
              {/* Glare layer */}
              <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
                <div
                  ref={glareRef2}
                  style={{
                    position: "absolute",
                    top: "50%", left: "50%",
                    width: "200%", height: "200%",
                    marginLeft: "-100%", marginTop: "-100%",
                    background: "linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 100%)",
                    opacity: 0,
                    transform: "rotate(0deg)",
                    transformOrigin: "center",
                    pointerEvents: "none",
                  }}
                />
              </div>
              <TwistingRibbon />

              <div className="relative z-10">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-8">
                  Why Choose BalloAds?
                </h2>
                <div className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">AI-Powered Targeting</h3>
                    <p className="text-base leading-relaxed text-white/80">Get your message in front of the right audience at the right time.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Bulk & Personalised Messaging</h3>
                    <p className="text-base leading-relaxed text-white/80">Scale up your outreach while keeping it personal.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Real-Time Analytics</h3>
                    <p className="text-base leading-relaxed text-white/80">Track campaign performance and optimise results.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">User-Friendly Dashboard</h3>
                    <p className="text-base leading-relaxed text-white/80">Manage all your campaigns in one place.</p>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">Affordable & Scalable</h3>
                    <p className="text-base leading-relaxed text-white/80">Flexible pricing that grows with your business.</p>
                  </div>
                </div>
              </div>
            </div>

            <div ref={signupBtnRef} className="w-full flex justify-center" style={{ transformOrigin: "center center", transform: "perspective(1400px) rotateY(12deg) rotateX(-2.5deg)" }}>
              <Link
                href="#signup"
                className="mt-10 inline-flex items-center gap-4 bg-white text-[#020055] px-8 py-2 rounded-full font-black text-lg hover:bg-white/90 transition-all group"
              >
                Sign up for free today
                <div className="w-8 h-8 rounded-full bg-[#020055] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            </div>
          </div>

          {/* Right Side - 3D Phone Mockup */}
          <div className="relative flex justify-center scale-[0.9]">
            {/* Background glow */}
            <Image
              src={glowBg}
              alt=""
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{ width: "540px", height: "540px", objectFit: "contain" }}
              aria-hidden="true"
            />

            <div className="relative">
              <Phone3D>
                <div
                  className="absolute rounded-full"
                  style={{
                    width: "150px",
                    height: "150px",
                    top: "-48px",
                    left: "-48px",
                    background: "var(--dark-blue-2)",
                    zIndex: 1,
                  }}
                />
                <div className="relative z-10 flex flex-col items-center justify-between px-4 py-8 h-full w-full pt-14">
                  <div className="flex flex-col items-center gap-3">
                    <Image
                      src={logoIcon}
                      alt="BalloAds Logo"
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                    <h3 className="text-[var(--dark-blue-2)] font-black text-center text-[9px] tracking-[0.2em] uppercase leading-tight">
                      Your Digital Marketing
                      <br />
                      Assistant
                    </h3>
                  </div>
                  <div className="w-36 h-36 rounded-[1.75rem] bg-[#2273af] flex flex-col items-center justify-center shadow-2xl relative overflow-hidden">
                    <CloudUpload className="w-12 h-12 text-white mb-1.5" strokeWidth={1.5} />
                    <span className="text-white font-bold text-[11px] text-center leading-tight">
                      Upload your
                      <br />
                      artwork here
                    </span>
                  </div>
                  <button className="w-fit bg-[#020055] text-white px-12 py-1.5 rounded-full font-bold text-base shadow-lg">
                    Next
                  </button>
                </div>
              </Phone3D>

              {/* Floating App Store buttons */}
              <div
                className="absolute z-40 flex flex-col gap-2.5"
                style={{ left: "-60px", top: "56%" }}
              >
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.28)] rounded-2xl px-3 py-2"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black shrink-0" aria-hidden="true">
                    <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.49 0-2.534-1.31-3.529-2.65-1.305-1.74-2.337-4.44-2.337-6.99 0-4.16 2.685-6.36 5.27-6.36 1.4 0 2.566.93 3.45.93.84 0 2.145-.98 3.81-.98.62 0 2.795.06 4.265 2.13-.13.08-2.508 1.46-2.483 4.37.03 3.4 2.965 4.53 3.002 4.55z" />
                  </svg>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-[9px] text-zinc-600">Get it on the</span>
                    <span className="text-[11px] font-bold text-zinc-900">App Store</span>
                  </div>
                </button>
                <button
                  type="button"
                  className="flex items-center gap-2 bg-white shadow-[0_8px_20px_-6px_rgba(0,0,0,0.28)] rounded-2xl px-3 py-2"
                >
                  <Image
                    src={googlePlayIcon}
                    alt="Google Play"
                    width={20}
                    height={20}
                    className="w-5 h-5 shrink-0"
                  />
                  <div className="flex flex-col items-start leading-tight px-0.5">
                    <span className="text-[9px] text-zinc-600">Get it on</span>
                    <span className="text-[11px] font-bold text-zinc-900">Google Play</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16">
        <div className="text-center mb-10">
          <p className="text-3xl text-shimmer">Trusted by the very best</p>
        </div>
        <div className="logo-marquee">
          <div className="logo-marquee-track">
            {/* Render two identical sets so the scroll loops seamlessly */}
            {(
              [
                { src: logoMakhulu, alt: "Makhulu Investments" },
                { src: logoParamount, alt: "Paramount Logistics" },
                { src: logoOmphile, alt: "Omphile Visual Direction" },
                { src: logoInsizwe, alt: "Insizwe" },
                { src: logoMudenda, alt: "Mudenda Capital" },
                { src: logoFI, alt: "Financial Insights" },
                { src: logoTinge, alt: "Tinge Technology" },
                { src: logoIVLounge, alt: "The IV Lounge" },
                { src: logoSWR, alt: "SWR" },
                { src: logoShane, alt: "Shane Investments" },
                { src: logoShreeji, alt: "Shreeji" },
                { src: logoBayport, alt: "Bayport" },
                { src: logoSeneca, alt: "Seneca" },
                { src: logo9, alt: "Client" },
              ]
            ).concat(
              [
                { src: logoMakhulu, alt: "Makhulu Investments" },
                { src: logoParamount, alt: "Paramount Logistics" },
                { src: logoOmphile, alt: "Omphile Visual Direction" },
                { src: logoInsizwe, alt: "Insizwe" },
                { src: logoMudenda, alt: "Mudenda Capital" },
                { src: logoFI, alt: "Financial Insights" },
                { src: logoTinge, alt: "Tinge Technology" },
                { src: logoIVLounge, alt: "The IV Lounge" },
                { src: logoSWR, alt: "SWR" },
                { src: logoShane, alt: "Shane Investments" },
                { src: logoShreeji, alt: "Shreeji" },
                { src: logoBayport, alt: "Bayport" },
                { src: logoSeneca, alt: "Seneca" },
                { src: logo9, alt: "Client" },
              ]
            ).map((logo, i) => (
              <div key={i} className="flex items-center justify-center px-10 shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  height={64}
                  className="h-16 w-auto object-contain opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can use BalloAds Section */}
      <section className="py-20 px-4 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(63,219,255,0.05)_0%,rgba(0,0,0,0)_50%)] pointer-events-none" />
        <div className="container mx-auto">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-20 tracking-tight text-white">
            Who can use BalloAds?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left Side - Clickable Navigation List */}
            <div className="space-y-2 relative z-20">
              {useCases.map((item) => (
                <button
                  key={item.id}
                  className={`w-full text-left flex items-start gap-6 cursor-pointer p-1 rounded-2xl transition-all duration-300 border-none bg-transparent outline-none relative z-30 ${activeCaseId === item.id
                    ? 'text-white'
                    : 'text-gray-500 hover:text-gray-300'
                    }`}
                  style={{ cursor: 'pointer' }}
                  // Make the entire button clickable and hoverable to update the state
                  onClick={() => {
                    setActiveCaseId(item.id);
                    setIsUseCasesAutoPlaying(false);
                  }}
                  onMouseEnter={() => {
                    setActiveCaseId(item.id);
                    setIsUseCasesAutoPlaying(false);
                  }}
                  onMouseLeave={() => setIsUseCasesAutoPlaying(true)}
                >
                  <div className={`shrink-0 mt-1 transition-colors duration-300 ${activeCaseId === item.id ? 'text-white' : 'text-gray-600'}`}>
                    {React.cloneElement(item.icon as React.ReactElement<any>, { className: "w-7 h-7", strokeWidth: 1.5 })}
                  </div>

                  <div className="flex flex-col">
                    <span className={`text-3xl font-bold leading-tight transition-colors ${activeCaseId === item.id ? 'text-white' : 'text-gray-500'}`}>
                      {item.text}
                    </span>
                    <span className={`text-xl mt-1 transition-colors ${activeCaseId === item.id ? 'text-white/80' : 'text-gray-600'}`}>
                      {item.subtext}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Right Side - Dynamic Image Slider */}
            <div className="relative h-[600px] flex items-center justify-center z-10">

              {/* STATIC BACKGROUND IMAGE / GLOW */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />
              </div>

              {/* DYNAMIC BUILDING IMAGE (The Sliding Element) */}
              <div className="relative w-full h-full flex items-center justify-center transition-all duration-500">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeCase.id}
                    initial={{ opacity: 0, x: 20, scale: 1.2 }}
                    animate={{ opacity: 1, x: 0, scale: 1.4 }}
                    exit={{ opacity: 0, x: -20, scale: 1.5 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="absolute w-full h-full flex items-center justify-center"
                  >
                    <Image
                      src={activeCase.image}
                      alt={`${activeCase.text} Building`}
                      width={450}
                      height={900}
                      className="object-contain w-auto h-full drop-shadow-[0_0_30px_rgba(63,219,255,0.2)]"
                      priority
                    />
                  </motion.div>
                  <motion.div
                    key={`${activeCaseId}-line`}
                    initial={{ width: 0 }}
                    animate={{ width: "60%" }}
                    exit={{ width: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="bg-zinc-600 h-[4px] absolute bottom-[3%] rounded-full"
                  />
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12">
            <span className="text-gradient-cyan block">
              HEAR FROM THOSE WHO HAVE
              <br />
              TRIED AND TESTED
            </span>
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="gradient-blue-grey rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col">
              <div className="flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={testimonialIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="flex flex-col items-center text-center"
                  >
                    <p className="text-xl md:text-2xl leading-relaxed mb-8 italic line-clamp-4 overflow-hidden h-[6.8rem]">
                      &quot;{testimonials[testimonialIndex].quote}&quot;
                    </p>
                    <p className="text-xl font-bold mb-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].name}</p>
                    <p className="text-white/80 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].title}</p>
                    <p className="text-white/60 text-sm mt-1 line-clamp-1 overflow-hidden w-full min-h-[1rem]">{testimonials[testimonialIndex].company}</p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Dot navigation */}
              <div className="flex justify-center gap-3 mt-8">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={`transition-all duration-300 rounded-full ${i === testimonialIndex
                      ? "w-6 h-3 bg-white"
                      : "w-3 h-3 bg-white/30 hover:bg-white/60"
                      }`}
                    aria-label={`Go to testimonial ${i + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-12">
            <Link
              href="#signup"
              className="glow-button group"
            >
              {/* God-ray layers — blurred & stretched text duplicates behind the real text */}
              <span className="glow-button__ray-layer glow-button__ray-layer--wide" aria-hidden="true">Join waitlist</span>
              <span className="glow-button__ray-layer glow-button__ray-layer--h" aria-hidden="true">Join waitlist</span>
              <span className="glow-button__ray-layer glow-button__ray-layer--v" aria-hidden="true">Join waitlist</span>
              <span className="glow-button__ray-layer glow-button__ray-layer--d1" aria-hidden="true">Join waitlist</span>
              <span className="glow-button__ray-layer glow-button__ray-layer--d2" aria-hidden="true">Join waitlist</span>
              <span className="glow-button__ray-layer glow-button__ray-layer--core" aria-hidden="true">Join waitlist</span>

              {/* Visible text */}
              <span className="glow-button__text">Join waitlist</span>
              {/* Arrow icon */}
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:scale-110 group-hover:bg-white/20 transition-all relative z-10">
                <svg
                  className="w-5 h-5 transition-all duration-300 group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              {/* Ambient glow behind everything */}
              <div className="glow-button__glow-core" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
