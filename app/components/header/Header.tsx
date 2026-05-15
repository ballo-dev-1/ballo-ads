"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import logo_1 from "@/public/BalloAds Logo New/BalloAds-logo.png"
import logo_2 from "@/public/BalloAds Logo New/BalloAds-logo-full.png"

type NavLink = {
  label: string;
  href: string;
  description?: string;
  subLinks?: { label: string; href: string }[];
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
      { label: "Bulk SMS", href: "/features#omnichannel" },
      { label: "WhatsApp Marketing ", href: "/features#automations" },
      { label: "Email Marketing", href: "/features#analytics" },
      { label: "Brutus AI", href: "/brutus" },
    ],
  },

  {
    label: "How it Works",
    href: "/how-it-works",
    links: [
      { label: "Platform Overview", href: "/how-it-works#overview" },
      { label: "For My Business", href: "/business" },
    ],
  },

  {
    label: "Resources",
    href: "/resources",
    links: [
      { label: "Guides", href: "/resources#guides" },
      { label: "API Docs", href: "/resources/api" },
      { label: "FAQs", href: "/resources#faqs" },
      { label: "Professional Services", href: "/resources#services" },
      { label: "Blog", href: "/blog" },
      {
        label: "Developers",
        href: "/api",
        subLinks: [
          { label: "SMS API", href: "/api/sms-api" },
          { label: "Email API", href: "/api/email-api" },
          { label: "WhatsApp API", href: "/api/whatsapp-api" },
        ],
      },

    ],
  },

  {
    label: "Blog",
    href: "/blog",
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
  const { scrollY } = useScroll();
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = lastScrollY.current;
    if (latest > previous && latest > 80) {
      setIsHidden(true);
    } else if (latest < previous) {
      setIsHidden(false);
    }
    lastScrollY.current = latest;
  });

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const isActive = (path: string) => pathname === path;

  // Hide the public site header on admin routes, which have their own layout/nav
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="header header--sticky">
      <motion.nav
        variants={{
          visible: { y: 0, x: "-50%" },
          hidden: { y: "-130%", x: "-50%" },
        }}
        animate={isHidden ? "hidden" : "visible"}
        initial="visible"
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="header__nav bg-[#010128] fixed w-[95vw] min-w-[380px] max-w-[1440px] h-16 md:flex mx-0 ring ring-[#446dd334] mt-2 top-4 left-1/2 data-text-bright:**:text-white shadow rounded-full p-4 overflow-hidden"
        style={{ zIndex: 100 }}
      >
        {/* ── Ribbon background layers ── */}
        {/* Main ribbon — right end (mirrors left) */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{
            rotate: [18, 13, 20, 15, 18],
            y: [0, -7, -3, -9, 0],
            scaleX: [1, 1.04, 1, 0.96, 1],
            borderRadius: [
              "40% 60% 55% 45% / 50% 40% 60% 50%",
              "44% 56% 50% 50% / 54% 44% 56% 46%",
              "38% 62% 58% 42% / 48% 42% 58% 52%",
              "42% 58% 52% 48% / 52% 46% 54% 48%",
              "40% 60% 55% 45% / 50% 40% 60% 50%",
            ],
          }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
          style={{
            width: "130px",
            height: "200px",
            right: "-50px",
            top: "-110px",
            background: "linear-gradient(340deg, rgba(37,99,235,0.45) 0%, rgba(10,30,120,0.35) 50%, rgba(2,6,30,0.85) 100%)",
            boxShadow: "inset 8px 8px 20px rgba(255,255,255,0.05), inset -14px -14px 36px rgba(0,0,0,0.5)",
            filter: "blur(2px)",
          }}
        />
        {/* Rim light — right end */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{
            rotate: [18, 13, 20, 15, 18],
            y: [0, -7, -3, -9, 0],
            opacity: [0.75, 1, 0.65, 1, 0.75],
          }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity }}
          style={{
            width: "8px",
            height: "90px",
            right: "52px",
            top: "2px",
            borderRadius: "50%",
            background: "linear-gradient(180deg, rgba(80,160,255,0.65) 0%, rgba(40,100,255,0.18) 70%, transparent 100%)",
            filter: "blur(5px)",
          }}
        />
        {/* Secondary ribbon — left end */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{
            rotate: [-18, -13, -20, -15, -18],
            y: [0, 7, 3, 9, 0],
            scaleX: [1, 0.96, 1, 1.04, 1],
            borderRadius: [
              "40% 60% 55% 45% / 50% 40% 60% 50%",
              "44% 56% 50% 50% / 54% 44% 56% 46%",
              "38% 62% 58% 42% / 48% 42% 58% 52%",
              "42% 58% 52% 48% / 52% 46% 54% 48%",
              "40% 60% 55% 45% / 50% 40% 60% 50%",
            ],
          }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
          style={{
            width: "130px",
            height: "200px",
            left: "-50px",
            bottom: "-110px",
            background: "linear-gradient(160deg, rgba(37,99,235,0.45) 0%, rgba(10,30,120,0.35) 50%, rgba(2,6,30,0.85) 100%)",
            boxShadow: "inset 8px 8px 20px rgba(255,255,255,0.05), inset -14px -14px 36px rgba(0,0,0,0.5)",
            filter: "blur(2px)",
          }}
        />
        {/* Secondary rim light */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{
            rotate: [-18, -13, -20, -15, -18],
            y: [0, 7, 3, 9, 0],
            opacity: [0.75, 1, 0.65, 1, 0.75],
          }}
          transition={{ duration: 12, ease: "easeInOut", repeat: Infinity, delay: 1.5 }}
          style={{
            width: "8px",
            height: "90px",
            left: "52px",
            bottom: "2px",
            borderRadius: "50%",
            background: "linear-gradient(0deg, rgba(80,160,255,0.65) 0%, rgba(40,100,255,0.18) 70%, transparent 100%)",
            filter: "blur(5px)",
          }}
        />

        {/* Mid silk wrinkle 1 — narrow diagonal fold, single fine crease */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [14, 19, 16, 11, 14], y: [0, -7, -3, -9, 0], opacity: [0.6, 0.75, 0.5, 0.68, 0.6] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
          style={{
            width: "240px", height: "200px",
            left: "calc(28% - 120px)", top: "-110px",
            background: "linear-gradient(135deg, transparent 0%, rgba(37,99,235,0.04) 14%, rgba(70,130,255,0.11) 37%, rgba(100,170,255,0.15) 50%, rgba(70,130,255,0.11) 63%, rgba(37,99,235,0.04) 86%, transparent 100%)",
            filter: "blur(12px)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [14, 19, 16, 11, 14], y: [0, -7, -3, -9, 0], opacity: [0.18, 0.28, 0.13, 0.22, 0.18] }}
          transition={{ duration: 14, ease: "easeInOut", repeat: Infinity, delay: 0.5 }}
          style={{
            width: "3px", height: "80px",
            left: "calc(28% - 2px)", top: "50%", marginTop: "-40px",
            background: "linear-gradient(180deg, transparent 0%, rgba(160,210,255,0.65) 35%, rgba(120,190,255,0.5) 65%, transparent 100%)",
            borderRadius: "50%", filter: "blur(2px)",
          }}
        />

        {/* Mid silk wrinkle 2 — wide shallow double-fold, broad soft crease */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [-10, -6, -12, -8, -10], y: [0, 5, 2, 7, 0], opacity: [0.55, 0.7, 0.45, 0.62, 0.55] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, delay: 1.8 }}
          style={{
            width: "300px", height: "160px",
            left: "calc(68% - 150px)", bottom: "-100px",
            background: "linear-gradient(165deg, transparent 0%, rgba(37,99,235,0.04) 12%, rgba(70,130,255,0.09) 28%, rgba(100,170,255,0.12) 36%, rgba(50,90,200,0.04) 50%, rgba(80,140,255,0.1) 64%, rgba(100,170,255,0.11) 72%, rgba(37,99,235,0.04) 88%, transparent 100%)",
            filter: "blur(8px)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [-10, -6, -12, -8, -10], y: [0, 5, 2, 7, 0], opacity: [0.14, 0.22, 0.1, 0.18, 0.14] }}
          transition={{ duration: 18, ease: "easeInOut", repeat: Infinity, delay: 1.8 }}
          style={{
            width: "8px", height: "50px",
            left: "calc(68% - 4px)", top: "50%", marginTop: "-25px",
            background: "linear-gradient(180deg, transparent 0%, rgba(140,200,255,0.55) 40%, rgba(110,180,255,0.4) 60%, transparent 100%)",
            borderRadius: "40%", filter: "blur(3px)",
          }}
        />

        {/* Mid silk wrinkle 3 — tall thin vertical-ish crumple, bottom edge, ~45% */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [6, 2, 8, 4, 6], y: [0, 6, 2, 8, 0], opacity: [0.5, 0.65, 0.42, 0.58, 0.5] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 3.2 }}
          style={{
            width: "160px", height: "230px",
            left: "calc(45% - 80px)", bottom: "-130px",
            background: "linear-gradient(120deg, transparent 0%, rgba(37,99,235,0.03) 18%, rgba(60,110,240,0.08) 40%, rgba(90,150,255,0.12) 52%, rgba(60,110,240,0.08) 64%, rgba(37,99,235,0.03) 82%, transparent 100%)",
            filter: "blur(14px)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [6, 2, 8, 4, 6], y: [0, 6, 2, 8, 0], opacity: [0.12, 0.2, 0.08, 0.16, 0.12] }}
          transition={{ duration: 22, ease: "easeInOut", repeat: Infinity, delay: 3.2 }}
          style={{
            width: "2px", height: "60px",
            left: "calc(45% - 1px)", top: "50%", marginTop: "-30px",
            background: "linear-gradient(180deg, transparent 0%, rgba(150,205,255,0.6) 40%, rgba(110,175,255,0.45) 60%, transparent 100%)",
            borderRadius: "50%", filter: "blur(1.5px)",
          }}
        />

        {/* Mid silk wrinkle 4 — compact steep fold, top edge, ~83% */}
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [20, 25, 18, 23, 20], y: [0, -5, -2, -7, 0], opacity: [0.58, 0.72, 0.48, 0.65, 0.58] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, delay: 2.5 }}
          style={{
            width: "190px", height: "180px",
            left: "calc(83% - 95px)", top: "-105px",
            background: "linear-gradient(148deg, transparent 0%, rgba(37,99,235,0.05) 16%, rgba(80,140,255,0.13) 42%, rgba(110,175,255,0.14) 55%, rgba(37,99,235,0.04) 78%, transparent 100%)",
            filter: "blur(9px)",
          }}
        />
        <motion.div
          aria-hidden="true"
          className="absolute pointer-events-none"
          animate={{ rotate: [20, 25, 18, 23, 20], y: [0, -5, -2, -7, 0], opacity: [0.16, 0.25, 0.11, 0.2, 0.16] }}
          transition={{ duration: 16, ease: "easeInOut", repeat: Infinity, delay: 2.5 }}
          style={{
            width: "5px", height: "65px",
            left: "calc(83% - 2px)", top: "50%", marginTop: "-32px",
            background: "linear-gradient(180deg, transparent 0%, rgba(155,208,255,0.6) 38%, rgba(115,182,255,0.44) 62%, transparent 100%)",
            borderRadius: "50%", filter: "blur(2.5px)",
          }}
        />

        {/* Logo */}
        <Link href="/" className="header__logo relative z-10">
          <div className="header__logo-container">
            <div className="header__logo-icon flex">
              <Image
                src={logo_1}
                alt="BalloAds App"
                width={300}
                height={80}
                className="header__logo-image w-auto h-[3rem]"
                priority
              />
              <Image
                src={logo_2}
                alt="BalloAds App"
                width={300}
                height={80}
                className="header__logo-image w-full h-auto ml-[-1.5rem]"
                priority
              />
            </div>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="header__nav-desktop relative z-10">
          {/*Inside your Header component, within the desktop navigation map:*/}

          {navItems.map((item) => {
            const hasDropdown = item.links && item.links.length > 0;
            const isDropdownOpen = activeDropdown === item.label;

            if (!hasDropdown) {
              return (
                <Link key={item.label} href={item.href ?? "#"} className="header__nav-link">
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="header__nav-dropdown group"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href ?? "#"}
                  className={`header__nav-link header__nav-link--with-dropdown ${isDropdownOpen ? "header__nav-link--active" : ""
                    }`}
                >
                  {item.label}
                  {/* Your existing SVG arrow */}
                </Link>

                {isDropdownOpen && (
                  <div style={{ width: 'auto' }} className={`header__dropdown-menu ${item.label === "Resources" ? "header__dropdown-menu--mega" : ""}`}>
                    <div className={`${item.label === "Resources" ? "flex w-[500px]" : "header__dropdown-list"}`}>

                      {/* Left Column: Primary Links */}
                      <div className={`${item.label === "Resources" ? "w-1/2 p-4 border-r border-[var(--dark-blue)]" : ""}`}>
                        {item.links?.map((link) => {
                          // Check if this specific link (like "Developers") has its own sub-links
                          const hasSubLinks = link.label === "Developers";

                          return (
                            <div key={link.href} className="group/sub relative">
                              <Link
                                href={link.href}
                                className="flex items-center justify-between p-3 text-[var(--dark-blue)] hover:bg-white/10 rounded-xl transition"
                              >
                                <span className="font-bold">{link.label}</span>
                              </Link>

                              {/* Right Column: API Sub-links (Only for Developers on hover) */}
                              {hasSubLinks && (
                                <div className="absolute left-full top-[-16px] h-[calc(100%+32px)] w-full pl-6 hidden group-hover/sub:flex flex-col justify-center gap-4 bg-transparent">
                                  <Link href="/developers/sms-api" className="text-[var(--dark-blue)] hover:text-white transition whitespace-nowrap">SMS API</Link>
                                  <Link href="/developers/email-api" className="text-[var(--dark-blue)] hover:text-white transition whitespace-nowrap">Email API</Link>
                                  <Link href="/developers/whatsapp-api" className="text-[var(--dark-blue)] hover:text-white transition whitespace-nowrap">WhatsApp API</Link>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Empty Right Column Placeholder for non-hover state */}
                      {item.label === "Resources" && <div className="w-1/2" />}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-5 relative z-10">
          <svg
            className="header__search-icon"
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

          {/* Sign In and Sign Up Buttons */}
          <div className="header__actions">
            <Link
              href="#signin"
              className="header__action-link header__action-link--signin"
            >
              Sign In
            </Link>
            <Link
              href="#signup"
              className="header__action-link header__action-link--signup"
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="header__menu-toggle relative z-10"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="header__menu-icon"
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
      </motion.nav>

      {/* Mobile Menu — Slide-in Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              style={{ zIndex: 150 }}
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer Panel */}
            <motion.div
              key="mobile-drawer"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, mass: 0.9 }}
              className="fixed top-0 right-0 h-full flex flex-col bg-[#010128]"
              style={{ zIndex: 200, width: "min(82vw, 340px)" }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Image
                    src={logo_2}
                    alt="BalloAds"
                    width={150}
                    height={40}
                    className="header__logo-image h-8 w-auto"
                    priority
                  />
                </Link>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
                  aria-label="Close menu"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Nav items */}
              <div className="flex-1 overflow-y-auto">
                <div className="header__mobile-menu-content px-4 py-4">
                  {navItems.map((item) => {
                    const hasDropdown = item.links && item.links.length > 0;
                    const isExpanded = activeDropdown === item.label;

                    if (!hasDropdown) {
                      return (
                        <Link
                          key={item.label}
                          href={item.href ?? "#"}
                          className={`header__mobile-nav-link ${item.href && isActive(item.href)
                            ? "header__mobile-nav-link--active"
                            : ""
                            }`}
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {item.label}
                        </Link>
                      );
                    }

                    return (
                      <div key={item.label} className="header__mobile-dropdown">
                        <button
                          type="button"
                          onClick={() =>
                            setActiveDropdown((prev) => (prev === item.label ? null : item.label))
                          }
                          className={`header__mobile-dropdown-toggle ${item.href && isActive(item.href)
                            ? "header__mobile-dropdown-toggle--active"
                            : ""
                            }`}
                        >
                          {item.label}
                          <svg
                            className={`header__mobile-dropdown-arrow ${isExpanded ? "header__mobile-dropdown-arrow--open" : ""
                              }`}
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
                          <div className="header__mobile-dropdown-content">
                            {item.links?.map((link) => (
                              <Link
                                key={link.href}
                                href={link.href}
                                className="header__mobile-dropdown-link"
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
                </div>
              </div>

              {/* CTA buttons */}
              <div className="header__mobile-actions px-5 py-6 border-t border-white/10 shrink-0">
                <Link
                  href="#signin"
                  className="header__mobile-action-link header__mobile-action-link--signin"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="#signup"
                  className="header__mobile-action-link header__mobile-action-link--signup"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;

