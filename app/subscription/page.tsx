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
    <main className="subscription-page">
      <div className="subscription-page__container">
        {/* Header Section */}
        <section className="subscription-page__header">
          <h1 className="subscription-page__title">
            Stay Connected With Businesses You Love
          </h1>
          <p className="subscription-page__description">
            Get exclusive deals, updates, and announcements directly from businesses you care about.
          </p>
        </section>

        {/* Subscription Cards Grid */}
        <section className="subscription-page__cards-grid">
          {subscriptionChannels.map((channel) => {
            const isSubscribed = subscribedChannels.has(channel.id);
            
            return (
              <div
                key={channel.id}
                className="subscription-card"
                style={{
                  perspective: "1000px",
                }}
              >
                {/* 3D Card Container */}
                <div className="subscription-card__container">
                  {/* Background gradient effect */}
                  <div className="subscription-card__background" />

                  {/* Content */}
                  <div className="subscription-card__content">
                    {/* Profile Picture Placeholder */}
                    <div className="subscription-card__avatar-wrapper">
                      <div className="subscription-card__avatar">
                        {channel.profileImage ? (
                          <img
                            src={channel.profileImage}
                            alt={channel.channelName}
                            className="subscription-card__avatar-image"
                          />
                        ) : (
                          <div className="subscription-card__avatar-initial">
                            <span className="subscription-card__avatar-text">
                              {channel.channelName.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Channel Info */}
                    <div className="subscription-card__info">
                      <p className="subscription-card__label">
                        SUBSCRIBE TO CHANNEL
                      </p>
                      <h3 className="subscription-card__name">
                        {channel.channelName}
                      </h3>
                      <p className="subscription-card__subscribers">
                        {channel.subscriberCount} subscribers
                      </p>
                    </div>

                    {/* Subscribe Button */}
                    <button
                      onClick={() => handleSubscribe(channel.id, channel.channelName)}
                      className={`subscription-card__button ${
                        isSubscribed
                          ? "subscription-card__button--subscribed"
                          : "subscription-card__button--default"
                      }`}
                    >
                      {isSubscribed ? "SUBSCRIBED" : "SUBSCRIBE"}
                    </button>
                  </div>

                  {/* 3D Light rays effect */}
                  <div className="subscription-card__light-rays" />
                </div>
              </div>
            );
          })}
        </section>

        {/* Additional Info Section */}
        <section className="subscription-page__info">
          <div className="subscription-page__info-card">
            <h2 className="subscription-page__info-title">
              Why Subscribe?
            </h2>
            <div className="subscription-page__info-grid">
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
                <div key={index} className="subscription-page__info-item">
                  <h3 className="subscription-page__info-item-title">
                    {item.title}
                  </h3>
                  <p className="subscription-page__info-item-description">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

