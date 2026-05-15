"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

import phoneFrame from "@/public/Assets/phone-frame.png";
import analyticsDashImg from "@/public/Assets/analytics-D8Ni1S4n.png";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const features = [
  { title: "AI-Powered Targeting", desc: "Get your message in front of the right audience at the right time." },
  { title: "Bulk & Personalised Messaging", desc: "Scale up your outreach while keeping it personal." },
  { title: "Real-Time Analytics", desc: "Track campaign performance and optimise results." },
  { title: "User-Friendly Dashboard", desc: "Manage all your campaigns in one place." },
  { title: "Affordable & Scalable", desc: "Flexible pricing that grows with your business." },
];

export function WhyScrollSection() {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const outer = containerRef.current;
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

  return (
    <section ref={containerRef} className="why-scroll-outer">
      <div className="why-scroll-sticky">
        <div className="why-scroll-inner">
          <div className="why-scroll-heading">
            <h2 className="text-4xl md:text-8xl font-black text-gradient-silver leading-tight tracking-tight">
              Why<br />Choose<br />BalloAds?
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

          <div className="why-right-area">
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
            <div className="why-phone-wrapper">
              <ul className="why-scroll-items" style={{ "--count": 5 } as React.CSSProperties}>
                {features.map((feature, i) => (
                  <li key={i} className="why-scroll-item" style={{ "--i": i } as React.CSSProperties}>
                    <span className="why-scroll-item-num">0{i + 1}</span>
                    <h3 className="why-scroll-item-title">{feature.title}</h3>
                    <p className="why-scroll-item-desc">{feature.desc}</p>
                  </li>
                ))}
              </ul>
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
  );
}
