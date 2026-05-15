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
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { TwistingRibbon } from "./components/ui/TwistingRibbon";
import { Phone3D } from "./components/ui/Phone3D";
import { SilkBackground } from "./components/ui/SilkBackground";

gsap.registerPlugin(ScrollTrigger, useGSAP);
import phoneFrame from "@/public/Assets/phone-frame.png";
import analyticsDashImg from "@/public/Assets/analytics-D8Ni1S4n.png";
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
  const marqueeSectionRef = useRef<HTMLElement>(null);
  const testimonialsSectionRef = useRef<HTMLElement>(null);
  const isMarqueeVisibleRef = useRef(false);
  const isTestimonialsVisibleRef = useRef(false);
  const marqueeLoopWidthRef = useRef(0);
  const marqueeX = useMotionValue(0);
  const { scrollY } = useScroll();
  const rawScrollVelocity = useVelocity(scrollY);
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const tiltRafRef = useRef<number | null>(null);
  const tiltTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const whyContainerRef = useRef<HTMLElement>(null);
  const whoContainerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.willChange = "transform";
    el.style.transform = "none";
    return () => {
      if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
      if (tiltTimeoutRef.current) clearTimeout(tiltTimeoutRef.current);
    };
  }, []);

  useGSAP(() => {
    const outer = whyContainerRef.current;
    if (!outer) return;

    const stickyEl = outer.querySelector<HTMLElement>(".why-scroll-sticky");
    const items = Array.from(outer.querySelectorAll<HTMLElement>(".why-scroll-item"));
    if (!stickyEl || items.length === 0) return;

    const numItems = items.length;
    const WHY_START = 190;
    const WHY_END = 340;
    const hues = items.map((_, i) =>
      WHY_START + ((WHY_END - WHY_START) / (numItems - 1)) * i
    );
    const alphas = items.map((_, i) => (i === 0 || i === numItems - 1 ? 0 : 1));

    gsap.set(stickyEl, { "--bg-hue": hues[0], "--bg-alpha": alphas[0] });
    gsap.set(items, { opacity: 0 });
    gsap.set(items[0], { opacity: 1 });

    const tl = gsap.timeline();
    for (let i = 1; i < numItems; i++) {
      tl.to(items[i - 1], { opacity: 0, duration: 0.7 });
      tl.to(items[i], { opacity: 1, duration: 0.7 }, "<");
      tl.to(
        stickyEl,
        { "--bg-hue": hues[i], "--bg-alpha": alphas[i], ease: "none", duration: 1 },
        "<"
      );
    }
    ScrollTrigger.create({
      trigger: stickyEl,
      start: "top top",
      end: `+=${numItems * 100}vh`,
      pin: true,
      pinSpacing: true,
      animation: tl,
      scrub: 0.8,
    });
  });

  useGSAP(() => {
    const outer = whoContainerRef.current;
    if (!outer) return;

    const stickyEl = outer.querySelector<HTMLElement>(".who-scroll-sticky");
    const listItems = Array.from(outer.querySelectorAll<HTMLElement>(".who-list-item"));
    const imageItems = Array.from(outer.querySelectorAll<HTMLElement>(".who-image-item"));
    if (!stickyEl || listItems.length === 0) return;

    const numItems = listItems.length;

    gsap.set(listItems, { opacity: 0.25 });
    gsap.set(listItems[0], { opacity: 1 });
    gsap.set(imageItems, { opacity: 0 });
    gsap.set(imageItems[0], { opacity: 1 });

    const tl = gsap.timeline();
    for (let i = 1; i < numItems; i++) {
      tl.to(listItems[i], { opacity: 1, duration: 0.5 });
      tl.to(imageItems[i - 1], { opacity: 0, duration: 0.5 }, "<");
      tl.to(imageItems[i], { opacity: 1, duration: 0.5 }, "<");
    }

    ScrollTrigger.create({
      trigger: stickyEl,
      start: "top top",
      end: `+=${numItems * 100}vh`,
      pin: true,
      pinSpacing: true,
      animation: tl,
      scrub: 0.8,
    });
  });

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


  const handleCardMouseLeave = () => {
    if (tiltRafRef.current) cancelAnimationFrame(tiltRafRef.current);
    setTiltTransition(cardRef, glareRef, tiltTimeoutRef);
    const el = cardRef.current;
    if (el) el.style.transform = "perspective(1400px) rotateY(-12deg) rotateX(2.5deg) scale3d(1,1,1)";
    const glare = glareRef.current;
    if (glare) glare.style.opacity = "0";
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

  // Pause marquee RAF when the section is off-screen
  useEffect(() => {
    const el = marqueeSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { isMarqueeVisibleRef.current = entry.isIntersecting; },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Pause testimonials interval when section is off-screen
  useEffect(() => {
    const el = testimonialsSectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { isTestimonialsVisibleRef.current = entry.isIntersecting; },
      { rootMargin: "100px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
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
      if (!isTestimonialsVisibleRef.current) return;
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(t);
  }, []);


  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion || !isMarqueeVisibleRef.current) return;

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

  return (
    <main className="relative min-h-screen text-white pt-3 overflow-x-hidden"
      style={{ background: "linear-gradient(180deg, #070757 0%, #000000 100%)" }}>
      <SilkBackground />

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
              <div className="relative w-full max-w-md h-[260px] sm:h-[380px] md:h-[560px]">
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
                className="pv-inner relative py-20 px-4 z-10 text-center whitespace-nowrap text-[clamp(1rem,5.5vw,5.8rem)] font-black leading-none [transform:scaleY(1.24)_scaleX(0.9)] overflow-hidden"
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
          <div className="relative flex justify-center scale-[0.9] order-last md:order-first">
            {/* Background glow */}
            <Image
              src={glowBg}
              alt=""
              loading="lazy"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none"
              style={{ width: "500px", height: "500px", objectFit: "contain" }}
              aria-hidden="true"
            />

            <div className="relative">
              <Phone3D floating={
                <div
                  className="absolute hidden md:flex flex-col gap-2.5"
                  style={{ left: "-60px", top: "56%", transform: "translateZ(40px)" }}
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
              }>
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
            </div>
          </div>

          {/* Right Side - Content Card */}
          <div
            ref={cardRef}
            className="relative rounded-3xl p-8 md:p-12 overflow-hidden"
            style={{
              transformOrigin: "center center",
              // boxShadow: "28px 32px 80px rgba(0,0,0,0.65), -6px 0 35px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)",
            }}
          >
            {/* <TwistingRibbon /> */}

            {/* Content — sits above the orb */}
            <div className="relative z-10">
              <h2 className="text-4xl md:text-7xl font-bold mb-6 text-gradient-silver-2">
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

      {/* Why Choose BalloAds Section - Sticky Scroll */}
      <section ref={whyContainerRef} className="why-scroll-outer">
        <div className="why-scroll-sticky">
          <div className="why-scroll-inner">
            <div className="why-scroll-heading">
              <h2 className="text-4xl md:text-8xl font-black text-gradient-silver leading-tight tracking-tight">
                Why<br />
                Choose<br />
                BalloAds?
              </h2>
              <p className="mt-4 text-white text-base leading-relaxed" style={{ maxWidth: "22rem" }}>
                The digital marketing platform built for your growth.
              </p>
              <Link
                href="#signup"
                className="mt-8 inline-flex items-center gap-4 bg-white text-[#020055] px-8 py-2 rounded-full font-black text-lg hover:bg-white/90 transition-all group"
              >
                Sign up for free today
                <div className="w-8 h-8 rounded-full bg-[#020055] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>

            {/* Right area: background images + phone frame */}
            <div className="why-right-area">
              {/* Static dashboard screenshot behind the phone */}
              <div className="why-bg-images h-[60vh] mt-32 rounded-3xl overflow-hidden">
                <Image
                  src={analyticsDashImg}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="50vw"
                  loading="lazy"
                  className="why-bg-img"
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                />
              </div>
              {/* Phone frame with features inside */}
              <div className="why-phone-wrapper">
                <ul className="why-scroll-items" style={{ "--count": 5 } as React.CSSProperties}>
                  {[
                    { title: "AI-Powered Targeting", desc: "Get your message in front of the right audience at the right time." },
                    { title: "Bulk & Personalised Messaging", desc: "Scale up your outreach while keeping it personal." },
                    { title: "Real-Time Analytics", desc: "Track campaign performance and optimise results." },
                    { title: "User-Friendly Dashboard", desc: "Manage all your campaigns in one place." },
                    { title: "Affordable & Scalable", desc: "Flexible pricing that grows with your business." },
                  ].map((feature, i) => (
                    <li key={i} className="why-scroll-item" style={{ "--i": i } as React.CSSProperties}>
                      <span className="why-scroll-item-num">0{i + 1}</span>
                      <h3 className="why-scroll-item-title">{feature.title}</h3>
                      <p className="why-scroll-item-desc">{feature.desc}</p>
                    </li>
                  ))}
                </ul>
                {/* Phone frame overlaid on top */}
                <Image
                  src={phoneFrame}
                  alt=""
                  aria-hidden="true"
                  className="why-phone-frame-img"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section ref={marqueeSectionRef} className="py-16">
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
              <div key={i} className="flex items-center justify-center px-5 shrink-0">
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  height={112}
                  loading="lazy"
                  sizes="112px"
                  className="h-28 w-auto object-contain opacity-100 transition-opacity"
                  style={{
                    filter: logo.src === logoBayport ? 'brightness(0) invert(1)' : 'none'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can use BalloAds Section — scroll-pinned */}
      <section ref={whoContainerRef} className="who-scroll-outer">
        <div className="who-scroll-sticky">
          <div className="who-scroll-inner">
            <h2 className="who-scroll-heading-text">
              Who can use BalloAds?
            </h2>
            <div className="who-content-grid">
              {/* Left — list, GSAP drives opacity per item */}
              <div className="who-left-list">
                {useCases.map((item, i) => (
                  <div key={item.id} className="who-list-item">
                    <div className="who-list-icon">
                      {React.cloneElement(item.icon as React.ReactElement<{ className?: string; strokeWidth?: number }>, {
                        className: "w-5 h-5 md:w-7 md:h-7",
                        strokeWidth: 1.5,
                      })}
                    </div>
                    <div className="who-list-text">
                      <span className="who-list-title">{item.text}</span>
                      <span className="who-list-subtext">{item.subtext}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right — stacked images, GSAP crossfades */}
              <div className="who-right-images">
                <div className="w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px] absolute pointer-events-none" />
                {useCases.map((item) => (
                  <div key={item.id} className="who-image-item">
                    <Image
                      src={item.image}
                      alt={item.text}
                      width={650}
                      height={900}
                      loading="lazy"
                      sizes="(max-width: 768px) 80vw, 40vw"
                      className="object-contain w-auto h-full drop-shadow-[0_0_30px_rgba(63,219,255,0.2)]"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section ref={testimonialsSectionRef} className="py-20 px-4">
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
                    <p className="text-xl md:text-2xl leading-relaxed mb-8 italic line-clamp-4 overflow-hidden h-[8.5rem] md:h-[10rem]">
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
