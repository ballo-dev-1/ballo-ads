"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
//import background from "@/public/Backgrounds/hero-bg.png";
//import pattern from "@/public/Backgrounds/pattern.png";
import woman from "@/public/Assets/10.png";
import ring from "@/public/Assets/8.png";
import playStore from "@/public/elements small/19.png";
import appleStore from "@/public/elements small/18.png";
import phone from "@/public/Assets/3.png"
import building from "@/public/Assets/46.png"
import bglight from "@/public/Assets/2.png"
import { Phone } from "lucide-react";


export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    message: "",
  });

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

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      {/* Hero Section */}
      <section
        className="relative min-h-screen flex items-center justify-center px-4 md:px-8 py-20 overflow-hidden"
        style={{
          //background: `url(${background.src})`,
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
        <div className="absolute inset-0 flex items-end justify-center pointer-events-none">
          <span className="text-[50px] md:text-[100px] font-bold text-white/5 select-none">
            REBRANDING THE FUTURE
          </span>
        </div>

        <div className="container mx-auto relative z-10 grid md:grid-cols-2 gap-12 items-center px-10">
          {/* Left Side - Content */}
          <div className="flex flex-col gap-8 ">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold leading-tight scale-[1.25]">
              YOUR DIGITAL MARKETING ASSISTANT
            </h1>
            <Link
              href="#signup"
              className="inline-block w-fit border-2 border-white bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:text-[var(--brand-color-1)] transition-all"
            >
              Try it now
            </Link>
            {/* Carousel Dots */}
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-white" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <div className="w-2 h-2 rounded-full bg-white/30" />
            </div>
          </div>

          {/* Right Side - Woman with Phone */}
          <div className="relative flex justify-center items-center">
            <div className="relative w-full max-w-md">
              {/* Placeholder for woman with phone - using phone image for now */}
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
                  src={woman}
                  alt="Woman with phone"
                  width={400}
                  height={600}
                  className="w-full h-auto z-10 relative scale-[1.5]"
                  priority
                />
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
          <div className="bg-[var(--dark-blue)] rounded-3xl p-8 md:p-12">
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
      <section className="py-20 px-4 bg-[var(--dark-blue)]">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content Card */}
          <div className="bg-[var(--dark-blue-2)] rounded-3xl p-8 md:p-12">
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
      <section className="py-20 px-4 bg-[var(--dark-blue)]">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Who can use BalloAds?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Side - Icons and List */}
            <div className="space-y-6">
              {[
                { icon: "🏢", text: "SMEs & Corporations" },
                { icon: "🏦", text: "Financial Institutions" },
                { icon: "🌍", text: "Nonprofits & Government Initiatives" },
                { icon: "🛒", text: "Retail & E-commerce" },
                { icon: "🏥", text: "Healthcare & Clinics" },
                { icon: "🎓", text: "Education Institutions" },
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-3xl">{item.icon}</span>
                  <span className="text-xl">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Right Side - Building Image */}
            <div className="relative">
              <div /*className="relative w-full h-96 bg-gradient-to-br from-[var(--dark-blue-2)] to-[var(--purple)] rounded-3xl overflow-hidden"*/>
                <div className="absolute inset-0 bg-[var(--brand-color-4)]/10 rounded-full blur-3xl" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-6xl">
                  <Image
                  src={bglight}
                  alt="Circles Ring"
                  width={1600}
                  height={1900}
                  className="w-full h-auto absolute right-3 -bottom-50 scale-[0.75]"
                  priority
                />
                  <Image
                  src={building}
                  alt="BalloAds App"
                  width={300}
                  height={600}
                  className="w-full h-auto scale-[2.3]"
                />
                  </div>
                </div>
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
        className="py-20 px-4 bg-[var(--dark-blue)]"
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
                    src={phone}
                    alt="BalloAds App"
                    width={300}
                    height={600}
                    className="w-full h-auto scale-[1.5]"
                  />
                  {/* App Store Buttons */}
                <div className="flex flex-col gap-3 mt-6 items-start">
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
