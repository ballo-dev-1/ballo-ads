"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
    MessageSquare, Mail, Phone, Check, X,
    Building, Landmark, Globe, ShoppingCart, Heart, GraduationCap,
    MessageCircle 
} from 'lucide-react';

// --- PLACEHOLDER IMAGE ASSETS (Minimal for structure) ---
// Using a generic placeholder image source for Next.js Image component needs
const PLACEHOLDER_IMG_SRC = '/placeholder-image.png'; // Assume this exists in /public


// --- TYPESCRIPT INTERFACES ---

interface Feature {
  text: string;
  included: boolean;
}

interface PricingTier {
  id: string;
  title: string;
  currency: string;
  icon: React.ReactNode;
  features: Feature[];
}

interface UseCase {
  id: string;
  icon: React.ReactNode; 
  text: string;
  subtext: string;
  image: string; // Changed type to string for generic placeholder source
}

// --- DATA ARRAYS ---

const pricingData: PricingTier[] = [
  {
    id: 'sms', title: 'SMS', currency: 'K', icon: <MessageSquare className="w-6 h-6 text-blue-400" />,
    features: [
      { text: 'Quick action tools and scheduling', included: true },
      { text: 'Analytics and campaign data', included: true },
      { text: 'Generative AI for quick content', included: true },
      { text: 'Unlimited sms expiry', included: false },
    ],
  },
  {
    id: 'email', title: 'Email', currency: 'K', icon: <Mail className="w-6 h-6 text-blue-400" />,
    features: [
      { text: 'Quick action tools and scheduling', included: true },
      { text: 'Analytics and campaign data', included: true },
      { text: 'AI Agent for automations', included: true },
      { text: 'Unlimited email expiry', included: false },
    ],
  },
  {
    id: 'whatsapp', title: 'WhatsApp', currency: 'K', icon: <MessageCircle className="w-6 h-6 text-green-500" />,
    features: [
      { text: 'Quick action tools and scheduling', included: true },
      { text: 'Analytics and campaign data', included: true },
      { text: 'Email and Push Notification support', included: true },
      { text: 'Unlimited WhatsApp expiry', included: false },
    ],
  },
];

const useCases: UseCase[] = [
  { id: 'sme', icon: <Building className="w-6 h-6" />, text: "SMEs & Corporations", subtext: "Promote products, services, and offers.", image: PLACEHOLDER_IMG_SRC },
  { id: 'finance', icon: <Landmark className="w-6 h-6" />, text: "Financial Institutions", subtext: "Send loan approvals, transaction updates, and offers.", image: PLACEHOLDER_IMG_SRC },
  { id: 'nonprofit', icon: <Globe className="w-6 h-6" />, text: "Nonprofits & Government Initiatives", subtext: "Spread awareness with mass communication.", image: PLACEHOLDER_IMG_SRC },
  { id: 'retail', icon: <ShoppingCart className="w-6 h-6" />, text: "Retail & E-commerce", subtext: "Drive sales and customer engagement.", image: PLACEHOLDER_IMG_SRC },
  { id: 'healthcare', icon: <Heart className="w-6 h-6" />, text: "Healthcare & Clinics", subtext: "Send appointment reminders and health campaigns.", image: PLACEHOLDER_IMG_SRC },
  { id: 'education', icon: <GraduationCap className="w-6 h-6" />, text: "Education Institutions", subtext: "Notify students, parents, and staff with updates.", image: PLACEHOLDER_IMG_SRC },
];

const stepsFlow = [
  { id: 1, title: '1. Easy Registration', pos: 'top-left' }, // Removed image source
  { id: 2, title: '2. Purchase a package', pos: 'top-right' }, // Removed image source
  { id: 4, title: '4. View Analytics', pos: 'bottom-left' }, // Removed image source
  { id: 3, title: '3. Run your campaign', pos: 'bottom-right' }, // Removed image source
];

// --- HELPER FUNCTION FOR PRICING ---
const calculatePrice = (messages: number): number => {
    const baseMessages = 1250;
    const basePrice = 850;
    const ratePerUnit = 100;
    const messagesPerRate = 500;

    if (messages <= baseMessages) { return basePrice; }

    const excessMessages = messages - baseMessages;
    const priceIncrease = Math.ceil(excessMessages / messagesPerRate) * ratePerUnit;
    
    return basePrice + priceIncrease;
};


// --- REUSABLE COMPONENTS ---

interface PricingCardProps {
    tier: PricingTier;
    initialMessages: number;
    maxMessages: number; 
}

const PricingCard: React.FC<PricingCardProps> = ({ tier, initialMessages, maxMessages = 10000 }) => {
  const [selectedMessages, setSelectedMessages] = useState(initialMessages);

  const calculatedPrice = useMemo(() => {
    return calculatePrice(selectedMessages);
  }, [selectedMessages]);

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedMessages(parseInt(event.target.value));
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden h-full">
      <div className="absolute top-0 left-0 w-full h-2 bg-blue-900" />
      
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-xl text-slate-800">{tier.title}</h3>
        {tier.icon}
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-slate-900 mb-2">
          {tier.currency}{calculatedPrice} <span className="text-sm text-slate-500 font-normal">per month</span>
        </div>
        
        {/* FUNCTIONAL SLIDER INPUT */}
        <div className="relative mt-3">
            <input
                type="range"
                min={initialMessages}
                max={maxMessages}
                step={250}
                value={selectedMessages}
                onChange={handleSliderChange}
                className="w-full h-2 appearance-none bg-transparent cursor-pointer range-lg [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-slate-200 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-900 [&::-webkit-slider-thumb]:shadow-lg"
            />
        </div>

        <div className="text-xs font-semibold text-slate-500 mt-2">
          Messages: {selectedMessages.toLocaleString()} +
        </div>
      </div>

      <button className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors mb-8">
        Sign Up
      </button>

      <div className="space-y-3 flex-grow border-t pt-6 border-slate-100">
        {tier.features.map((feature, index) => (
          <div key={index} className="flex items-start gap-3 text-sm">
            {feature.included ? (
              <Check className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <span className="text-slate-600">{feature.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const StepFlowSection: React.FC = () => (
    <section className="py-20 container mx-auto px-4">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-blue-900">
                Drive more growth in just 4 easy steps
            </h2>
        </div>

        <div className="relative max-w-4xl mx-auto">
            {/* Loop Line Placeholder */}
            <div className="absolute inset-0 z-0">
                <div className="w-full h-full border-4 border-blue-200 rounded-2xl opacity-40"></div> 
            </div>

            {/* Steps Grid */}
            <div className="grid grid-cols-2 gap-10 md:gap-y-20 relative z-10">
                {stepsFlow.map((step) => (
                    <div 
                        key={step.id} 
                        className={`flex flex-col items-center ${step.pos.includes('top') ? 'pt-10' : 'pb-10'}`}
                    >
                        <h3 className="text-lg font-bold text-slate-700 mb-6">{step.title}</h3>
                        
                        {/* Mobile Device Placeholder */}
                        <div className="relative w-[180px] h-[360px] bg-white rounded-[30px] shadow-2xl border-4 border-slate-100 overflow-hidden flex items-center justify-center text-xs text-slate-400">
                            {/* Instead of Image, use a div to mock the phone screen */}
                            <p>Screen for Step {step.id}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
    </section>
);


// --- MAIN PAGE COMPONENT ---

export default function IntegratedPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'unlimited'>('monthly');
  const [activeCaseId, setActiveCaseId] = useState<string>(useCases[0].id);
  const activeCase = useCases.find(c => c.id === activeCaseId) || useCases[0];

  return (
    <main className="bg-slate-50 font-sans">
      
      {/* 1. PRICING SECTION (Dynamic Switch & Slider) */}
      <section className="relative w-full pb-20">
        {/* Simplified Background */}
        <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-900 overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90 z-10" />
        </div>

        <div className="relative z-10 container mx-auto px-4 pt-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Dynamic, Transparent Pricing
            </h1>
            
            {/* Toggle Switch (Functional) */}
            <div className="inline-flex bg-white/10 backdrop-blur-sm p-1 rounded-full">
              <button 
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === 'monthly' ? 'bg-blue-900 text-white shadow-md' : 'text-white hover:bg-white/10'
                }`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingCycle('unlimited')}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${
                  billingCycle === 'unlimited' ? 'bg-blue-900 text-white shadow-md' : 'text-white hover:bg-white/10'
                }`}
              >
                Unlimited
              </button>
            </div>
          </div>

          {/* Pricing Cards Grid (Functional Slider) */}
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {pricingData.map((tier) => (
              <PricingCard 
                key={tier.id} 
                tier={tier} 
                initialMessages={1250} 
                maxMessages={10000} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. WHO CAN USE SECTION (Clickable Slider) */}
      <section className="py-20 px-4 text-white bg-[var(--dark-blue)]">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Who can use BalloAds?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Clickable Navigation List (Functional) */}
            <div className="space-y-6">
              {useCases.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-start gap-4 cursor-pointer p-3 rounded-xl transition-colors ${
                    activeCaseId === item.id 
                      ? 'bg-[var(--brand-color-1)]/20 border-l-4 border-[var(--brand-color-1)] text-white' 
                      : 'hover:bg-gray-700/30 text-gray-300'
                  }`}
                  onClick={() => setActiveCaseId(item.id)}
                >
                  <span className="text-3xl shrink-0 text-[var(--brand-color-1)]">{item.icon}</span>
                  
                  <div className="flex flex-col">
                    <span className="text-xl font-semibold">{item.text}</span>
                    <span className="text-sm text-gray-400 mt-1">{item.subtext}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Side - Dynamic Image Slider (Functional) */}
            <div className="relative h-[600px] flex items-center justify-center">
              
              {/* STATIC BACKGROUND (Ring/Light) Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] bg-blue-300/30 rounded-full blur-2xl opacity-50" />
              </div>

              {/* DYNAMIC BUILDING IMAGE Placeholder */}
              <div className="relative w-full h-full flex items-center justify-center transition-opacity duration-500">
                  {/* Building Image Placeholder */}
                  <Image
                      key={activeCase.id} 
                      src={activeCase.image} // Generic source
                      alt={`${activeCase.text} Building`}
                      width={350}
                      height={700}
                      className="object-contain w-auto h-full scale-[1.3] absolute transition-transform duration-500 ease-in-out"
                  />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CTA SECTION */}
      <section className="py-20 container mx-auto px-4 relative bg-slate-50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12 max-w-6xl mx-auto">
            <div className="md:w-1/2">
                <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-6">
                    Run your campaign in just a few seconds
                </h2>
                <p className="text-lg text-slate-600 mb-8 max-w-md">
                    After registration, utilise our automations and run your dynamic campaigns in just a few clicks
                </p>
                <button className="bg-blue-900 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-800 transition-all shadow-lg hover:shadow-xl">
                    Download now
                </button>
            </div>
            
            {/* CTA Image Placeholder */}
            <div className="md:w-1/2 relative h-[400px] w-full flex justify-center">
                <div className="absolute w-[350px] h-[350px] rounded-full border-[20px] border-blue-900/10 right-0 top-0" />
                <div className="relative w-[300px] h-[400px] rounded-t-full overflow-hidden bg-slate-200 flex items-center justify-center">
                     <p className="text-xs text-slate-400">CTA Image Placeholder</p>
                </div>
            </div>
        </div>
      </section>
    </main>
  );
}