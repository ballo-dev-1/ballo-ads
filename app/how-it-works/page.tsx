import Link from "next/link";
import Image from "next/image";

import phoneAnalytics from "@/public/elements small/phone.png";
import statsBoard from "@/public/elements small/stats-chart.PNG";
import marketAnalysis from "@/public/elements small/market-analysis.png";

const steps = [
  {
    number: "1",
    title: "Sign Up & Get Verified",
    description: "Create an account and complete the quick KYC process.",
  },
  {
    number: "2",
    title: "Select Your Audience",
    description: "Choose from bulk messaging to precisely targeted ads.",
  },
  {
    number: "3",
    title: "Customise Your Campaign",
    description: "Craft engaging messages, set preferences, and launch.",
  },
  {
    number: "4",
    title: "Monitor & Optimise",
    description: "Use analytics to improve engagement and maximise conversions.",
  },
];

const benefits = [
  {
    title: "Seamless Integrations",
    description:
      "Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.",
  },
  {
    title: "Boost Productivity",
    description:
      "Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.",
  },
  {
    title: "Reduce Marketing Costs",
    description:
      "Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.",
  },
  {
    title: "Increase Lead Conversion",
    description:
      "Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.",
  },
  {
    title: "Gain Actionable Insights",
    description:
      "Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.",
  },
  {
    title: "Enjoy Enterprise-Grade Security",
    description:
      "Nostrud eu et tempor culpa ad sint sit eiusmod laboris eu occaecat esse sunt in exercitation.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="bg-[#EEF2FF] text-[var(--dark-blue)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 pb-24 pt-28 md:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-10 left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full border border-[var(--brand-color-4)]/30" />
          <div className="absolute top-10 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full border border-[var(--brand-color-3)]/20" />
          <div className="absolute top-10 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-[var(--brand-color-2)]/10" />
        </div>

        <div className="container mx-auto flex flex-col items-center gap-10 text-center max-w-4xl">
          <span className="rounded-full bg-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-color-2)]">
            How It Works
          </span>
          <h1 className="text-4xl font-bold leading-tight text-[var(--dark-blue)] md:text-6xl">
            Seamless Marketing and Ad Automation in one Platform
          </h1>
          <p className="max-w-2xl text-base text-[var(--dark-blue)]/70 md:text-lg">
            Effortlessly streamline your marketing and sales with an all-in-one platform designed to automate
            workflows, boost conversions, and drive business growth.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[var(--brand-color-2)]"
            >
              Get Started
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
            <Link
              href="/watch-demo"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-[var(--brand-color-1)] transition hover:bg-white"
            >
              Watch Demo
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
      </section>

      {/* Steps Section */}
      <section className="relative px-4 pb-24 md:px-8">
      <div className="container mx-auto">
          <div className="relative mx-auto max-w-5xl">
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 bg-gradient-to-b from-[var(--brand-color-2)]/20 via-[var(--brand-color-3)]/20 to-[var(--brand-color-4)]/20" />

            <div className="grid gap-y-12 md:grid-cols-2 md:gap-x-16">
              {steps.map((step, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={step.number}
                    className={`relative flex ${
                      isLeft ? "md:justify-end md:text-right" : "md:justify-start"
                    }`}
                  >
                    <div
                      className={`relative max-w-xs rounded-3xl bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl ${
                        isLeft ? "md:ml-auto" : ""
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--brand-color-1)] to-[var(--brand-color-3)] text-2xl font-bold text-white">
                          {step.number}
                        </span>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-lg font-semibold text-[var(--dark-blue)]">
                            {step.title}
                          </h3>
                          <p className="text-sm text-[var(--dark-blue)]/70">
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`pointer-events-none absolute top-1/2 hidden h-[1px] w-12 bg-gradient-to-r from-[var(--brand-color-1)]/40 to-transparent md:block ${
                          isLeft ? "right-full" : "left-full rotate-180"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-16 flex flex-col items-center gap-6 md:flex-row md:justify-center">
              <div className="relative">
                <div className="absolute inset-6 rounded-[40px] bg-gradient-to-tr from-[var(--brand-color-1)]/15 to-transparent blur-2xl" />
                <div className="relative rounded-[40px] bg-white p-6 shadow-xl">
                  <Image
                    src={phoneAnalytics}
                    alt="BalloAds analytics app"
                    width={220}
                    height={440}
                    className="mx-auto h-auto w-40 md:w-48"
                  />
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-6 rounded-[40px] bg-gradient-to-tr from-[var(--brand-color-2)]/15 to-transparent blur-2xl" />
                <div className="relative rounded-[40px] bg-white p-6 shadow-xl">
                  <Image
                    src={marketAnalysis}
                    alt="Audience selection interface"
                    width={220}
                    height={440}
                    className="mx-auto h-auto w-40 md:w-48"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Highlight + Benefits */}
      <section className="relative px-4 pb-28 md:px-8">
        <div className="container mx-auto flex flex-col gap-16">
          <div className="overflow-hidden rounded-[48px] bg-gradient-to-tr from-[#050C31] via-[#0F245C] to-[#1B3C9E] p-4 shadow-2xl">
            <div className="relative overflow-hidden rounded-[36px] bg-black/30">
              <Image
                src={statsBoard}
                alt="AI powered insights"
                width={1600}
                height={900}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-[32px] bg-gradient-to-br from-[#0F1F4C] via-[#133A7C] to-[#0A4ACB] p-[1px] shadow-lg"
              >
                <div className="h-full rounded-[30px] bg-white/95 p-6">
                  <h4 className="text-lg font-semibold text-[var(--brand-color-1)]">
                    {benefit.title}
                  </h4>
                  <p className="mt-3 text-sm text-[var(--dark-blue)]/70">
                    {benefit.description}
        </p>
      </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}


