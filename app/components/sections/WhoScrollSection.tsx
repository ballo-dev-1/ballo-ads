"use client";

import React, { useRef } from "react";
import { StaticImageData } from "next/image";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  Building,
  Landmark,
  Globe,
  ShoppingCart,
  Heart,
  GraduationCap,
} from "lucide-react";

import building from "@/public/Assets/46.png";
import buildingFinance from "@/public/Assets/48.png";
import buildingNonprofit from "@/public/Assets/49.png";
import buildingRetail from "@/public/Assets/51.png";
import buildingHealthcare from "@/public/Assets/53.png";
import buildingEducation from "@/public/Assets/57.png";

const SpiralGallery = dynamic(
  () => import("../ui/SpiralGallery").then(m => m.SpiralGallery),
  { ssr: false }
);

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface UseCase {
  id: string;
  icon: React.ReactNode;
  text: string;
  subtext: string;
  image: StaticImageData;
}

const useCases: UseCase[] = [
  {
    id: "sme",
    icon: <Building className="w-6 h-6" />,
    text: "SMEs & Corporations",
    subtext: "Promote products, services, and offers.",
    image: building,
  },
  {
    id: "finance",
    icon: <Landmark className="w-6 h-6" />,
    text: "Financial Institutions",
    subtext: "Send loan approvals, transaction updates, and offers.",
    image: buildingFinance,
  },
  {
    id: "nonprofit",
    icon: <Globe className="w-6 h-6" />,
    text: "Nonprofits & Government Initiatives",
    subtext: "Spread awareness with mass communication.",
    image: buildingNonprofit,
  },
  {
    id: "retail",
    icon: <ShoppingCart className="w-6 h-6" />,
    text: "Retail & E-commerce",
    subtext: "Drive sales and customer engagement.",
    image: buildingRetail,
  },
  {
    id: "healthcare",
    icon: <Heart className="w-6 h-6" />,
    text: "Healthcare & Clinics",
    subtext: "Send appointment reminders and health campaigns.",
    image: buildingHealthcare,
  },
  {
    id: "education",
    icon: <GraduationCap className="w-6 h-6" />,
    text: "Education Institutions",
    subtext: "Notify students, parents, and staff with updates.",
    image: buildingEducation,
  },
];

export function WhoScrollSection() {
  const containerRef = useRef<HTMLElement>(null);
  const whoProgressRef = useRef(0);

  useGSAP(() => {
    const outer = containerRef.current;
    if (!outer) return;

    const stickyEl = outer.querySelector<HTMLElement>(".who-scroll-sticky");
    const listItems = Array.from(outer.querySelectorAll<HTMLElement>(".who-list-item"));
    if (!stickyEl || listItems.length === 0) return;

    const numItems = listItems.length;

    gsap.set(listItems, { opacity: 0.25 });
    gsap.set(listItems[0], { opacity: 1 });

    const tl = gsap.timeline();
    for (let i = 1; i < numItems; i++) {
      tl.to(listItems[i], { opacity: 1, duration: 0.5 });
    }

    ScrollTrigger.create({
      trigger: stickyEl,
      start: "top top",
      end: `+=${numItems * 100}vh`,
      pin: true,
      pinSpacing: true,
      animation: tl,
      scrub: 0.8,
      onUpdate: (self) => {
        whoProgressRef.current = self.progress;
      },
    });
  });

  return (
    <section ref={containerRef} className="who-scroll-outer">
      <div className="who-scroll-sticky">
        <div className="who-scroll-inner">
          <h2 className="who-scroll-heading-text">
            Who can use BalloAds?
          </h2>
          <div className="who-content-grid">
            <div className="who-left-list absolute">
              {useCases.map((item) => (
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
            <SpiralGallery progressRef={whoProgressRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
