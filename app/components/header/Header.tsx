"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

type NavLink = {
  label: string;
  href: string;
  description?: string;
};

type NavItem = {
  label: string;
  href?: string;
  links?: NavLink[];
};

const navItems: NavItem[] = [
  {
    label: "Features",
    href: "/features",
    links: [
      { label: "Omnichannel Messaging", href: "/features#omnichannel" },
      { label: "Automations", href: "/features#automations" },
      { label: "Analytics & Reporting", href: "/features#analytics" },
    ],
  },
  {
    label: "How it Works",
    href: "/how-it-works",
    links: [
      { label: "Platform Overview", href: "/how-it-works#overview" },
      { label: "Onboarding Steps", href: "/how-it-works#steps" },
      { label: "AI Insights", href: "/how-it-works#ai" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    links: [
      { label: "Guides", href: "/resources#guides" },
      { label: "FAQs", href: "/resources#faqs" },
      { label: "Professional Services", href: "/resources#services" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    label: "Careers",
    href: "/careers",
    links: [
      { label: "Open Roles", href: "/careers#open-roles" },
      { label: "Life at BalloAds", href: "/careers#culture" },
      { label: "Hiring Process", href: "/careers#process" },
    ],
  },
  {
    label: "Pricing",
    href: "/pricing",
  },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="sticky top-0 z-50 w-full gradient-blue-purple">
      <nav className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex flex-col gap-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
              <span className="text-[var(--brand-color-1)] font-bold text-lg">b</span>
            </div>
            <span className="text-white font-semibold text-lg">ballo innovations</span>
          </div>
          <span className="text-white/70 text-xs ml-10">REBRANDING THE FUTURE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const hasDropdown = item.links && item.links.length > 0;
            const isDropdownOpen = activeDropdown === item.label;

            if (!hasDropdown) {
              return (
                <Link
                  key={item.label}
                  href={item.href ?? "#"}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    item.href && isActive(item.href)
                      ? "bg-[var(--brand-color-4)]/20 text-white"
                      : "text-white hover:text-[var(--brand-color-4)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href ?? "#"}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                    item.href && isActive(item.href)
                      ? "bg-[var(--brand-color-4)]/20 text-white"
                      : "text-white hover:text-[var(--brand-color-4)]"
                  }`}
                  onFocus={() => setActiveDropdown(item.label)}
                  onBlur={() => setActiveDropdown(null)}
                >
                  {item.label}
                  <svg
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </Link>

                {isDropdownOpen && (
                  <div 
                    className="absolute left-1/2 top-full pt-2 w-60 -translate-x-1/2 rounded-2xl bg-white/95 p-4 text-[var(--dark-blue)] shadow-2xl"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="flex flex-col gap-2">
                      {item.links?.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex flex-col gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition hover:bg-[var(--brand-color-4)]/10"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <svg
            className="w-5 h-5 text-white"
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

        {/* Sign In and Sign Up Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="#signin"
            className="text-white px-6 py-2 rounded-lg font-semibold hover:text-[var(--brand-color-4)] transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="#signup"
            className="bg-white text-[var(--brand-color-1)] px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[var(--dark-blue-2)] border-t border-white/20 px-4 py-4">
          <div className="flex flex-col gap-6">
            {navItems.map((item) => {
              const hasDropdown = item.links && item.links.length > 0;
              const isExpanded = activeDropdown === item.label;

              if (!hasDropdown) {
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      item.href && isActive(item.href)
                        ? "bg-[var(--brand-color-4)]/20 text-white"
                        : "text-white hover:text-[var(--brand-color-4)]"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <div key={item.label} className="flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setActiveDropdown((prev) => (prev === item.label ? null : item.label))
                    }
                    className={`flex items-center justify-between rounded-lg px-4 py-3 text-left text-white transition ${
                      item.href && isActive(item.href)
                        ? "bg-[var(--brand-color-4)]/20"
                        : "hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`h-5 w-5 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="ml-4 flex flex-col gap-2">
                      {item.links?.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="rounded-lg px-4 py-2 text-sm text-white/80 transition hover:bg-white/10"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex flex-col gap-3">
              <Link
                href="#signin"
                className="text-white px-6 py-3 rounded-lg font-semibold text-center hover:bg-white/10 transition-colors border border-white/20"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In
              </Link>
              <Link
                href="#signup"
                className="bg-white text-[var(--brand-color-1)] px-6 py-3 rounded-lg font-semibold text-center hover:bg-white/90 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

