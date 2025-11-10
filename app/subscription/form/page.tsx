"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type Status = "Active" | "Inactive" | "Unsubscribed" | "Invalid";
type Gender = "Male" | "Female" | "Other" | "PreferNotToSay";

interface FormData {
  // Contact Info (at least one required)
  email: string;
  phoneNumber: string;
  
  // Default Fields
  status: Status;
  optInSMS: boolean;
  optInEmail: boolean;
  optInWhatsApp: boolean;
  
  // Nullable Fields
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender | "";
  country: string;
  province: string;
  city: string;
  town: string;
  subscriptionSource: string;
  referralCode: string;
}

function SubscriptionFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const channelId = searchParams.get("channelId");
  const channelName = searchParams.get("channelName") || "Channel";

  const [formData, setFormData] = useState<FormData>({
    email: "",
    phoneNumber: "",
    status: "Active",
    optInSMS: true,
    optInEmail: true,
    optInWhatsApp: true,
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    country: "",
    province: "",
    city: "",
    town: "",
    subscriptionSource: "Website",
    referralCode: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Check if user has already submitted a form
    const hasSubmitted = localStorage.getItem("balloAds_subscriptionFormSubmitted");
    if (hasSubmitted === "true") {
      // If already submitted, redirect back to subscription page
      router.push("/subscription");
    }
  }, [router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    // At least one contact method is required
    if (!formData.email && !formData.phoneNumber) {
      newErrors.email = "Please provide at least an email or phone number";
      newErrors.phoneNumber = "Please provide at least an email or phone number";
    }

    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation if provided
    if (formData.phoneNumber && !/^[\d\s\-\+\(\)]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Here you would typically send the data to your API
      // For now, we'll just store it in localStorage
      const submissionData = {
        ...formData,
        channelId,
        submittedAt: new Date().toISOString(),
      };

      // Store in localStorage to mark as submitted
      localStorage.setItem("balloAds_subscriptionFormSubmitted", "true");
      localStorage.setItem("balloAds_subscriptionData", JSON.stringify(submissionData));

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Redirect back to subscription page with success message
      router.push(`/subscription?subscribed=true&channelId=${channelId}`);
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrors({ email: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "date" ? value : value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  return (
    <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Complete Your Subscription
          </h1>
          <p className="text-xl text-white/80">
            Subscribe to <span className="font-semibold text-[var(--brand-color-4)]">{channelName}</span>
          </p>
          <p className="text-sm text-white/60 mt-2">
            We need a few details to complete your subscription
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white/5 rounded-3xl p-8 md:p-12 backdrop-blur-sm border border-white/10">
          {/* Contact Info Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[var(--brand-color-4)]">
              Contact Information <span className="text-sm text-white/60 font-normal">(At least one required)</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold mb-2">
                  Email <span className="text-white/60 font-normal">(Optional, unique if provided)</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.email ? "border-red-500" : "border-white/20"
                  } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold mb-2">
                  Phone Number <span className="text-white/60 font-normal">(Optional, unique if provided)</span>
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-white/10 border ${
                    errors.phoneNumber ? "border-red-500" : "border-white/20"
                  } text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]`}
                  placeholder="+260 123 456 789"
                />
                {errors.phoneNumber && (
                  <p className="text-red-400 text-sm mt-1">{errors.phoneNumber}</p>
                )}
              </div>
            </div>
          </section>

          {/* Personal Information Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[var(--brand-color-4)]">
              Personal Information <span className="text-sm text-white/60 font-normal">(Optional)</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="John"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label htmlFor="dateOfBirth" className="block text-sm font-semibold mb-2">
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dateOfBirth"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-semibold mb-2">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="PreferNotToSay">Prefer Not to Say</option>
                </select>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[var(--brand-color-4)]">
              Location <span className="text-sm text-white/60 font-normal">(Optional)</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-sm font-semibold mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Zambia"
                />
              </div>

              <div>
                <label htmlFor="province" className="block text-sm font-semibold mb-2">
                  Province
                </label>
                <input
                  type="text"
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Lusaka"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-semibold mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Lusaka"
                />
              </div>

              <div>
                <label htmlFor="town" className="block text-sm font-semibold mb-2">
                  Town
                </label>
                <input
                  type="text"
                  id="town"
                  name="town"
                  value={formData.town}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Town name"
                />
              </div>
            </div>
          </section>

          {/* Subscription Preferences Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[var(--brand-color-4)]">
              Subscription Preferences
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="optInSMS"
                  name="optInSMS"
                  checked={formData.optInSMS}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-[var(--brand-color-4)] focus:ring-2 focus:ring-[var(--brand-color-4)]"
                />
                <label htmlFor="optInSMS" className="text-sm font-semibold cursor-pointer">
                  Opt-in to SMS notifications (Default: Yes)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="optInEmail"
                  name="optInEmail"
                  checked={formData.optInEmail}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-[var(--brand-color-4)] focus:ring-2 focus:ring-[var(--brand-color-4)]"
                />
                <label htmlFor="optInEmail" className="text-sm font-semibold cursor-pointer">
                  Opt-in to Email notifications (Default: Yes)
                </label>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="optInWhatsApp"
                  name="optInWhatsApp"
                  checked={formData.optInWhatsApp}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-white/20 bg-white/10 text-[var(--brand-color-4)] focus:ring-2 focus:ring-[var(--brand-color-4)]"
                />
                <label htmlFor="optInWhatsApp" className="text-sm font-semibold cursor-pointer">
                  Opt-in to WhatsApp notifications (Default: Yes)
                </label>
              </div>
            </div>
          </section>

          {/* Additional Information Section */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4 text-[var(--brand-color-4)]">
              Additional Information <span className="text-sm text-white/60 font-normal">(Optional)</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="subscriptionSource" className="block text-sm font-semibold mb-2">
                  Subscription Source
                </label>
                <input
                  type="text"
                  id="subscriptionSource"
                  name="subscriptionSource"
                  value={formData.subscriptionSource}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Website, QR Code, etc."
                />
              </div>

              <div>
                <label htmlFor="referralCode" className="block text-sm font-semibold mb-2">
                  Referral Code
                </label>
                <input
                  type="text"
                  id="referralCode"
                  name="referralCode"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[var(--brand-color-4)]"
                  placeholder="Enter referral code"
                />
              </div>
            </div>
          </section>

          {/* Hidden Status Field (defaults to Active) */}
          <input type="hidden" name="status" value={formData.status} />

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
            <Link
              href="/subscription"
              className="px-8 py-4 rounded-xl border-2 border-white/40 bg-transparent text-white font-semibold text-center hover:border-white hover:bg-white/10 transition-all"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-4 rounded-xl gradient-blue-purple text-white font-bold text-lg hover:opacity-90 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Submitting..." : "Complete Subscription"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function SubscriptionFormPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[var(--dark-blue)] text-white py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            <p className="mt-4 text-white/80">Loading form...</p>
          </div>
        </div>
      </main>
    }>
      <SubscriptionFormContent />
    </Suspense>
  );
}

