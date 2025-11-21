"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import personSmile from "@/public/Assets/12.png";
import pushNotifications from "@/public/Assets/10.png";
import analyticsTile from "@/public/Assets/38.png";
import smsTile from "@/public/Assets/44.png";
import uploadContacts from "@/public/Assets/14.png";
import whatsappTile from "@/public/Assets/11.png";
import aiBoard from "@/public/elements small/stats-chart.png";
import bankingImage from "@/public/elements small/handshake.png";
import retailImage from "@/public/elements small/strategy.png";
import transportImage from "@/public/elements small/market-analysis.png";
import healthcareImage from "@/public/elements small/content-icon.png";

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
    question: "How do I create an account on BalloAds?",
    answer:
      "Visit our homepage, click ‘Sign Up’, complete your details, and verify your account.",
  },
  {
    question: "How can I upload my contact lists?",
    answer:
      "Upload CSV or Excel files directly from the dashboard, or integrate through our CRM connectors.",
  },
  {
    question: "Can I automate my campaigns?",
    answer:
      "Yes. Use workflow templates to schedule messages, set triggers, and personalise content at scale.",
  },
  {
    question: "Is there support available when I get stuck?",
    answer:
      "Our customer success team is available 24/7 via live chat, email, or phone to assist you.",
  },
  {
    question: "Do you provide analytics?",
    answer:
      "Track open rates, clicks, conversions, and revenue impact from the analytics dashboard in real time.",
  },
  {
    question: "What channels are supported?",
    answer:
      "BalloAds currently supports SMS, Email, WhatsApp, Push Notifications, and social messaging.",
  },
];

const professionalServices = [
  {
    title: "Banking & Financial Services",
    description: "Promote products, services, and offers.",
    image: bankingImage,
  },
  {
    title: "Retail & Ecommerce",
    description: "Promote products, services, and offers.",
    image: retailImage,
  },
  {
    title: "Transport & Logistics",
    description: "Promote products, services, and offers.",
    image: transportImage,
  },
  {
    title: "Healthcare Services",
    description: "Promote products, services, and offers.",
    image: healthcareImage,
  },
  {
    title: "Banking & Financial Services",
    description: "Promote products, services, and offers.",
    image: bankingImage,
  },
];

const supportHighlights = [
  "24/7 Support",
  "Free Training",
  "Quick Response Time",
  "System Integration",
  "Implementation and Support",
  "Dedicated Success Manager",
];

export default function ResourcesPage() {
  const [activeFaq, setActiveFaq] = useState(0);

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
            <span className="rounded-full bg-white/10 px-6 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
              FAQs
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-4xl font-bold md:text-5xl">Got any questions? We’ve got the answers</h2>
              <p className="max-w-2xl text-sm text-white/70 md:text-base">
                Browse through common questions from the BalloAds community. Switch categories to explore more
                step-by-step guides.
              </p>
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

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="flex flex-col gap-4">
              {faqItems.map((faq, index) => (
                <button
                  key={`faq-trigger-${faq.question}`}
                  onClick={() => setActiveFaq(index)}
                  className={`flex items-center justify-between rounded-full px-6 py-4 text-left text-sm font-semibold transition ${
                    activeFaq === index
                      ? "bg-white text-[var(--dark-blue)] shadow-xl"
                      : "bg-white/10 text-white/90 hover:bg-white/20"
                  }`}
                >
                  {faq.question}
                  <span className="ml-4 flex h-9 w-9 items-center justify-center rounded-full border border-current">
                    {activeFaq === index ? "−" : "+"}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-[32px] bg-white p-8 text-[var(--dark-blue)] shadow-2xl">
                <h3 className="text-xl font-semibold">
                  {faqItems[activeFaq]?.question ?? faqItems[0].question}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--dark-blue)]/70">
                  {faqItems[activeFaq]?.answer ?? faqItems[0].answer}
                </p>
              </div>

              <div className="rounded-[48px] bg-gradient-to-b from-white/80 to-white/60 p-8 text-center text-[var(--dark-blue)] shadow-2xl">
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
            </div>
          </div>
        </div>
      </section>

      {/* Professional Services Section */}
      <section className="relative overflow-hidden bg-[#020A2A] text-white px-4 pb-28 pt-24 md:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-12 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-white/10" />
          <div className="absolute top-12 left-1/2 h-[780px] w-[780px] -translate-x-1/2 rounded-full border border-white/10" />
        </div>

        <div className="container mx-auto flex flex-col gap-16">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em]">
              Professional Services
            </span>
            <div>
              <h2 className="text-4xl font-bold md:text-5xl">How can BalloAds benefit you?</h2>
              <p className="mt-2 text-base text-white/70">Rebranding the future starts here</p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {professionalServices.map((service, index) => (
              <div
                key={`${service.title}-${index}`}
                className="flex flex-col gap-6 rounded-[28px] border border-white/10 bg-white/5 p-6 transition hover:border-white/20 md:flex-row md:items-center"
              >
                <div className="flex w-full max-w-[260px] shrink-0 items-center justify-center rounded-[24px] bg-white/10 p-4">
                  <Image
                    src={service.image}
                    alt={service.title}
                    width={220}
                    height={140}
                    className="h-28 w-auto object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-4">
                  <div>
                    <h3 className="text-2xl font-semibold">{service.title}</h3>
                    <p className="mt-2 text-sm text-white/70">{service.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="ml-auto inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/40 text-white transition hover:border-white hover:bg-white/10"
                  aria-label={`Toggle details for ${service.title}`}
                >
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="relative overflow-hidden rounded-[48px] bg-gradient-to-br from-[#0F1F4C] via-[#133A7C] to-[#0A4ACB] p-[2px]">
              <div className="rounded-[46px] bg-[#01041A] p-12">
                <h3 className="text-3xl font-semibold">Learn more about how we can support your growth</h3>
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  {supportHighlights.map((highlight) => (
                    <div key={highlight} className="flex gap-3">
                      <span className="mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/60">
                        <svg
                          className="h-3 w-3"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12l4 4L19 6" />
                        </svg>
                      </span>
                      <div className="text-sm text-white/80">{highlight}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 rounded-[32px] bg-white/10 p-10 text-center">
              <div className="space-y-4">
                <Image
                  src={aiBoard}
                  alt="AI powered assistance"
                  width={260}
                  height={200}
                  className="mx-auto h-auto w-40 object-contain"
                />
                <p className="text-sm text-white/70">
                  Our consultants combine industry expertise with automation best practices to build campaigns that
                  convert.
        </p>
      </div>
              <div className="flex flex-col items-center gap-3 md:flex-row md:justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-color-2)]"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/10"
                >
                  Contact us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}


