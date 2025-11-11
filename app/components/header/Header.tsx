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
    <header className="header header--sticky">
      <nav className="header__nav">
        {/* Logo */}
        <Link href="/" className="header__logo">
          <div className="header__logo-container">
            <div className="header__logo-icon">
              <span className="header__logo-text">b</span>
            </div>
            <span className="header__logo-label">ballo innovations</span>
          </div>
          <span className="header__logo-tagline">REBRANDING THE FUTURE</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="header__nav-desktop">
          {navItems.map((item) => {
            const hasDropdown = item.links && item.links.length > 0;
            const isDropdownOpen = activeDropdown === item.label;

            if (!hasDropdown) {
              return (
                <Link
                  key={item.label}
                  href={item.href ?? "#"}
                  className={`header__nav-link ${
                    item.href && isActive(item.href)
                      ? "header__nav-link--active"
                      : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <div
                key={item.label}
                className="header__nav-dropdown"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href ?? "#"}
                  className={`header__nav-link header__nav-link--with-dropdown ${
                    item.href && isActive(item.href)
                      ? "header__nav-link--active"
                      : ""
                  }`}
                  onFocus={() => setActiveDropdown(item.label)}
                  onBlur={() => setActiveDropdown(null)}
                >
                  {item.label}
                  <svg
                    className={`header__nav-arrow ${
                      isDropdownOpen ? "header__nav-arrow--open" : ""
                    }`}
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
                    className="header__dropdown-menu"
                    onMouseEnter={() => setActiveDropdown(item.label)}
                    onMouseLeave={() => setActiveDropdown(null)}
                  >
                    <div className="header__dropdown-list">
                      {item.links?.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="header__dropdown-link"
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
        </div>

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

        {/* Mobile Menu Button */}
        <button
          className="header__menu-toggle"
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
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="header__mobile-menu">
          <div className="header__mobile-menu-content">
            {navItems.map((item) => {
              const hasDropdown = item.links && item.links.length > 0;
              const isExpanded = activeDropdown === item.label;

              if (!hasDropdown) {
                return (
                  <Link
                    key={item.label}
                    href={item.href ?? "#"}
                    className={`header__mobile-nav-link ${
                      item.href && isActive(item.href)
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
                    className={`header__mobile-dropdown-toggle ${
                      item.href && isActive(item.href)
                        ? "header__mobile-dropdown-toggle--active"
                        : ""
                    }`}
                  >
                    {item.label}
                    <svg
                      className={`header__mobile-dropdown-arrow ${
                        isExpanded ? "header__mobile-dropdown-arrow--open" : ""
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

            <div className="header__mobile-actions">
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
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;

