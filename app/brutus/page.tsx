"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ring from '@/public/elements small/15.png';
import phone from '@/public/Assets/4.png';
import world from '@/public/BalloAds Assets 2/BalloAds Assets 2.png'


interface SlideData {
  category: string;
  title: string;
  imageUrl: string;
  icon: React.ReactNode;
}

const slides: SlideData[] = [
  {
    category: "Meet Brutus™, the intelligent engine at the heart of the BalloAds ecosystem - loyal, alert, and always working in your best interest. Just like a trusted companion, Brutus sits beside your business, learning, optimising, and ensuring every WhatsApp interaction lands exactly the way it should.",
    title: "Optimise WhatsApp Messaging",
    imageUrl: phone.src,
    icon: (
      <svg className="shrink-0 mt-3" width="48" height="49" viewBox="0 0 48 49" fill="none">
        <path d="M12.5743 15.8831C11.6719 16.0706 10.8516 16.6565 10.5 17.3713C10.1719 18.051 10.1719 17.8987 10.1719 25.0471V34.1995H36.2579C37.0665 33.4143 37.5586 32.7815 37.7461 31.9026V18.0745C37.5586 17.1956 36.2579 16.5627 36.2579 16.1643H12.5743Z" fill="white" stroke="white" strokeWidth="0.5" />
        <rect x="0.9" y="1.4" width="46.2" height="46.2" rx="23.1" stroke="white" strokeWidth="1.8" />
      </svg>
    )
  },
  {
    category: "Meet Brutus™, the intelligent companion behind BalloAds’ SMS optimisation layer - built to ensure your brand is recognised, trusted, and compliant from the very first glance. In a crowded inbox, the sender name is your handshake, and Brutus makes sure it’s firm, clear, and credible.",
    title: "SMS Sender ID Optimisation",
    imageUrl: phone.src,
    icon: (
      <svg className="shrink-0 mt-3" width="48" height="49" viewBox="0 0 48 49" fill="none">
        <path d="M12.5743 15.8831C11.6719 16.0706 10.8516 16.6565 10.5 17.3713C10.1719 18.051 10.1719 17.8987 10.1719 25.0471V34.1995H36.2579C37.0665 33.4143 37.5586 32.7815 37.7461 31.9026V18.0745C37.5586 17.1956 36.2579 16.5627 36.2579 16.1643H12.5743Z" fill="white" stroke="white" strokeWidth="0.5" />
        <rect x="0.9" y="1.4" width="46.2" height="46.2" rx="23.1" stroke="white" strokeWidth="1.8" />
      </svg>
    )
  },
  {
    category: "At the heart of BalloAds’ messaging intelligence is Brutus™, your always-on guardian ensuring every message you send is safe, credible, and trusted. In an era where scams and phishing attempts erode customer confidence, Brutus works behind the scenes to protect both your brand and your audience before a single message is delivered.",
    title: "Fraud Detection & Content Safety",
    imageUrl: phone.src,
    icon: (
      <svg className="shrink-0 mt-3" width="48" height="49" viewBox="0 0 48 49" fill="none">
        <path d="M12.5743 15.8831C11.6719 16.0706 10.8516 16.6565 10.5 17.3713C10.1719 18.051 10.1719 17.8987 10.1719 25.0471V34.1995H36.2579C37.0665 33.4143 37.5586 32.7815 37.7461 31.9026V18.0745C37.5586 17.1956 36.2579 16.5627 36.2579 16.1643H12.5743Z" fill="white" stroke="white" strokeWidth="0.5" />
        <rect x="0.9" y="1.4" width="46.2" height="46.2" rx="23.1" stroke="white" strokeWidth="1.8" />
      </svg>
    )
  },
  {
    category: "Brutus™ acts as your always-available creative partner, transforming ideas into ready-to-use messaging that is clear, engaging, and performance-driven. Built into the BalloAds ecosystem, Content Generation & Creative Intelligence helps brands move faster without sacrificing quality or consistency across channels.",
    title: "Content Generation & Creative Intelligence ",
    imageUrl: phone.src,
    icon: (
      <svg className="shrink-0 mt-3" width="48" height="49" viewBox="0 0 48 49" fill="none">
        <path d="M12.5743 15.8831C11.6719 16.0706 10.8516 16.6565 10.5 17.3713C10.1719 18.051 10.1719 17.8987 10.1719 25.0471V34.1995H36.2579C37.0665 33.4143 37.5586 32.7815 37.7461 31.9026V18.0745C37.5586 17.1956 36.2579 16.5627 36.2579 16.1643H12.5743Z" fill="white" stroke="white" strokeWidth="0.5" />
        <rect x="0.9" y="1.4" width="46.2" height="46.2" rx="23.1" stroke="white" strokeWidth="1.8" />
      </svg>
    )
  },
  {
    category: "Brutus™ transforms how your brand communicates by automating message delivery with precision, intelligence, and perfect timing. Instead of manual sending and fragmented workflows, Brutus enables seamless, rule-based messaging that works in the background — ensuring your customers receive the right message at exactly the right moment.",
    title: "Automations & Scheduling",
    imageUrl: phone.src,
    icon: (
      <svg className="shrink-0 mt-3" width="48" height="49" viewBox="0 0 48 49" fill="none">
        <path d="M12.5743 15.8831C11.6719 16.0706 10.8516 16.6565 10.5 17.3713C10.1719 18.051 10.1719 17.8987 10.1719 25.0471V34.1995H36.2579C37.0665 33.4143 37.5586 32.7815 37.7461 31.9026V18.0745C37.5586 17.1956 36.2579 16.5627 36.2579 16.1643H12.5743Z" fill="white" stroke="white" strokeWidth="0.5" />
        <rect x="0.9" y="1.4" width="46.2" height="46.2" rx="23.1" stroke="white" strokeWidth="1.8" />
      </svg>
    )
  }
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

export default function Page() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  return (
    <>
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
      {/* 1. The Video Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 z-0 h-full w-full object-cover"
        src="/BalloAds Assets 2/BalloAds Asset Videos.mp4"
      >
        Your browser does not support the video tag.
      </video>

      {/* 2. The Overlay Layer */}
      <div className="absolute inset-0 z-10 bg-black/50 backdrop-blur-[2px]" />

      {/* 3. The Content Layer */}
      <div className="container relative z-20 mx-auto px-4 text-center">
        <p className="mt-6 text-xl text-white/80 max-w-2xl mx-auto uppercase tracking-widest">
          RUN YOUR ADS WITHIN MINUTES
        </p>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          A NEW WAY TO THINK<br /> AND CREATE
        </h1>
          {/* Search Bar Implementation */}
          <div className="relative flex items-center justify-center">
            <div className="relative group mt-10">
              {/* Search Icon (Inside the bar) */}
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-white/50 group-focus-within:text-blue-400 transition-colors"
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
              
              {/* The Input Field */}
              <input
                type="text"
                placeholder="Talk to Brutus..."
                className="bg-[var(--dark-blue)]/40 border border-white/10 text-white text-sm rounded-full focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 block w-full pl-10 pr-4 py-2 transition-all duration-300 outline-none placeholder:text-white/30 hover:bg-white/10 w-40 md:w-64"
              />
            </div>
          </div>
        </div>
    </section>
    
    <section className="relative w-full h-screen flex items-center justify-center bg-black overflow-hidden">
         
        {/* 1. The Design-Match Background (The Card) */}
        <div className="relative w-[90%] max-w-[1200px] h-[450px] rounded-[40px] bg-white/5 border border-white/10 backdrop-blur-md px-12 py-16 flex items-center">
          
          {/* Slider Content Loop */}
          <div className="relative w-full h-full">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-all duration-700 flex flex-col md:flex-row items-center ${
                  currentSlide === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
                }`}
                >
                {/* Left Side: Text Content */}
                <div className="md:w-3/5 text-white z-10">
                  <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
                    {slide.title}
                  </h2>
                  <p className="text-white/70 text-lg mb-8 max-w-md leading-relaxed">
                    {slide.category} {/* Added a description field to your data */}
                  </p>
                  <button className="bg-white text-blue-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-opacity-90 transition-all">
                    Read more 
                    <span className="border border-blue-900 rounded-full w-5 h-5 flex items-center justify-center text-xs">→</span>
                  </button>
                </div>

                {/* Right Side: The Phone (Absolute Positioned to Pop Out) */}
                <div className="md:w-2/5 relative h-full flex justify-end items-center">
                  {/* Glow Effect behind phone */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[100px] rounded-full" />
                  
                  <div className="relative w-[280px] md:w-[320px] lg:w-[380px] top-10 transform md:translate-x-10 lg:translate-x-20 -translate-y-10">
                    <Image
                      src={phone}
                      alt="Phone Preview"
                      width={500}
                      height={1000}
                      className="w-full h-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                      priority
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 2. The Decorative Asset (Replacing the CSS Ring with your Image) */}
          <div className="absolute top-120 left-1/2 scale-[2] -translate-x-1/2 w-[700px] h-auto  z-20 pointer-events-none">
            <Image
              src={ring} // Replace this with your imported image (e.g., ring, glow, etc.)
              alt="Decorative element"
              width={800}
              height={400}
              className="w-full h-auto object-contain opacity-90"
              priority
            />
          </div>
        </div>

        {/* Pagination (Dots or Bars) */}
        <div className="absolute bottom-10 flex gap-2">
          {slides.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all ${currentSlide === i ? 'w-12 bg-white' : 'w-4 bg-white/20'}`}
            />
          ))}
        </div>
    </section>

    <section className="relative w-full h-screen px-25 overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
              <Image
                src={world}
                alt="Background"
                fill
                className="object-cover filter brightness-30"
                priority
              />
            </div>
            <div className="relative z-10 px-4 pb-28 pt-24 md:px-8 overflow-hidden">
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
                          <p className="relative z-10 mt-2 text-[20px] text-white/70">{highlight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              
              <div className="relative z-10 flex flex-col items-center gap-5 px-4 pb-28 pt-24 md:px-8 md:flex-row md:justify-center">
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-color-1)] px-6 py-3 text-2rem font-semibold text-white transition hover:bg-[var(--brand-color-2)]"
                >
                  Get Started
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-2rem font-semibold text-[var(--brand-color-1)] transition hover:border-white hover:bg-white/10"
                >
                  Contact us
                </Link>
              </div>  
            </div>          
      </section>
  </>
  );
};