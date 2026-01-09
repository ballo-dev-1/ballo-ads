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
    
    <section className="relative w-full h-screen py-20 overflow-hidden bg-black">
      {/* Background Image Container */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* The "Ring" Asset - Now movable */}
        <div className="absolute w-[800px] h-auto -bottom-20 -right-20 pointer-events-none opacity-80">
          <Image
            src={ring}
            alt="Decorative Ring"
            width={1200} // Provide a base width
            height={1200} // Provide a base height
            className="w-full h-auto scale-[1.5] -top-160 left-30"
            priority
          />
        </div>

        {/* Overlay - Optional: only keep if you want the dark tint over the whole section */}
        <div className="absolute inset-0 bg-black/30 pointer-events-none" />
      </div>

      <div className="relative z-10 overflow-hidden md:overflow-visible py-20 px-4 md:px-8 lg:px-0 min-h-[600px] md:h-[540px] 2xl:h-[700px]">
        
        {/* SVG Background Layer */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="hidden md:block w-full h-full scale-110 -translate-x-[5%]" viewBox="0 0 1200 540" fill="none" preserveAspectRatio="none">
            {/* 2. Changed fill to white/40 (rgba(255,255,255,0.4)) and removed gradient ref */}
            <path 
              d="M417.616 0C404.551 0 396.134 3.93474 389.697 10.2961L373.613 26.2278C371.249 28.575 366.793 30.0265 361.969 30.0265H21.5005C3.57885 30.0265 -5.38198 30.0265 -12.2272 33.5142C-18.2483 36.5822 -23.1437 41.4776 -26.2117 47.4988C-29.6995 54.3439 -29.6995 63.3048 -29.6995 81.2264V488.8C-29.6995 506.722 -29.6995 515.682 -26.2117 522.528C-23.1437 528.549 -18.2483 533.444 -12.2272 536.512C-5.38198 540 3.57886 540 21.5005 540H342.371C353.648 540 364.046 534.931 369.588 529.443L380.593 517.832C382.957 515.484 387.668 510.869 397.843 510.869H1148.44C1166.37 510.869 1175.33 510.869 1182.17 507.381C1188.19 504.314 1193.09 499.418 1196.16 493.397C1199.64 486.552 1199.64 477.591 1199.64 459.669V51.2C1199.64 33.2783 1199.64 24.3175 1196.16 17.4723C1193.09 11.4511 1188.19 6.55574 1182.17 3.48779C1175.33 0 1166.37 0 1148.44 0H417.616Z" 
              fill="white" 
              fillOpacity="0.4"
            />
          </svg>
          {/* 3. Updated Mobile Fallback to white/40 */}
          <div className="md:hidden absolute inset-0 bg-white/40 backdrop-blur-sm" />
        </div>

        {/* Slider Content */}
        <div className="relative z-10 container mx-auto h-full flex items-center">
          <div className="w-full relative h-full min-h-[400px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 flex flex-col md:flex-row items-center gap-10 ${
                  currentSlide === index ? "opacity-100 z-20" : "opacity-0 z-10"
                }`}
              >
                <div className="md:w-1/2 text-white">
                  <div className="mt-6 flex flex-col md:flex-row gap-6">
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight drop-shadow-lg">
                      {slide.title}
                    </h2>
                  </div>
                  <p className="uppercase text-sm tracking-widest font-medium opacity-90">{slide.category}</p>
                </div>
                
                <div className="md:w-1/2 flex justify-center">
                  <div 
                    className="w-full max-w-[650px] aspect-[4/3] rounded-[30px] lg:rounded-[40px] bg-cover bg-center shadow-2xl border border-white/20"
                    style={{ backgroundImage: `url(${slide.imageUrl})` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination */}
        <div className="absolute bottom-10 left-4 md:left-20 z-30">
          <div className="flex items-center gap-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`group flex flex-col gap-2 transition-all duration-500 ${
                  currentSlide === index ? "w-24 md:w-48 opacity-100" : "w-12 opacity-50"
                }`}
              >
                <div className={`h-[3px] w-full transition-colors ${currentSlide === index ? 'bg-white' : 'bg-white/40'}`} />
                <span className="text-white text-xs font-bold tracking-tighter">0{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>

    <section className="relative w-full h-screen py-20 px-20 overflow-hidden bg-black">
            <div className="absolute inset-0 z-0">
              <Image
                src={world}
                alt="Background"
                fill
                className="object-cover filter brightness-30"
                priority
              />
            </div>
            <div className="relative z-10 overflow-hidden">
                <h3 className="relative z-10 text-3xl font-semibold text-center">Learn more about how we can support your growth</h3>
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
                          <h3 className="relative z-10 text-2xl font-semibold">{highlight.title}</h3>
                          <p className="relative z-10 mt-2 text-sm text-white/70">{highlight.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              
              <div className="relative z-10 flex flex-col items-center gap-5 md:flex-row md:justify-center">
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
      </section>
  </>
  );
};