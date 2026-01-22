"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Rocket, 
  FileCode, 
  Building2, 
  Users, 
  ShoppingCart, 
  Megaphone, 
  Tags, 
  CreditCard,
  ThumbsUp, 
  ThumbsDown,
  Download
} from "lucide-react";
import clsx from "clsx";
import Image from "next/image";
import ringImage from "@/public/Assets/9.png";

// --- 1. CONFIGURATION: Left Sidebar Data ---
const LEFT_MENU_ITEMS = [
    { name: "Overview", href: "#", icon: LayoutDashboard, active: true },
    { name: "Getting Started", href: "/api/getting-started", icon: Rocket, active: false },
    { name: "API Reference", href: "/api/api-reference", icon: FileCode, active: false },
    { name: "Company Management", href: "/api/company-management", icon: Building2, active: false },
    { name: "Client Subscriptions", href: "/api/client-subscription", icon: Users, active: false },
    { name: "Purchase Orders", href: "/api/purchase-orders", icon: ShoppingCart, active: false },
    { name: "Campaign Management", href: "/api/campaign-management", icon: Megaphone, active: false },
    { name: "Pricing Models", href: "/api/pricing-models", icon: Tags, active: false },
    { name: "Payment Integration", href: "/api/payment-intergration", icon: CreditCard, active: false },
];

// --- 2. CONFIGURATION: Right Sidebar Data (Table of Contents) ---
const RIGHT_MENU_ITEMS = [
  { id: "overview", label: "Overview" },
  { id: "key-features", label: "Key Features" },
  { id: "campaign-management", label: "Campaign Management" },
  { id: "company-management", label: "Company & Client Mgmt" },
  { id: "billing", label: "Purchase Orders & Billing" },
  { id: "security", label: "Security & Authentication" },
];

// --- 3. COMPONENT: Left Sidebar ---
const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-72 bg-[#050f36]/80 backdrop-blur-xl py-20 border-r border-white/5 h-screen sticky top-0 shrink-0 overflow-y-auto z-20">
      <div className="p-8">
        <h1 className="text-2xl font-bold text-white tracking-wide flex items-center gap-2">
          BalloAds <span className="font-light opacity-70 text-lg">API</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {LEFT_MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-5 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden",
                item.active
                  ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/20"
                  : "text-blue-100/60 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={20} className={clsx(item.active ? "text-white" : "text-blue-300/80 group-hover:text-white transition-colors")} />
              <span className="text-sm font-medium tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-6 mt-auto">
        <a 
          href="/public/Assets/BalloAPI.docx" // 1. Path to your file in the 'public' folder
          download="BalloAPI.docx" // 2. The name the user sees when saving
          className="group flex items-center gap-3 bg-blue-900/20 hover:bg-blue-600/20 p-4 rounded-2xl border border-white/5 hover:border-blue-400/30 transition-all duration-300 w-full cursor-pointer"
        >
          {/* Icon with background circle */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/20 group-hover:bg-blue-500 text-blue-300 group-hover:text-white transition-colors shrink-0">
            <Download size={16} />
          </div>

          {/* Text Content */}
          <div className="flex flex-col min-w-0"> {/* min-w-0 is key for text truncation responsiveness */}
            <span className="text-xs font-semibold text-white group-hover:text-blue-200 transition-colors truncate">
              Download Docs
            </span>
            <span className="text-[10px] text-blue-200/50 group-hover:text-blue-200/80 uppercase tracking-wider truncate">
              v2.4.0 
            </span>
          </div>
        </a>
      </div>

    </aside>
  );
};

// --- 4. COMPONENT: Right Sidebar (Table of Contents) ---
const TableOfContents = () => {
  const [activeId, setActiveId] = useState("overview");

  // Scroll Spy Logic: Detects which section is currently on screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px" } // Trigger when element is near top of screen
    );

    RIGHT_MENU_ITEMS.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      // Smooth scroll with offset for sticky headers if you have any
      const y = element.getBoundingClientRect().top + window.scrollY - 40;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <aside className="hidden xl:block w-64 sticky py-50 top-10 h-fit pl-8 border-l border-white/10 ml-8">
      <h4 className="text-sm font-semibold text-white/90 mb-4 uppercase tracking-wider">On this page</h4>
      <nav className="space-y-1">
        {RIGHT_MENU_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={clsx(
              "text-sm py-1.5 block text-left transition-all duration-300 border-l-2 pl-4",
              activeId === item.id
                ? "border-blue-400 text-white font-medium"
                : "border-transparent text-blue-200/40 hover:text-blue-200 hover:border-blue-200/30"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

// --- 5. COMPONENT: Feedback Buttons ---
const FeedbackButtons = () => {
  const [feedback, setFeedback] = useState<boolean | null>(null);

  return (
    <div className="mt-20 pt-10 border-t border-white/10">
      <h3 className="text-lg font-bold text-white mb-6">
        Was this information helpful?
      </h3>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setFeedback(true)}
          className={clsx(
            "flex items-center gap-2 px-8 py-2.5 rounded-full border transition-all duration-300",
            feedback === true
              ? "bg-white text-blue-900 border-white font-bold scale-105"
              : "bg-transparent text-white border-white/30 hover:bg-white/10"
          )}
        >
          <ThumbsUp size={16} fill={feedback === true ? "currentColor" : "none"} />
          Yes
        </button>

        <button
          onClick={() => setFeedback(false)}
          className={clsx(
            "flex items-center gap-2 px-8 py-2.5 rounded-full border transition-all duration-300",
            feedback === false
              ? "bg-white text-blue-900 border-white font-bold scale-105"
              : "bg-transparent text-white border-white/30 hover:bg-white/10"
          )}
        >
          <ThumbsDown size={16} fill={feedback === false ? "currentColor" : "none"} />
          No
        </button>
      </div>

      {feedback !== null && (
        <p className="mt-4 text-green-400 text-sm animate-pulse">
          Thanks for your feedback!
        </p>
      )}
    </div>
  );
};

// --- 6. MAIN PAGE LAYOUT ---
export default function BalloAdsDocumentation() {
  return (
    // Root Container
    <div className="flex min-h-screen w-full bg-[#020B2D] text-slate-200 selection:bg-blue-500/30">
      
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Wrapper */}
      <main className="flex-1 h-full py-20 min-h-screen relative">
        
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
            <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[20%] left-[20%] w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px]" />
        </div>

        {/* 3. Content Grid (Content Left + TOC Right) */}
        <div className="relative z-10 px-6 py-12 md:px-12 max-w-[1600px] mx-auto flex items-start">
          
          {/* A. The Readable Content Column */}
          <div className="flex-1 min-w-0"> {/* min-w-0 prevents flex child from overflowing */}
            
            {/* Decorative Rings - Image Version */}
            <div className="flex -space-x-6 opacity-40 mb-10 pl-2 items-center">
                {/* We keep the map loop to repeat it 6 times */}
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    // We use a wrapper div to define the exact size (w-20 h-20 = 80px)
                    // shrink-0 ensures the flex container doesn't squish them
                    <div key={i} className="relative w-40 h-40 shrink-0">
                    <Image
                        src={ringImage} // <--- Replace with your actual image variable name
                        alt="Decorative ring"
                        fill // This makes the image fill the w-20 h-20 parent
                        className="object-contain pointer-events-none scale-[2]" // Ensures the whole ring is visible without stretching
                        sizes="(max-width: 768px) 80px, 80px" // Performance optimization
                    />
                    </div>
                ))}
            </div>

            {/* SECTION: Overview */}
            <section id="overview" className="scroll-mt-24 mb-16">
              <h1 className="text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-300/50 uppercase drop-shadow-sm mb-6">
                Overview
              </h1>
              <p className="text-lg md:text-xl text-white leading-relaxed font-light">
                <span className="font-medium">BalloAds</span> is a powerful multi-channel advertising and 
                messaging platform that enables businesses to create, manage, and execute marketing campaigns across 
                SMS, WhatsApp, and Email channels. Built with <span className="text-blue-300">.NET</span> and <span className="text-blue-300">PostgreSQL</span>, 
                BalloAds provides a comprehensive API for managing companies, campaigns, purchase orders, and client subscriptions.
              </p>
            </section>

            {/* SECTION: Key Features */}
            <section id="key-features" className="scroll-mt-24 mb-16 space-y-8">
              <h2 className="text-4xl font-bold text-white tracking-wide border-b border-white/10 pb-4 inline-block">
                KEY FEATURES
              </h2>
              
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold text-white">Multi-Channel Messaging</h3>
                <ul className="space-y-3 text-white text-lg">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span><strong className="text-white font-semibold">SMS Campaigns:</strong> Send bulk SMS messages to your target audience.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span><strong className="text-white font-semibold">WhatsApp Messaging:</strong> Reach customers through WhatsApp with rich media support.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span><strong className="text-white font-semibold">Email Campaigns:</strong> Deliver personalized email marketing campaigns.</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* SECTION: Campaign Management */}
            <section id="campaign-management" className="scroll-mt-24 mb-16 space-y-6">
               <h3 className="text-2xl font-semibold text-white">Campaign Management</h3>
                <ul className="space-y-3 text-white text-lg">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Create and manage advertising campaigns with flexible scheduling.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Support for multiple campaign purposes: SMS Ads, Leads, Competitions.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Real-time campaign logs and analytics.</span>
                  </li>
                </ul>
            </section>

            {/* SECTION: Company Management */}
            <section id="company-management" className="scroll-mt-24 mb-16 space-y-6">
               <h3 className="text-2xl font-semibold text-white">Company & Client Management</h3>
                <ul className="space-y-3 text-white text-lg">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Company profile management with logo and social media integration.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Client subscription management and role-based access.</span>
                  </li>
                </ul>
            </section>

            {/* SECTION: Billing */}
            <section id="billing" className="scroll-mt-24 mb-16 space-y-6">
               <h3 className="text-2xl font-semibold text-white">Purchase Orders & Billing</h3>
                <ul className="space-y-3 text-blue-white text-lg">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Flexible purchase order system for message credits.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Pricing models based on message volume thresholds.</span>
                  </li>
                </ul>
            </section>

             {/* SECTION: Security */}
             <section id="security" className="scroll-mt-24 mb-16 space-y-6">
               <h3 className="text-2xl font-semibold text-white">Security & Authentication</h3>
                <ul className="space-y-3 text-white text-lg">
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>JWT-based authentication and Email verification system.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-2 w-1.5 h-1.5 bg-white rounded-full shrink-0" />
                    <span>Secure API endpoints with company-level access control.</span>
                  </li>
                </ul>
            </section>

            {/* Feedback Footer */}
            <FeedbackButtons />
            <div className="h-40" />
          </div>

          {/* B. The Right Sidebar (Table of Contents) */}
          <TableOfContents />

        </div>
      </main>
    </div>
  );
}