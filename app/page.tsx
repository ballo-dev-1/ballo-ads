"use client";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import playStore from "@/public/elements small/19.png";
import appleStore from "@/public/elements small/18.png";

import building from "@/public/Assets/46.png";
import buildingFinance from "@/public/Assets/48.png";
import buildingNonprofit from "@/public/Assets/49.png";
import buildingRetail from "@/public/Assets/51.png";
import buildingHealthcare from "@/public/Assets/53.png";
import buildingEducation from "@/public/Assets/57.png"
import bglight from "@/public/Assets/2.png"
import { Building, // 🏢 Building / Corporation
  Landmark, // 🏦 Bank / Finance
  Globe,    // 🌍 Globe / Nonprofit / Government
  ShoppingCart, // 🛒 Shopping Cart / Retail
  Heart,    // 🏥 Heart/Medical / Healthcare
  GraduationCap // 🎓 Graduation Cap / Education
} from "lucide-react";

import woman from "@/public/Assets/11.png";
import woman1 from "@/public/Assets/12.png";
import man from "@/public/Assets/14.png";
import woman2 from "@/public/Assets/13.png";
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

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    message: "",
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
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

  // Initialize state with the first item's ID
  const [activeCaseId, setActiveCaseId] = useState<string>(useCases[0].id);

  // Find the currently active case object to get its image
  const activeCase = useCases.find(c => c.id === activeCaseId) || useCases[0];

  return (
    <main className="min-h-screen bg-[var(--dark-blue-2)] text-white">
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

      {/* Powerful and Versatile Banner */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="gradient-blue-purple rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-4xl md:text-6xl font-bold">
              <span className="text-gradient-cyan">POWERFUL </span> 
              <span className="text-gradient-cyan">AND </span>
              <span className="text-gradient-purple">VERSATILE</span>
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
            
            {/* Optional: Add an absolute blur/vignette effect over the dynamic image */}
            {/*<div className="absolute inset-0 bg-gradient-to-t from-[var(--dark-blue)] via-transparent to-[var(--dark-blue)] opacity-50 pointer-events-none" /> */}
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
                <p className="text-white/80">Inokwe Private Brokers</p>
              </div>
              {/* Carousel Dots */}
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-white" />
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <div className="w-2 h-2 rounded-full bg-white/30" />
                <div className="w-2 h-2 rounded-full bg-white/30" />
              </div>
            </div>
          </div>
          {/* Company Logos Again */}
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mt-12 opacity-60">
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

      {/* Sign Up Form Section */}
      <section
        id="signup"
        className="py-20 px-4 bg-[var(--dark-blue-2)]"
      >
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            WANT A FEEL OF BALLOADS?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            {/* Left Side - iPhone Mockup */}
            <div className="relative flex justify-center">
              <div className="relative w-full max-w-xs">
                <div /*className="absolute inset-0 bg-[var(--brand-color-4)]/20 rounded-full blur-3xl"*/ />
                <div className="relative">
                  <Image
                    src={phone1}
                    alt="BalloAds App"
                    width={300}
                    height={600}
                    className="w-full h-auto scale-[1.5]"
                  />
                  {/* App Store Buttons */}
                {/*<div className="flex flex-col gap-3 mt-6 items-start">
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
                </div> */}
                </div>
              </div>
            </div>

            {/* Right Side - Form */}
            {/*
            <div className="gradient-blue-purple rounded-3xl p-8 md:p-12">
              <p className="text-sm text-white/80 mb-6">
                (One-Time Free Trial - KYC Required) Try BalloAds for free! But
                first, let&apos;s sign up.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="NAME"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--brand-color-1)] placeholder:text-[var(--brand-color-1)]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  required
                />
                <input
                  type="text"
                  name="businessName"
                  placeholder="DISPLAY BUSINESS NAME"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--brand-color-1)] placeholder:text-[var(--brand-color-1)]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  required
                />
                <input
                  type="email"
                  name="email"
                  placeholder="EMAIL"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--brand-color-1)] placeholder:text-[var(--brand-color-1)]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  required
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="PHONE NUMBER"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--brand-color-1)] placeholder:text-[var(--brand-color-1)]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  required
                />
                <textarea
                  name="message"
                  placeholder="MESSAGE"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl bg-white text-[var(--brand-color-1)] placeholder:text-[var(--brand-color-1)]/60 font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)] resize-none"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-[var(--brand-color-4)] text-[var(--brand-color-1)] px-8 py-4 rounded-xl font-bold text-lg hover:bg-[var(--cyan-light)] transition-colors"
                >
                  SUBMIT
                </button>
              </form>
            </div> */}
          </div>
        </div>
      </section>
    </main>
  );
}
