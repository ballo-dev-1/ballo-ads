"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";

import article1 from "@/public/BalloAds Assets 2/19.png";
import article2 from "@/public/BalloAds Assets 2/8.png";
import article3 from "@/public/BalloAds Assets 2/2.png";
import article4 from "@/public/BalloAds Assets 2/18.png";
import article5 from "@/public/BalloAds Assets 2/3.png";
import article6 from "@/public/BalloAds Assets 2/7.png";
import article7 from "@/public/BalloAds Assets 2/10.png";
import article8 from "@/public/BalloAds Assets 2/11.png";
import article9 from "@/public/BalloAds Assets 2/22.png";
import handshake from "@/public/elements small/handshake.png";
import strategy from "@/public/BalloAds Assets 2/20.png";
import marketAnalysis from "@/public/BalloAds Assets 2/1.png";
import contentIcon from "@/public/elements small/content-icon.png";
import ring from "@/public/Assets/8.png";


export default function FeaturedCarousel() {

  const featuredArticles = [
    {
      title: "The latest on AI Technology",
      image: article1,
      featured: false,
    },
    {
      title: "You've heard about Teledoctor",
      image: article2,
      featured: false,
    },
    {
      title: "Get to know about Insurance",
      image: article3,
      featured: false,
    },
    {
      title: "Working From home remotely",
      image: article4,
      featured: false,
    },
    {
      title: "Big brands use marketing",
      image: article5,
      featured: false,
    },
    {
      title: "Lifestyle with Medicine",
      image: article6,
      featured: false,
    },
  ];
  
  const categories = [
    "Finance",
    "Retail",
    "Special Deals",
    "Popular",
    "Health",
    "AI",
    "Logistics",
  ];
  
  const articleSections = [
    {
      title: "Get the latest on AI in Zambia",
      description:
        "Zambia is making significant strides in artificial intelligence (AI) with the launch of its National AI Strategy (2024-2026), aiming to transform the nation into a digital economy. The strategy focuses on enhancing public services, fostering innovation, and creating jobs across sectors like healthcare, agriculture, and education.",
      articles: [
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article6,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article7,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article8,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article9,
          hasVideo: true,
        },
      ],
    },
    {
      title: "Ministry of Technology on AI",
      description:
        "The Ministry of Technology and Science is leading initiatives to integrate AI into government operations, improving efficiency and citizen services. Key projects include AI-powered healthcare diagnostics, smart agriculture systems, and educational technology platforms.",
      articles: [
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article8,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article9,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: strategy,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: marketAnalysis,
          hasVideo: true,
        },
      ],
    },
    {
      title: "The growth of Performance Marketing",
      description:
        "Performance marketing is revolutionizing how businesses reach their audiences in Zambia. With data-driven strategies and measurable results, companies are seeing unprecedented ROI from their marketing campaigns. Learn how BalloAds is at the forefront of this transformation.",
      articles: [
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article1,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article2,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article3,
          hasVideo: true,
        },
        {
          title: "Get to know about Insurance",
          description:
            "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
          image: article4,
          hasVideo: true,
        },
      ],
    },
  ];
  
  const supportHighlights = [
    {
      title: "24/7 Support",
      description: "Our team is available around the clock to ensure your campaigns run smoothly without downtime."
    },
    {
      title: "Quick Response Time",
      description: "We resolve issues and questions promptly so your business keeps moving without delays."
    },
    {
      title: "Implementation & Support",
      description: "We handle the full setup and provide continuous assistance to guarantee a seamless transition into our platform."
    },
    {
      title: "System Integration",
      description: "BalloAds integrates effortlessly with your existing tools and workflows for a unified, efficient marketing ecosystem."
    },
    {
      title: "Free Training",
      description: "Your team receives comprehensive onboarding and training at no extra cost to help you maximise every feature from day one."
    },
    {
      title: "Dedicated Account Manager",
      description: "A specialised expert is assigned to your business to offer personalised guidance and strategic support whenever you need it."
    },
  ];
  

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      <section className="relative overflow-hidden px-4 py-12 md:px-8">
      {/* Glow background */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" />
      </div>

      {/* Container */}
      <div className="relative w-full max-w-[1200px] h-[450px] mt-24 perspective mx-auto">
        <Swiper
          effect="coverflow"
          grabCursor
          centeredSlides
          loop
          slidesPerView="auto"
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 300,
            modifier: 1.5,
            slideShadows: false,
          }}
          navigation
          modules={[EffectCoverflow, Navigation, Autoplay]}
          className="swiper_container py-8"
        >
          {featuredArticles.map((article, index) => (
            <SwiperSlide
              key={index}
              className="w-[280px] md:w-[350px] max-w-[280px] md:max-w-[350px] h-[380px] overflow-visible flex justify-center"
            >
              <div
                className={`custom-card relative min-w-[280px] md:min-w-[350px] h-[420px] rounded-3xl overflow-hidden shadow-xl bg-white transition-all duration-1000`}
              >
                {/* Image */}
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover transition-transform duration-700"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                {/* Bottom Content */}
                <div className="absolute bottom-0 left-0 right-0 flex flex-col p-6">
                  <h3 className="mb-4 text-2xl md:text-3xl font-bold leading-tight text-white">
                    {article.title}
                  </h3>

                  {article.featured && (
                    <Link
                      href={`/blog/${article.title
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                      className="inline-flex items-center rounded-full bg-white px-6 py-2.5 text-sm font-bold text-gray-900 transition-colors hover:bg-gray-200"
                    >
                      Read Article
                      <svg
                        className="w-4 h-4 ml-2"
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
                  )}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>

      {/* Search and Categories */}
      <section className="px-4 py-8 md:px-8">
        <div className="container mx-auto flex flex-col gap-6">
          <div className="relative max-w-2xl mx-auto w-full">
            {/*<input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-white/10 border border-white/20 px-6 py-4 pl-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />*/}
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {/*<div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category ? null : category)
                }
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-white text-[var(--brand-color-1)]"
                    : "bg-white text-[var(--brand-color-1)] hover:bg-white"
                }`}
              >
                {category}
              </button>
            ))}
          </div> */}
        </div>
      </section>

      {/* Main Article Sections */}
      {articleSections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="px-4 py-16 md:px-8">
          <div className="container mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-4 max-w-4xl">
              <div className="glitch-text">
                <h2 className="text-4xl md:text-5xl font-bold">
                  {section.title}
                </h2>
              </div>
              <p className="text-base md:text-lg text-white/80 leading-relaxed">
                {section.description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {section.articles.map((article, articleIndex) => (
                <Link
                  key={articleIndex}
                  href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group relative flex flex-col rounded-2xl bg-white/5 overflow-hidden transition hover:bg-white/10"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                    {article.hasVideo && (
                      <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--dark-blue)] shadow-lg">
                        <svg
                          className="ml-1 h-6 w-6"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-4">
                    <h3 className="text-lg font-semibold line-clamp-2">{article.title}</h3>
                    <p className="text-sm text-white/70 line-clamp-3">{article.description}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Subscribe Section */}
      <section className="relative z-10 overflow-hidden bg-[#020A2A] text-white px-25 pb-28 pt-24">
          <div className="relative z-10 gap-8 lg:grid-cols-[1.3fr_1fr]">
            <div className="absolute inset-0">
              <Image
                src={ring}
                alt="Circles Ring"
                width={1600}
                height={1900}
                className="w-50px h-50px absolute left-0 -bottom-110 scale-[0.7] z-10"
                priority
              />
            </div>
            <div className="relative z-10 overflow-hidden">
                <h3 className="relative z-10 text-[38.4px] md:text-[40px] font-bold text-center">Learn more about how we can support your growth</h3>
                <div className="mt-10 grid gap-6 sm:grid-cols-2">
                  {supportHighlights.map((highlight) => (
                    <div key={highlight.title} className="flex gap-3">
                      <span className="relative z-10 mt-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/60">
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
                      <div className="relative z-10 flex flex-1 flex-col gap-4">
                        <div className="relative z-10">
                          <h3 className="relative z-10 text-[23px] md:text-[25px] font-semibold">{highlight.title}</h3>
                          <p className="relative z-10 mt-2 text-sm text-white/70">{highlight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              
              <div className="relative z-10 flex flex-col items-center gap-5 px-4 pb-28 pt-24 md:px-8 md:flex-row md:justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-color-2)]"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full border bg-white px-6 py-3 text-2remm font-semibold text-[var(--brand-color-1)] transition hover:border-white hover:bg-white/10"
                >
                  Contact us
                </Link>
              </div>  
            </div>          
          </div>
      </section>
    </main>
  );
}
