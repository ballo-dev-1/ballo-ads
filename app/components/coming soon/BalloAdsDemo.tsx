"use client";

import "./style.css";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import background from "@/public/Backgrounds/hero-bg.png";
// NOTE: Use the image bellow to animate effects
// import balloAds from '@/public/elements small/1.png'
import playStore from "@/public/elements small/18.png";
import appleStore from "@/public/elements small/19.png";

import balloAdsPhone from "@/public/elements small/phone.png";
import appIcon from "@/public/Ballo Logo New/App icon 1.png";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";

const BalloAdsDemo = () => {
  const [revealPhone, setRevealPhone] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const formRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const { inView, ref } = useInView({
    threshold: 0.5,
  });

  useEffect(() => {
    if (inView) {
      setRevealPhone(true);
    }
  }, [inView]);

  useGSAP(() => {
    if (isFormOpen && formRef.current && overlayRef.current) {
      // Animate overlay fade in
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: "power2.out" }
      );

      // Animate form slide up and fade in
      gsap.fromTo(
        formRef.current,
        { y: 50, opacity: 0, scale: 0.9 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "back.out(1.2)" }
      );
    }
  }, [isFormOpen]);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    if (formRef.current && overlayRef.current) {
      gsap.to(formRef.current, {
        y: 50,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => setIsFormOpen(false),
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      });
    } else {
      setIsFormOpen(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to join waitlist");
      }

      // Success - close form and reset
      handleCloseForm();
      setFormData({ name: "", email: "", phone: "" });
      alert("Thank you for joining the waitlist! We'll be in touch soon.");
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to join waitlist. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="balloAds"
      className="min-h-screen text-white py-8 sm:py-14 relative px-4 sm:px-6"
      style={{ background: `url(${background.src})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="flex flex-center flex-col md:flex-row md:px-10 gap-6 sm:gap-10 md:gap-0 max-w-7xl mx-auto">
        <div className="flex justify-center items-center md:items-start flex-col text-center md:text-left gap-6 sm:gap-10 w-full md:w-auto">
          <Image src={appIcon} alt="Ballo Ads" quality={100} className="w-20 sm:w-24 md:w-28" />
          <h2 className="subheading mb-5 leading-[1.1em] text-2xl sm:text-3xl md:text-4xl lg:text-[4.5em] md:text-left px-2 sm:px-0">
            Advertise your brand in only a few seconds.
          </h2>
          <button
            onClick={handleOpenForm}
            className="hidden md:block rounded-full px-8 md:px-12 py-2 md:py-3 bg-[var(--brand-color-4)] text-[var(--brand-color-1)] font-semibold text-xl md:text-2xl hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            Join waitlist
          </button>
        </div>

        <div
          className={`relative w-full flex-center max-w-md md:max-w-none mx-auto ${
            revealPhone ? "reveal-phone" : ""
          }`}
        >
          <Image
            ref={ref}
            src={balloAdsPhone}
            alt="Ballo Ads"
            quality={100}
            className="w-full opacity-100"
            id="phone"
          />

          <Link href="#" className="cursor-pointer">
            <Image
              src={appleStore}
              alt="Available on Apple Store"
              quality={100}
              className="mobile-app-1 opacity-100 absolute top-[48%] left-[10%] w-1/4 sm:w-1/3 rounded-xl"
            />
          </Link>

          <Link href="#" className="cursor-pointer">
            <Image
              src={playStore}
              alt="Available on Paly Store"
              quality={100}
              className="mobile-app-2 opacity-100 absolute top-[62%] left-[10%] w-1/4 sm:w-1/3 rounded-xl"
            />
          </Link>
        </div>

        <button
          onClick={handleOpenForm}
          className="block mt-5 md:hidden rounded-full px-8 sm:px-12 py-2.5 sm:py-3 bg-[var(--brand-color-4)] text-[var(--brand-color-1)] font-semibold text-xl sm:text-2xl md:text-3xl hover:scale-105 transition-transform duration-200 cursor-pointer w-full sm:w-auto"
        >
          Join waitlist
        </button>
      </div>

      {/* Form Modal */}
      {isFormOpen && (
        <>
          <div
            ref={overlayRef}
            onClick={handleCloseForm}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          <div
            ref={formRef}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          >
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
              <button
                onClick={handleCloseForm}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 text-2xl sm:text-3xl font-bold w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer z-10"
                aria-label="Close form"
              >
                ×
              </button>
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--brand-color-1)] mb-2 pr-8">
                Join the Waitlist
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Be the first to know when we launch!
              </p>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-4)] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-4)] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--brand-color-4)] focus:border-transparent outline-none transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-full px-4 sm:px-6 py-2.5 sm:py-3 bg-[var(--brand-color-4)] text-[var(--brand-color-1)] font-semibold text-base sm:text-lg hover:bg-[var(--brand-color-3)] hover:text-white transition-colors duration-200 mt-4 sm:mt-6 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </form>
            </div>
          </div>
        </>
      )}
    </section>
  );
};

export default BalloAdsDemo; 