"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import article1 from "@/public/elements small/1.png";
import article2 from "@/public/elements small/2.png";
import article3 from "@/public/elements small/3.png";
import article4 from "@/public/elements small/4.png";
import article5 from "@/public/elements small/5.png";
import article6 from "@/public/elements small/6.png";
import article7 from "@/public/elements small/7.png";
import article8 from "@/public/elements small/8.png";
import article9 from "@/public/elements small/9.png";
import handshake from "@/public/elements small/handshake.png";
import strategy from "@/public/elements small/strategy.png";
import marketAnalysis from "@/public/elements small/market-analysis.png";
import contentIcon from "@/public/elements small/content-icon.png";

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
    image: handshake,
    featured: true,
  },
  {
    title: "Working From home remotely",
    image: article4,
    featured: false,
  },
  {
    title: "Big brands use marketing",
    image: article3,
    featured: false,
  },
  {
    title: "Lifestyle with Medicine",
    image: article5,
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
        image: handshake,
        hasVideo: true,
      },
      {
        title: "Get to know about Insurance",
        description:
          "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
        image: contentIcon,
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

const supportFeatures = [
  {
    title: "24/7 Support",
    description: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us.",
  },
  {
    title: "Quick Response Time",
    description: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us.",
  },
  {
    title: "Implementation and Support",
    description: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us.",
  },
  {
    title: "Free Training",
    description: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us.",
  },
  {
    title: "System Integration",
    description: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us.",
  },
  {
    title: "24/7 Support",
    description: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us.",
  },
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      {/* Featured Articles Carousel */}
      <section className="relative overflow-hidden px-4 py-12 md:px-8">
        <div className="container mx-auto">
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
            {featuredArticles.map((article, index) => (
              <div
                key={index}
                className={`relative min-w-[320px] md:min-w-[400px] flex-shrink-0 rounded-3xl overflow-hidden ${
                  article.featured ? "ring-2 ring-white/30" : ""
                }`}
              >
                <div className="relative h-64 md:h-80">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority={article.featured}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-xl font-bold mb-4">{article.title}</h3>
                    {article.featured && (
                      <Link
                        href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
                        className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2 text-sm font-semibold text-[var(--dark-blue)] transition hover:bg-white/90"
                      >
                        Read Article
                        <svg
                          className="w-4 h-4"
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search and Categories */}
      <section className="px-4 py-8 md:px-8">
        <div className="container mx-auto flex flex-col gap-6">
          <div className="relative max-w-2xl mx-auto w-full">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full bg-white/10 border border-white/20 px-6 py-4 pl-12 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
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

          <div className="flex flex-wrap items-center justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() =>
                  setSelectedCategory(selectedCategory === category ? null : category)
                }
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  selectedCategory === category
                    ? "bg-[var(--brand-color-1)] text-white"
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Article Sections */}
      {articleSections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="px-4 py-16 md:px-8">
          <div className="container mx-auto flex flex-col gap-8">
            <div className="flex flex-col gap-4 max-w-4xl">
              <h2 className="text-4xl md:text-5xl font-bold">{section.title}</h2>
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
      <section className="relative overflow-hidden px-4 py-24 md:px-8">
        <div className="absolute inset-0 -z-10">
          <div className="absolute bottom-0 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-white/10" />
          <div className="absolute bottom-0 left-1/2 h-[780px] w-[780px] -translate-x-1/2 rounded-full border border-white/10" />
        </div>

        <div className="container mx-auto flex flex-col gap-12">
          <div className="flex flex-col items-center gap-6 text-center">
            <h2 className="text-4xl md:text-5xl font-bold">Get more on what you like to see right here</h2>
            <button className="inline-flex items-center gap-2 rounded-full bg-white/10 border border-white/20 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition">
              Subscribe
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
            </button>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {supportFeatures.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/60">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12l4 4L19 6" />
                  </svg>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-white/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center gap-4 md:flex-row md:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[var(--brand-color-2)]"
            >
              Get Started
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
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
            >
              Contact us
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
        </div>
      </section>
    </main>
  );
}
