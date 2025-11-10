"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Sample subscription channels data
const subscriptionChannels = [
  {
    id: 1,
    channelName: "BalloAds Official",
    profileImage: null,
    subscriberCount: "12.5K",
  },
  {
    id: 2,
    channelName: "Digital Marketing Tips",
    profileImage: null,
    subscriberCount: "8.3K",
  },
  {
    id: 3,
    channelName: "AI Technology Hub",
    profileImage: null,
    subscriberCount: "15.2K",
  },
  {
    id: 4,
    channelName: "Business Growth",
    profileImage: null,
    subscriberCount: "9.7K",
  },
  {
    id: 5,
    channelName: "Tech Innovations",
    profileImage: null,
    subscriberCount: "6.1K",
  },
  {
    id: 6,
    channelName: "Marketing Mastery",
    profileImage: null,
    subscriberCount: "11.4K",
  },
];

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscribedChannels, setSubscribedChannels] = useState<Set<number>>(new Set());
  const [hasSubmittedForm, setHasSubmittedForm] = useState(false);

  useEffect(() => {
    // Check if user has submitted the form before
    const submitted = localStorage.getItem("balloAds_subscriptionFormSubmitted");
    setHasSubmittedForm(submitted === "true");

    // Check for success message from form submission
    const subscribed = searchParams.get("subscribed");
    const channelId = searchParams.get("channelId");
    if (subscribed === "true" && channelId) {
      // Add the channel to subscribed list
      setSubscribedChannels((prev) => new Set(prev).add(Number(channelId)));
      // Clean up URL
      router.replace("/subscription", { scroll: false });
    }
  }, [router, searchParams]);

  const handleSubscribe = (channelId: number, channelName: string) => {
    // Check if already subscribed
    if (subscribedChannels.has(channelId)) {
      // Unsubscribe
      setSubscribedChannels((prev) => {
        const newSet = new Set(prev);
        newSet.delete(channelId);
        return newSet;
      });
      return;
    }

    // If user hasn't submitted form, redirect to form page
    if (!hasSubmittedForm) {
      router.push(
        `/subscription/form?channelId=${channelId}&channelName=${encodeURIComponent(channelName)}`
      );
      return;
    }

    // If form already submitted, just subscribe
    setSubscribedChannels((prev) => new Set(prev).add(channelId));
  };

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto">
        {/* Header Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 max-w-5xl text-center mx-auto">
            Stay Connected With Businesses You Love
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Get exclusive deals, updates, and announcements directly from businesses you care about.
          </p>
        </section>

        {/* Subscription Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionChannels.map((channel) => {
            const isSubscribed = subscribedChannels.has(channel.id);
            
            return (
              <div
                key={channel.id}
                className="relative group"
                style={{
                  perspective: "1000px",
                }}
              >
                {/* 3D Card Container */}
                <div
                  className="relative bg-white rounded-3xl p-8 shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                  style={{
                    transformStyle: "preserve-3d",
                    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                  }}
                >
                  {/* Background gradient effect */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-5"
                    style={{
                      background: "linear-gradient(135deg, #020055 0%, #0b4d8c 50%, #6b46c1 100%)",
                    }}
                  />

                  {/* Content */}
                  <div className="relative z-10 flex flex-col items-center gap-6">
                    {/* Profile Picture Placeholder */}
                    <div className="relative">
                      <div
                        className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center"
                        style={{
                          boxShadow: "inset 0 2px 8px rgba(0, 0, 0, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)",
                        }}
                      >
                        {channel.profileImage ? (
                          <img
                            src={channel.profileImage}
                            alt={channel.channelName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-full h-full rounded-full flex items-center justify-center gradient-blue-purple"
                          >
                            <span className="text-4xl font-bold text-white">
                              {channel.channelName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div className="text-center space-y-2">
                      <p className="text-xs uppercase tracking-wider text-gray-600 font-semibold">
                        SUBSCRIBE TO CHANNEL
                      </p>
                      <h3 className="text-2xl font-bold text-gray-800 uppercase">
                        {channel.channelName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {channel.subscriberCount} subscribers
                      </p>
                    </div>

                    {/* Subscribe Button */}
                    <button
                      onClick={() => handleSubscribe(channel.id, channel.channelName)}
                      className={`w-full py-4 rounded-xl font-bold text-lg uppercase transition-all duration-300 cursor-pointer ${
                        isSubscribed
                          ? "bg-gray-400 text-white hover:bg-gray-500"
                          : "gradient-blue-purple text-white hover:opacity-90 hover:shadow-lg"
                      }`}
                      style={{
                        boxShadow: isSubscribed
                          ? "0 4px 12px rgba(0, 0, 0, 0.15)"
                          : "0 4px 12px rgba(63, 219, 255, 0.3), 0 0 0 1px rgba(63, 219, 255, 0.1)",
                      }}
                    >
                      {isSubscribed ? "SUBSCRIBED" : "SUBSCRIBE"}
                    </button>
                  </div>

                  {/* 3D Light rays effect */}
                  <div
                    className="absolute inset-0 rounded-3xl opacity-10 pointer-events-none"
                    style={{
                      background: "radial-gradient(circle at 50% 100%, #3fdbff 0%, transparent 70%)",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </section>

        {/* Additional Info Section */}
        <section className="mt-24 text-center max-w-4xl mx-auto">
          <div className="bg-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Why Subscribe?
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              {[
                {
                  title: "Latest Updates",
                  description: "Get notified about new features and updates first",
                },
                {
                  title: "Tutorials & Guides",
                  description: "Learn how to maximize your marketing campaigns",
                },
                {
                  title: "Tips & Tricks",
                  description: "Discover best practices and optimization strategies",
                },
              ].map((item, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <h3 className="text-xl font-semibold text-[var(--brand-color-4)]">
                    {item.title}
                  </h3>
                  <p className="text-white/70">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

