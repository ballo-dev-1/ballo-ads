import Link from "next/link";
import Image from "next/image";
import ring from "@/public/Assets/8.png";
import phoneAnalytics from "@/public/Assets/37.png";
import statsBoard from "@/public/elements small/stats-chart.png";
import marketAnalysis from "@/public/Assets/38.png";

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
        <div className="absolute inset-0">
          <Image
            src={ring}
            alt="Circles Ring"
            width={1600}
            height={1900}
            className="w-full h-auto absolute right-0 -top-150 scale-[0.5]"
            priority
          />
        </div>

        <div className="relative container mx-auto flex flex-col items-center gap-10 text-center max-w-4xl z-10">
          <span className="rounded-full bg-white/60 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand-color-2)]">
            How It Works
          </span>
        <div className="glitch-text">
          <h1 className="text-4xl font-bold leading-tight text-[var(--dark-blue)] md:text-6xl">
            Seamless Marketing and Ad Automation in one Platform
          </h1>
        </div>
          <p className="max-w-2xl text-base text-[var(--dark-blue)]/70 md:text-lg">
            Effortlessly streamline your marketing and sales with an all-in-one platform designed to automate
            workflows, boost conversions, and drive business growth.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition]"
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
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-[var(--brand-color-1)] transition bg-white"
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
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[var(--brand-color-2)]/30" />

            <div className="grid gap-y-20 md:grid-cols-2 md:gap-x-20">
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
                      className={`relative max-w-xs rounded-[28px] bg-white p-8 shadow-lx border border-[var(--brand-color-2)]/10 transition hover:-translate-y-1 hover:shadow-2xl  ${
                        isLeft ? "md:ml-20" : "md:mr-20"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-color-1)] text-4xl font-extrabold text-white shadow-lg">
                          {step.number}
                        </span>
                        <div className="flex flex-col gap-2">
                          <h3 className="text-xl font-semibold text-[var(--dark-blue)] leading-snug">
                            {step.title}
                          </h3>
                          <p className="text-sm text-[var(--dark-blue)]/70">
                            {step.description}
                          </p>
                        </div>
                      </div>
                      <span className={`pointer-events-none absolute top-1/2 hidden h-[1px] w-16 bg-[var(--brand-color-2)]/30 md:block ${
                        isLeft ? "right-full" : "left-full"}`} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-24 flex flex-col items-center gap-12 md:flex-row md:justify-center">
              <div className="relative">
                <div className="absolute inset-8 rounded-[40px] bg-[var(--brand-color-1)]/10 blur-3xl"/>
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
              <div className="absolute inset-8 rounded-[40px] bg-[var(--brand-color-1)]/10 blur-3xl"/>
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
                <div className="h-full rounded-[30px] bg-[var(--brand-color-1)] p-6">
                  <h4 className="text-xl font-bold text-white">
                    {benefit.title}
                  </h4>
                  <p className="mt-3 text-sm text-white">
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


