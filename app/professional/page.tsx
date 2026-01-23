"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import personSmile from "@/public/Assets/12.png";
import pushNotifications from "@/public/Assets/10.png";
import analyticsTile from "@/public/BalloAds Assets 2/1.png";
import smsTile from "@/public/BalloAds Assets 2/24.png";
import uploadContacts from "@/public/Assets/14.png";
import whatsappTile from "@/public/BalloAds Assets 2/22.png";
import aiBoard from "@/public/elements small/stats-chart.png";
import bankingImage from "@/public/BalloAds Assets 2/1.png";
import retailImage from "@/public/BalloAds Assets 2/4.png";
import insurance from "@/public/BalloAds Assets 2/2.png";
import transportImage from "@/public/BalloAds Assets 2/6.png";
import healthcareImage from "@/public/BalloAds Assets 2/9.png";
import mining from "@/public/BalloAds Assets 2/10.png";
import restaurant from "@/public/BalloAds Assets 2/13.png";
import education from "@/public/BalloAds Assets 2/15.png";
import entertainment from "@/public/BalloAds Assets 2/17.png";
import { title } from "process";
import ring from "@/public/Assets/8.png";
const heroCards = {
  main: {
    title: "Seamless email Marketing and at your fingertips",
    cta: "Watch Demo",
    description:
      "Open BalloAds · Menu · Create Ad · Type message · Select platform · Add contacts · Select duration · Select area · Preview · Done",
    image: personSmile,
  },
  secondary: [
    { title: "Push Notifications", image: pushNotifications },
    { title: "Check your Analytics", image: analyticsTile },
    { title: "SMS Marketing just for you", image: smsTile },
    { title: "Upload Contacts", image: uploadContacts },
    { title: "WhatsApp Marketing", image: whatsappTile },
  ],
};


const professionalServices = [
  {
    title: "Banking & Financial Services",
    description: "As a financial institution, you need a communication engine that is fast, secure, and reliable - mand that’s exactly what BalloAds gives you. We help you reach your customers instantly across SMS, WhatsApp, email, web push, and pop-up channels, ensuring that every product update, loan offer, repayment reminder, or digital banking prompt is delivered at the right moment. With our advanced segmentation, you can target clients based on behaviour, interest, or financial journey stage - meaning your high-value products land in front of the customers most likely to act. BalloDash Analytics then give you full visibility into performance, letting you measure conversions, refine your targeting, and improve ROI with each campaign. In a competitive financial market, BalloAds becomes your growth partner - boosting product uptake, improving customer retention, reducing communication costs, and strengthening the trust your clients have in your brand.",
    image: bankingImage,
  },
  {
    title: "Retail & Ecommerce",
    description: "For your retail or eCommerce business, every customer interaction counts - and BalloAds helps you make each one meaningful and profitable. We give you the power to notify shoppers instantly about new arrivals, promotions, restocks, and personalised deals across multiple channels, even after they leave your website. With behaviour-based triggers, you can recover abandoned carts, suggest complementary products, and tailor offers to individual shopping habits - turning casual browsers into loyal buyers. Our multi-channel delivery keeps your brand visible everywhere your customers are active, while BalloDash analytics shows you exactly which campaigns are driving sales, who’s engaging, and what to optimise next. With BalloAds, you reduce marketing waste, increase repeat purchases, and build a customer base that stays engaged from the first click to the final checkout.",
    image: retailImage,
  },
  {
    title: "Insurance",
    description: "As an insurance provider, your greatest advantage is trust - and BalloAds helps you strengthen that trust through fast, clear, and consistent communication. We enable you to instantly reach policyholders with updates on renewals, claims, new products, premium reminders, and important advisories across SMS, WhatsApp, email, web push, and pop-ups. With intelligent segmentation, you can tailor messages to specific client groups - such as motorists, homeowners, SMEs, or health policyholders - ensuring every communication feels relevant and timely. BalloDash analytics then gives you a clear view of engagement and conversions, helping you understand which products resonate and which messages trigger action. By using BalloAds, you boost policy renewals, reduce missed payments, enhance customer experience, and drive higher uptake of your insurance offerings - while cutting communication costs and improving operational efficiency.",
    image: insurance,
  },
  {
    title: "Transport & Logistics",
    description: "For your transport or logistics business, time, coordination, and clarity determine your success - and BalloAds gives you the communication tools to run operations at their best. You can instantly update clients about delivery timelines, route changes, driver schedules, cargo status, and service availability across multiple channels. Whether you're handling fleet management, courier deliveries, supply chain operations, or passenger transport, our multi-channel system ensures that every update reaches customers and staff without delay. Behaviour-based and event-triggered alerts allow you to automate notifications and improve service reliability, while BalloDash analytics helps you track customer engagement and operational performance in real time. With BalloAds, you reduce delays caused by miscommunication, increase customer satisfaction, and operate with a level of transparency that strengthens long-term relationships.",
    image: transportImage,
  },
  {
    title: "Healthcare Services",
    description: "In healthcare, communication saves time and often improves outcomes - and BalloAds empowers your facility to connect with patients quickly, securely, and thoughtfully. You can send appointment reminders, test result notifications, doctor availability updates, wellness tips, medication alerts, and public health advisories across SMS, WhatsApp, email, and web push. Our segmentation tools allow you to target messages based on patient needs or conditions, making your outreach more personalised and supportive. BalloDash analytics provides real-time insights into engagement, helping you understand patient behaviour and refine your outreach strategies. With BalloAds, you enhance patient satisfaction, reduce missed appointments, streamline operational workflows, and maintain a trusted, consistent presence in your patients’ lives - all while minimising administrative costs and communication delays.",
    image: healthcareImage,
  },
  {
    title: "Mining & Manufacturing",
    description: "In your mining or manufacturing operation, information flow needs to be instant, precise, and reliable - BalloAds helps you achieve exactly that. You can communicate shift updates, safety alerts, production notices, equipment downtime, and compliance reminders across SMS, WhatsApp, email, and push notifications, ensuring every team member stays informed no matter how remote the site. Our automation tools reduce delays caused by manual communication and help you coordinate teams, contractors, and suppliers more efficiently. With BalloDash analytics, you gain visibility into message delivery, staff engagement, and operational response times. BalloAds ultimately strengthens internal coordination, improves safety culture, reduces downtime, and keeps your entire operation running smoothly with smart, timely communication.",
    image: mining,
  },
  {
    title: "Restaurants & Hospitality",
    description: "For your restaurant, lodge, or hospitality brand, customer experience is everything - and BalloAds helps you elevate it at every touchpoint. You can instantly update guests on reservations, promotions, special menus, holiday packages, and events through SMS, WhatsApp, email, and web push. Behaviour-based targeting lets you send personalised offers, loyalty rewards, and reminders to bring customers back at the right moments. With BalloDash analytics, you can see which promotions drive bookings, which messages encourage repeat visits, and how guests respond to your campaigns. BalloAds helps you increase reservations, strengthen brand loyalty, fill slow periods, and keep your customers delighted with consistent, engaging communication.",
    image: restaurant,
  },
  {
    title: "Education & Training Institutions",
    description: "As a school, college, or training institution, your success depends on clear, consistent communication with students, parents, and staff - and BalloAds gives you the tools to do it effortlessly. You can send enrollment updates, class schedules, exam reminders, results notifications, fee alerts, and campus announcements across SMS, WhatsApp, email, and web push. With smart segmentation, you can reach specific groups - such as parents of new students, final-year classes, or trainees in different programmes - ensuring the right information reaches the right people instantly. BalloDash analytics provide detailed insights into engagement, helping you improve attendance, reduce missed deadlines, and enhance student/parent satisfaction. With BalloAds, your institution becomes more efficient, more connected, and better equipped to deliver a smooth academic experience.",
    image: education,
  },
  {
    title: "Entertainment & Events Industry",
    description: "In the entertainment world - where timing, hype, and audience connection determine success - BalloAds gives you the power to keep fans engaged and informed in real time. Whether you’re promoting an artist, album, concert, festival, comedy show, theatre production, or nightlife event, you can send instant updates on ticket sales, new releases, venue changes, meet-and-greets, and exclusive drops across SMS, WhatsApp, email, and web push. With behaviour-based targeting, you can reach fans who previously attended your events, streamed your music, or engaged with your content - making every campaign more personal and more impactful. BalloDash analytics then shows you which messages drove ticket sales, boosted streams, or increased turnout. With BalloAds, you build stronger fan communities, sell out shows faster, increase discovery for your artists, and maintain a steady buzz around every project you release.",
    image: entertainment,
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

export default function ProfessionalServicesPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleService = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <main className="bg-[#EEF2FF] text-[var(--dark-blue)]">

      {/* Professional Services Section */}
      <section className="relative overflow-hidden bg-[#020A2A] text-white px-4 pb-28 pt-24 md:px-8">
        {/* Decorative Background Circles */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-12 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full border border-white/10" />
          <div className="absolute top-12 left-1/2 h-[780px] w-[780px] -translate-x-1/2 rounded-full border border-white/10" />
        </div>

        <div className="container mx-auto flex flex-col gap-16">
          {/* Header Section */}
          <div className="flex items-center flex-col gap-4 text-center">
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-5 py-2 text-xl font-semibold uppercase tracking-[0.3em]">
              Professional Services
            </span>
            <div>
              <div className="glitch-text">
                <h2 className="text-4xl font-bold md:text-5xl">
                  How can BalloAds benefit you?
                </h2>
              </div>
              <p className="mt-2 text-base text-white/70">Rebranding the future starts here</p>
            </div>
          </div>

          {/* Dropdown Items George to look into the height issue*/}
          <div className="flex flex-col gap-6 h-300% max-w-8xl mx-auto w-full">
            {professionalServices.map((service, index) => (
              <div
                key={`${service.title}-${index}`}
                className={`flex flex-col overflow-hidden rounded-[28px] border transition-all duration-300 bg-white/5 ${
                  openIndex === index ? "border-white/40 bg-white/10" : "border-white/10 hover:border-white/20"
                }`}
              >
                {/* Visible Header of the Item */}
                <button
                  onClick={() => toggleService(index)}
                  className="flex w-full flex-row items-center justify-between p-6 text-left focus:outline-none"
                >
                  <div className="flex items-center gap-6">
                    {/* Small Icon/Image Preview (optional, always visible) */}
                    <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
                      <Image src={service.image} alt="" width={40} height={40} className="object-cover rounded-md" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold">{service.title}</h3>
                  </div>

                  <div className={`ml-auto flex h-10 w-10 items-center justify-center rounded-full border border-white/40 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180 bg-white text-[#020A2A]" : ""
                  }`}>
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </div>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`transition-all duration-500 ease-in-out ${
                    openIndex === index ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col gap-8 p-6 pt-0 md:flex-row md:items-start">
                    {/* Image Detail */}
                    <div className="flex w-full max-w-[300px] shrink-0 items-center justify-center rounded-[24px] bg-white/10 p-4">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={280}
                        height={180}
                        className="h-auto w-full rounded-[20px] object-cover"
                      />
                    </div>

                    {/* Description Detail */}
                    <div className="flex flex-1 flex-col justify-center py-2">
                      <p className="text-lg leading-relaxed text-white/80">
                        {service.description}
                      </p>
                      {/* You can add more detailed points or a "Learn More" button here */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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


