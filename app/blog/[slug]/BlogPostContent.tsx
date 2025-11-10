"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import laptopImage from "@/public/elements small/4.png";
import article1 from "@/public/elements small/1.png";
import article2 from "@/public/elements small/2.png";
import article3 from "@/public/elements small/3.png";
import article5 from "@/public/elements small/5.png";
import article6 from "@/public/elements small/6.png";
import article7 from "@/public/elements small/7.png";
import handshake from "@/public/elements small/handshake.png";
import strategy from "@/public/elements small/strategy.png";
import marketAnalysis from "@/public/elements small/market-analysis.png";
import contentIcon from "@/public/elements small/content-icon.png";
import balloBot from "@/public/elements small/ballo-bot.png";

const articleData = {
  title: "Working from home: What does it mean for marketing?",
  author: {
    name: "George M'sapenda",
    role: "Freelance Writer",
    avatar: balloBot,
  },
  date: "18th April, 2025",
  tags: ["Finance", "Popular", "Retail"],
  heroImage: laptopImage,
  content: [
    "The shift to remote work has fundamentally transformed how marketing teams operate, collaborate, and engage with their audiences. As companies adapt to distributed workforces, marketing strategies have evolved to reflect new communication patterns, consumer behaviors, and digital-first approaches.",
    "Remote work has changed the way marketing teams collaborate. Virtual meetings, cloud-based tools, and asynchronous communication have become the norm. This shift has also influenced the tone and style of marketing content, with brands adopting more authentic, human-centered messaging that resonates with audiences navigating similar remote work experiences.",
    "The marketing landscape has seen a significant pivot towards digital channels. Email marketing, social media engagement, and content marketing have gained prominence as traditional in-person events and face-to-face interactions became limited. Marketers are now leveraging data analytics and automation tools to maintain engagement and measure campaign effectiveness in this new environment.",
    "Consumer behavior has also shifted, with increased reliance on e-commerce, digital services, and online research. Marketing strategies must now account for longer decision-making cycles, increased price sensitivity, and a preference for contactless interactions. Brands that successfully adapt to these changes are seeing improved customer loyalty and engagement.",
  ],
};

const relatedArticles = [
  {
    title: "Working from home: What does it mean for marketing?",
    author: "By George M'sapenda",
  },
  {
    title: "Working from home: What does it mean for marketing?",
    author: "By George M'sapenda",
  },
  {
    title: "Working from home: What does it mean for marketing?",
    author: "By George M'sapenda",
  },
  {
    title: "Working from home: What does it mean for marketing?",
    author: "By George M'sapenda",
  },
];

const promotionalArticle = {
  title: "Get to know about Insurance",
  description:
    "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...",
  image: handshake,
};

const mostViewedArticles = [
  { title: "Get to know about Insurance", description: "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...", image: laptopImage },
  { title: "Get to know about Insurance", description: "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...", image: article2 },
  { title: "Get to know about Insurance", description: "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...", image: handshake },
  { title: "Get to know about Insurance", description: "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...", image: article3 },
  { title: "Get to know about Insurance", description: "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...", image: article5 },
  { title: "Get to know about Insurance", description: "Zambia's collaboration with UNESCO to assess AI readiness and participation in global AI ethics...", image: article6 },
];

const comments = [
  {
    author: "George M'sapenda",
    avatar: balloBot,
    timeAgo: "2h ago",
    text: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us naan c j c. jd. mc,cmdn x n n. Above all, we value your needs. We are available for you any day, and any time you need to speak to us naan c j c. jd. mc.cmdn x n n",
  },
  {
    author: "George M'sapenda",
    avatar: balloBot,
    timeAgo: "2h ago",
    text: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us naan c j c. jd. mc,cmdn x n n. Above all, we value your needs. We are available for you any day, and any time you need to speak to us naan c j c. jd. mc.cmdn x n n",
  },
  {
    author: "George M'sapenda",
    avatar: balloBot,
    timeAgo: "2h ago",
    text: "Above all, we value your needs. We are available for you any day, and any time you need to speak to us naan c j c. jd. mc,cmdn x n n. Above all, we value your needs. We are available for you any day, and any time you need to speak to us naan c j c. jd. mc.cmdn x n n",
  },
];

// Chart data for the embedded chart
const chartData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
  datasets: [
    { values: [20, 35, 45, 55, 65, 75], color: "#3fdbff" },
    { values: [15, 30, 40, 50, 60, 70], color: "#2273af" },
    { values: [10, 25, 35, 45, 55, 65], color: "#0b4d8c" },
  ],
};

export default function BlogPostContent({ slug }: { slug: string }) {
  const [likes, setLikes] = useState(0);
  const [commentCount, setCommentCount] = useState(comments.length);

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white">
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
          {/* Main Article Content */}
          <article className="flex flex-col gap-8">
            {/* Hero Banner */}
            <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src={articleData.heroImage}
                alt={articleData.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{articleData.title}</h1>
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-white/30">
                    <Image
                      src={articleData.author.avatar}
                      alt={articleData.author.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{articleData.author.name}</span>
                    <span className="text-sm text-white/80">{articleData.author.role}</span>
                  </div>
                  <span className="ml-auto text-sm text-white/70">{articleData.date}</span>
                </div>
              </div>
            </div>

            {/* Article Tags */}
            <div className="flex flex-wrap gap-3 justify-end">
              {articleData.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-[var(--brand-color-1)] px-4 py-2 text-sm font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Article Content */}
            <div className="flex flex-col gap-6 text-white/90 leading-relaxed">
              {articleData.content.map((paragraph, index) => (
                <p key={index} className="text-base md:text-lg">
                  {paragraph}
                </p>
              ))}

              {/* Embedded Chart */}
              <div className="my-8 rounded-2xl bg-[var(--dark-blue-2)] p-6 border border-white/10">
                <div className="h-64 w-full relative">
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="chart-grid" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
                      </linearGradient>
                    </defs>
                    <rect x="0" y="0" width="100" height="100" fill="url(#chart-grid)" />
                    {/* Grid lines */}
                    {[0, 25, 50, 75, 100].map((y) => (
                      <line
                        key={y}
                        x1="0"
                        x2="100"
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="0.5"
                      />
                    ))}
                    {/* Data lines */}
                    {chartData.datasets.map((dataset, idx) => {
                      const points = dataset.values
                        .map((value, i) => {
                          const x = (i / (dataset.values.length - 1)) * 100;
                          const y = 100 - (value / 100) * 100;
                          return `${x},${y}`;
                        })
                        .join(" ");
                      return (
                        <polyline
                          key={idx}
                          points={points}
                          fill="none"
                          stroke={dataset.color}
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      );
                    })}
                  </svg>
                </div>
              </div>
            </div>

            {/* Interaction Icons */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <button
                onClick={() => setLikes((prev) => prev + 1)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                  />
                </svg>
                <span>{likes}</span>
              </button>
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{commentCount}</span>
              </button>
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
                <span>Share</span>
              </button>
            </div>

            {/* Comments Section */}
            <section className="flex flex-col gap-6 pt-8 border-t border-white/10">
              <h2 className="text-2xl md:text-3xl font-bold">Comments</h2>
              <div className="flex flex-col gap-6">
                {comments.map((comment, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border-2 border-white/20">
                      <Image
                        src={comment.avatar}
                        alt={comment.author}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">{comment.author}</span>
                        <span className="text-sm text-white/60">{comment.timeAgo}</span>
                      </div>
                      <p className="text-white/80 leading-relaxed">{comment.text}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                            />
                          </svg>
                          Like
                        </button>
                        <button className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                            />
                          </svg>
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </article>

          {/* Sidebar */}
          <aside className="flex flex-col gap-8">
            {/* Related Articles */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold">Related Articles</h2>
              <div className="flex flex-col gap-4">
                {relatedArticles.map((article, index) => (
                  <Link
                    key={index}
                    href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="flex items-center justify-between gap-4 rounded-xl bg-white/5 p-4 hover:bg-white/10 transition"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1 line-clamp-2">{article.title}</h3>
                      <p className="text-sm text-white/70">{article.author}</p>
                    </div>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                      <svg
                        className="h-5 w-5"
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
                    </div>
                  </Link>
                ))}
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-sm font-semibold hover:bg-white/20 transition"
              >
                View all
              </Link>
            </div>

            {/* Promotional Card */}
            <Link
              href="/blog/get-to-know-about-insurance"
              className="group relative flex flex-col rounded-2xl bg-white/5 overflow-hidden hover:bg-white/10 transition"
            >
              <div className="relative h-48">
                <Image
                  src={promotionalArticle.image}
                  alt={promotionalArticle.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--dark-blue)] shadow-lg">
                  <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-4">
                <h3 className="font-semibold">{promotionalArticle.title}</h3>
                <p className="text-sm text-white/70 line-clamp-2">{promotionalArticle.description}</p>
              </div>
            </Link>

            {/* Most Viewed */}
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-bold">Most Viewed</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                {mostViewedArticles.map((article, index) => (
                  <Link
                    key={index}
                    href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
                    className="group relative flex flex-col rounded-xl bg-white/5 overflow-hidden hover:bg-white/10 transition"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[var(--dark-blue)] shadow-lg">
                        <svg className="ml-1 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 p-3">
                      <h3 className="text-sm font-semibold line-clamp-1">{article.title}</h3>
                      <p className="text-xs text-white/70 line-clamp-2">{article.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Most Viewed Section (Full Width Below) */}
        <section className="mt-16 flex flex-col gap-8">
          <h2 className="text-3xl md:text-4xl font-bold">Most Viewed</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mostViewedArticles.map((article, index) => (
              <Link
                key={index}
                href={`/blog/${article.title.toLowerCase().replace(/\s+/g, "-")}`}
                className="group relative flex flex-col rounded-2xl bg-white/5 overflow-hidden hover:bg-white/10 transition"
              >
                <div className="relative aspect-video">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-[var(--dark-blue)] shadow-lg">
                    <svg className="ml-1 h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col gap-2 p-4">
                  <h3 className="font-semibold line-clamp-1">{article.title}</h3>
                  <p className="text-sm text-white/70 line-clamp-3">{article.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <div className="mt-16 flex flex-col items-center gap-4 md:flex-row md:justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-[var(--brand-color-2)]"
          >
            Get Started
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          <Link
            href="/subscribe"
            className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 bg-transparent px-8 py-4 text-base font-semibold text-white transition hover:border-white hover:bg-white/10"
          >
            Subscribe
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    </main>
  );
}

