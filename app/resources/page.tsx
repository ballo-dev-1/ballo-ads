"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import personSmile from "@/public/Assets/12.png";
import pushNotifications from "@/public/Assets/10.png";
import analyticsTile from "@/public/BalloAds Assets 2/1.png";
import smsTile from "@/public/BalloAds Assets 2/24.png";
import uploadContacts from "@/public/Assets/14.png";
import whatsappTile from "@/public/BalloAds Assets 2/22.png";
import aiBoard from "@/public/elements small/stats-chart.png";
import bankingImage from "@/public/BalloAds Assets 2/1.png";
import retailImage from "@/public/BalloAds Assets 2/4.png";
import insurance from "@/public/BalloAds Assets 2/2.png";
import transportImage from "@/public/BalloAds Assets 2/6.png";
import healthcareImage from "@/public/BalloAds Assets 2/9.png";
import mining from "@/public/BalloAds Assets 2/10.png";
import restaurant from "@/public/BalloAds Assets 2/13.png";
import education from "@/public/BalloAds Assets 2/15.png";
import entertainment from "@/public/BalloAds Assets 2/17.png";
import { title } from "process";
import ring from "@/public/Assets/8.png";
const heroCards = {
  main: {
    title: "Seamless email Marketing and at your fingertips",
    cta: "Watch Demo",
    description:
      "Open BalloAds · Menu · Create Ad · Type message · Select platform · Add contacts · Select duration · Select area · Preview · Done",
    image: personSmile,
  },
  secondary: [
    { title: "Push Notifications", image: pushNotifications },
    { title: "Check your Analytics", image: analyticsTile },
    { title: "SMS Marketing just for you", image: smsTile },
    { title: "Upload Contacts", image: uploadContacts },
    { title: "WhatsApp Marketing", image: whatsappTile },
  ],
};

const faqItems = [
  {
    question: "1. How do I create an account on BalloAds?",
    answer:
      "Simply visit the BalloAds website or download the app, click “Sign Up,” enter your persona & business details, and follow the guided setup to activate your dashboard in under 5 minutes.",
  },
  {
    question: "2. What types of ads can I run on BalloAds?",
    answer:
      "You can run web push ads, pop-up ads, SMS campaigns, email campaigns, and WhatsApp broadcasts - all managed from one central platform.",
  },
  {
    question: "3. How does BalloAds target the right audience?",
    answer:
      "BalloAds uses behaviour-based data, device insights, and interest segments to deliver your ads to users who are most likely to engage.",
  },
  {
    question: "4. Can I track my campaign performance in real time?",
    answer:
      "Yes - BalloDash provides real-time analytics, showing impressions, clicks, conversions, spend, and performance insights instantly.",
  },
  {
    question: "5. What industries can use BalloAds?",
    answer:
      "Any business can benefit, including retail, banking, insurance, e-commerce, hospitality, health services, and SMEs looking to boost visibility.",
  },
  {
    question: "6. How much does it cost to advertise on BalloAds?",
    answer:
      "Pricing depends on your chosen channels and ad volume, but all campaigns are optimised to reduce waste and maximise ROI.",
  },
  {
    question: "7. Do I need a technical team to use BalloAds?",
    answer:
      "No - BalloAds is built for simplicity, with an intuitive dashboard that anyone can manage without coding or technical skills.",
  },
  {
    question: "8. Can BalloAds integrate with my existing systems?",
    answer:
      "Absolutely! BalloAds seamlessly integrates with CRM systems, websites, payment gateways, and email platforms via APIs to unify your workflow.",
  },
  {
    question: "9. How secure is the BalloAds platform?",
    answer:
      "We use enterprise-grade security, encrypted data handling, and strict compliance standards to keep your business and customer data safe.",
  },
  {
    question: "10. Can BalloAds help increase conversions for my business?",
    answer:
      "Yes - our multi-channel delivery, smart targeting, and automated optimisation work together to turn more leads into paying customers.",
  },
];

export default function ResourcesPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <main className="bg-[#EEF2FF] text-[var(--dark-blue)]">
      {/* Guides Hero Section */}
      <section className="relative overflow-hidden px-4 pb-24 pt-24 md:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-20 h-72 w-72 rounded-full bg-[var(--brand-color-3)]/15 blur-3xl" />
          <div className="absolute top-40 right-10 h-56 w-56 rounded-full bg-[var(--brand-color-1)]/10 blur-3xl" />
        </div>

        <div className="container mx-auto flex flex-col gap-12">
          {/*
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-color-1)]">
              Guides
            </span>
            <h1 className="text-4xl font-bold text-[var(--dark-blue)] md:text-6xl">
              Seamless email Marketing and at your fingertips
            </h1>
            <div className="text-sm font-medium uppercase tracking-[0.25em] text-[var(--dark-blue)]/60">
              Open BalloAds · Menu · Create Ad · Type message · Select platform · Add contacts · Select duration ·
              Select area · Preview · Done
            </div>
          </div>
          */}

          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#0F1F4C] via-[#133A7C] to-[#0A4ACB] p-[2px] shadow-2xl">
              <div className="flex h-full flex-col gap-8 rounded-[46px] bg-white/90 p-6 md:flex-row md:p-8">
                <div className="flex flex-1 flex-col justify-center gap-4 text-[var(--dark-blue)]">
                  <div className="glitch-text">
                  <h2 className="text-3xl font-bold md:text-4xl">
                    {heroCards.main.title}
                  </h2>
                  </div>
                  <p className="text-base text-[var(--dark-blue)]/70">
                    Explore in-depth walkthroughs and video tutorials designed to help you launch campaigns in minutes.
                  </p>
                  <Link
                    href="/watch-demo"
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--brand-color-2)]"
                  >
                    {heroCards.main.cta}
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="relative flex flex-1 items-center justify-center">
                  <div className="absolute -top-8 -right-6 h-48 w-48 rounded-full bg-[var(--brand-color-2)]/10 blur-2xl" />
                  <Image
                    src={heroCards.main.image}
                    alt="Smiling marketer"
                    width={360}
                    height={320}
                    className="relative h-auto w-full max-w-xs scale-[1.3] object-contain"
                    priority
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-y-20 md:grid-cols-2 md:gap-x-20">
              {heroCards.secondary.map((card) => (
                <div
                  key={card.title}
                  className="relative overflow-hidden flex items-center gap-4 rounded-[32px] bg-white/90 p-4 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >   
                  <Image
                    src={card.image} 
                    alt={card.title} 
                    fill
                    className="h-11 w-11 scale-[1.15] object-contain z-0" 
                  />
                  <div className="text-sm font-semibold text-[var(--dark-blue)] z-[1] relative">{card.title}</div>
                  <Link
                    href="/watch-demo"
                    className="ml-auto inline-flex h-9 w-9 items-center justify-center z-[1] relative rounded-full bg-[var(--brand-color-1)] text-white"
                    aria-label={`Watch demo for ${card.title}`}
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="relative overflow-hidden bg-[var(--brand-color-1)] text-white px-4 py-24 md:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-white/10" />
          <div className="absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-white/10" />
        </div>

        <div className="container mx-auto flex flex-col gap-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="rounded-full bg-white/10 px-6 py-2 text-xl font-semibold uppercase tracking-[0.3em]">
              FAQs
            </span>
            <div className="flex items-center flex-col gap-3">
              <div className="glitch-text">
                <h2 className="text-4xl font-bold md:text-5xl">
                  Got any questions? We’ve got the answers
                </h2>
              </div>
              <div className="items-center">
                <p className="max-w-2xl text-sm text-white/70 md:text-base">
                  Browse through common questions from the BalloAds community. Switch categories to explore more step-by-step guides.
                </p>
              </div>
            </div>
            <div className="relative inline-flex items-center gap-3 rounded-full bg-white/10 px-5 py-3 text-sm">
              <span className="text-white/80">Category</span>
              <select className="rounded-full border border-white/20 bg-transparent px-4 py-2 text-xs uppercase tracking-[0.3em] outline-none">
                <option className="text-[var(--dark-blue)]">Getting Started</option>
                <option className="text-[var(--dark-blue)]">Automation</option>
                <option className="text-[var(--dark-blue)]">Integrations</option>
                <option className="text-[var(--dark-blue)]">Analytics</option>
              </select>
            </div>
          </div>
          </div>
        </section>  

        <section className="relative overflow-hidden bg-[#EEF2FF] text-[var(--dark-blue)] px-4 py-24 md:px-8">
      <div className="container mx-auto max-w-6xl"> {/* Increased max-width for the grid */}
        <h2 className="text-4xl font-bold text-center mb-16">
          Frequently Asked Questions
        </h2>
        
        {/* GRID CONFIGURATION:
            - grid-cols-1: Single column on mobile
            - lg:grid-cols-2: Two columns on large screens
            - items-start: Prevents items from stretching to match height of the row
        */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {faqItems.map((faq, index) => (
            <div 
              key={index} 
              className={`overflow-hidden rounded-2xl bg-white shadow-sm transition-all duration-300 border-2 ${
                activeFaq === index ? "border-blue-500 shadow-md" : "border-transparent"
              }`}
            >
              {/* Trigger Button */}
              <button
                onClick={() => toggleFaq(index)}
                className="flex w-full items-center justify-between px-6 py-5 text-left transition-colors"
              >
                <span className={`text-lg font-semibold leading-tight ${
                  activeFaq === index ? "text-blue-600" : "text-[var(--dark-blue)]"
                }`}>
                  {faq.question}
                </span>
                <span className={`ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current transition-transform duration-300 ${
                  activeFaq === index ? "bg-blue-600 text-white border-blue-600 rotate-180" : "text-gray-400"
                }`}>
                  {activeFaq === index ? "−" : "+"}
                </span>
              </button>

              {/* Collapsible Content */}
              <div
                className={`transition-all duration-300 ease-in-out ${
                  activeFaq === index 
                    ? "max-h-[500px] opacity-100 pb-6 px-6" 
                    : "max-h-0 opacity-0 pb-0 px-6"
                }`}
              >
                <div className="border-t border-gray-100 pt-4 text-gray-600 text-sm md:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
          

          <section className="relative overflow-hidden bg-[#EEF2FF] text-[var(--dark-blue)] px-4 py-24 md:px-8">
            <div className="rounded-[48px] bg-gradient-to-b from-[#7393B3]/20 to-[#708090]/40 p-8 text-center text-[var(--dark-blue)] mx-auto max-w-2xl shadow-2xl">
                <h3 className="text-2xl font-semibold">Still have questions?</h3>
                  <p className="mt-3 text-sm text-[var(--dark-blue)]/70">
                    Can’t find the answer you’re looking for? Contact us directly and we will get back to you as soon as
                    possible.
                  </p>
                  <Link
                    href="/contact"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--brand-color-2)]"
                  >
                    Contact us
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="M13 5l7 7-7 7" />
                    </svg>
                  </Link>
              </div>
          </section>
    </main>
  );
};