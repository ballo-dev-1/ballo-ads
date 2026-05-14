"use client";
// components/marketing/HeroSection.tsx

import React, { useState } from 'react';
import Image from 'next/image';

import Link from 'next/link';
import clsx from 'clsx'; // Utility for conditionally joining class names
import person from "@/public/Assets/15.png";
import circle from "@/public/Assets/9.png";
import man from "@/public/BalloAds Assets 2/18.png";

// --- Prop Types & Variants ---

type ButtonVariant = 'primary' | 'secondary' | 'ghost';
type ButtonSize = 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
  href?: string; // Optional: Makes the button act as a Next.js Link
}

// --- Base Styles (Shared) ---

const baseStyles = 'font-semibold rounded-lg transition duration-300 ease-in-out focus:outline-none focus:ring-4';

const sizeStyles: Record<ButtonSize, string> = {
  medium: 'px-5 py-2 text-base',
  large: 'px-8 py-3 text-lg shadow-xl', // Used in the Hero Section
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500/50',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300/50',
  ghost: 'bg-transparent text-blue-600 hover:bg-blue-50 focus:ring-blue-500/20',
};


// --- Component ---

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  className,
  href,
  ...props
}) => {
  const classes = clsx(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  // If href is provided, render as a Next.js Link
  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className={classes}>
          {children}
        </a>
      </Link>
    );
  }

  // Otherwise, render as a standard <button>
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
};
// --- Component Definition ---

const HeroSection: React.FC = () => {
  // State to capture the user's business needs
  const [formData, setFormData] = useState({
    businessType: '',
    messageCount: '',
    audience: '',
    recipient: '',
    frequency: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="bg-[var(--brand-color-1)]">
      <section className="container mx-auto px-4 py-16 md:py-24 lg:py-16 bg-[var(--brand-color-1)]">
        <div className="relative overflow-hidden max-w-6xl mx-auto">
          <h3 className="text-xl md:text-2xl text-white/70 text-center mb-8 uppercase tracking-widest">
            HI! WONDERING WHICH PLAN BEST SUITS YOU? WE WILL MEET YOU WHERE YOU ARE.
          </h3>

          {/* The "Sentence" Input UI 
          We use "inline-block" and "border-b-2" to keep the design looking like a fill-in-the-blank form.
        */}
          <div className="text-3xl md:text-5xl lg:text-6xl text-white leading-tight md:leading-relaxed text-center lg:text-left">
            I have a
            <input
              type="text"
              name="businessType"
              placeholder="e-commerce"
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none px-2 mx-2 placeholder:text-white/20 w-48 md:w-72 transition-colors"
              onChange={handleChange}
            />
            business and want to send
            <input
              type="text"
              name="messageCount"
              placeholder="50,000"
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none px-2 mx-2 placeholder:text-white/20 w-40 md:w-60 transition-colors"
              onChange={handleChange}
            />
            messages to
            <input
              type="text"
              name="audience"
              placeholder="active"
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none px-2 mx-2 placeholder:text-white/20 w-40 md:w-60 transition-colors"
              onChange={handleChange}
            />
            people quickly and efficiently. I want to ensure
            <input
              type="text"
              name="recipient"
              placeholder="everyone"
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none px-2 mx-2 placeholder:text-white/20 w-48 md:w-72 transition-colors"
              onChange={handleChange}
            />
            receives messages
            <input
              type="text"
              name="frequency"
              placeholder="instantly"
              className="bg-transparent border-b-2 border-white/40 focus:border-white outline-none px-2 mx-2 placeholder:text-white/20 w-48 md:w-72 transition-colors"
              onChange={handleChange}
            />
            .
          </div>

          {/* Optional: Add a 'Find My Plan' button */}
          <div className="mt-12 text-center lg:text-right">
            <button className="bg-white text-[var(--brand-color-1)] font-bold py-4 px-10 rounded-full hover:bg-opacity-90 transition shadow-lg">
              GET RECOMMENDED PLAN
            </button>
          </div>
        </div>
      </section>
      <section className="container mx-auto px-4 py-10 md:py-18 lg:py-8 bg-[var(--brand-color-1)]">
        <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#0F1F4C] via-[#133A7C] to-[#0A4ACB] p-[2px] shadow-2xl">
          <div className="flex h-full flex-col gap-8 rounded-[46px] gradient-blue-grey p-6 md:flex-row md:p-8">
            <div className="flex flex-1 flex-col justify-center gap-4 text-white">
              <div className="glitch-text">
                <h1 className="text-5xl font-bold md:text-8xl">
                  BULK SMS
                </h1>
              </div>
              <p className="text-base text-white">
                With this service, you can send bulk SMS campaigns
                instantly to thousands of recipients with just a few
                clicks. The platform ensures fast delivery, detailed
                analytics, and personalised messaging, helping......
              </p>
            </div>
            <div className="relative flex flex-1 items-center justify-center">
              <div className="absolute -top-8 -right-6 h-48 w-48 rounded-full bg-[var(--brand-color-2)]/10 blur-2xl" />
              <Image
                src={man}
                alt="Smiling marketer"
                width={360}
                height={320}
                className="relative h-auto w-full max-w-xs scale-[1.3] object-contain rounded-[46px]"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-[var(--dark-blue)] text-white px-4 md:px-8 py-24">
        <div className="container mx-auto relative z-10 flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <div className="max-w-2xl flex flex-col gap-6">
            <div className="glitch-text">
              <h3 className="text-4xl md:text-5xl font-bold drop-shadow-2xl leading-tight text-white">
                Rebranding the future of your industry starts here.
              </h3>
            </div>
            <p className="text-base md:text-lg text-white/70 leading-relaxed max-w-xl">
              Book a tailored BalloAds demo and see how our omnichannel marketing platform can help you
              unlock new revenue, accelerate growth and engage your audience in real time.
            </p>
            <Link
              href="/book-demo"
              className="inline-flex items-center gap-3 w-fit px-8 py-4 rounded-full bg-white text-[var(--dark-blue)] font-semibold text-lg shadow-lg hover:bg-[var(--brand-color-2)] transition-colors"
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
              <div className="absolute inset-0 rounded-full bg-[#F5F7FF] blur-2xl" />
              <div className="absolute inset-4 rounded-full bg-[var(--dark-blue)] shadow-2xl" />
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
          <div className="absolute -top-40 right-0 w-96 h-96 rounded-full bg-[#F5F7FF] blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-[#F5F7FF] blur-[120px]" />
        </div>
      </section>
    </div>

  );
};

export default HeroSection;