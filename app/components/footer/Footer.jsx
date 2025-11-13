import Link from "next/link";
import Image from "next/image";
import logo from "@/public/Assets/1.png" 

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo on Left */}
          <div className="footer__logo-section">
            <div className="footer__logo-wrapper">
              {/* Stylized 'b' or 'is' logo with glowing cyan line */}
              <Image
                    src={logo}
                    alt="BalloAds App"
                    width={300}
                    height={600}
                    className="w-full h-auto absolute right-0 bottom-0 scale-[2.5]"
                  />
            </div>
          </div>

          {/* Information Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Information</h3>
            <ul className="footer__link-list">
              <li>
                <Link
                  href="/features"
                  className="footer__link"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="footer__link"
                >
                  How it works
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="footer__link"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="footer__link"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="footer__link"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="footer__link"
                >
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Help & Support Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Help & Support</h3>
            <ul className="footer__link-list">
              <li>
                <Link
                  href="/knowledge-base"
                  className="footer__link"
                >
                  Knowledge Base
                </Link>
              </li>
              <li>
                <Link
                  href="/live-chat"
                  className="footer__link"
                >
                  Live Chat
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="footer__link"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="footer__link"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/whats-new"
                  className="footer__link"
                >
                  What&apos;s New
                </Link>
              </li>
            </ul>
          </div>

          {/* Our Socials Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Our Socials</h3>
            <div className="footer__socials">
              <Link
                href="https://www.facebook.com/profile.php?id=100087875482090&mibextid=LQQJ4d"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="Facebook"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z" />
                </svg>
              </Link>
              <Link
                href="https://wa.me/+260979611334"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="WhatsApp"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28" />
                </svg>
              </Link>
              <Link
                href="https://www.linkedin.com/company/ballo-innovations/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="white"
                >
                  <path d="M14.5 0h-13C.675 0 0 .675 0 1.5v13c0 .825.675 1.5 1.5 1.5h13c.825 0 1.5-.675 1.5-1.5v-13c0-.825-.675-1.5-1.5-1.5M6 13H4V6h2zM5 5a1 1 0 1 1 0-2a1 1 0 1 1 0 2m8 8h-2V9a1 1 0 1 0-2 0v4H7V6h2v1.241C9.412 6.675 10.044 6 10.75 6C11.994 6 13 7.119 13 8.5z" />
                </svg>
              </Link>
              <Link
                href="https://instagram.com/ballo_zm?igshid=YmMyMTA2M2Y="
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label="Instagram"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2m4.6 2.42a7.59 7.59 0 0 0-.46-2.43a4.94 4.94 0 0 0-1.16-1.77a4.7 4.7 0 0 0-1.77-1.15a7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47a4.78 4.78 0 0 0-1.77 1.15a4.7 4.7 0 0 0-1.15 1.77a7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43a4.7 4.7 0 0 0 1.15 1.77a4.78 4.78 0 0 0 1.77 1.15a7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47a4.7 4.7 0 0 0 1.77-1.15a4.85 4.85 0 0 0 1.16-1.77a7.59 7.59 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12M20.14 16a5.61 5.61 0 0 1-.34 1.86a3.06 3.06 0 0 1-.75 1.15a3.19 3.19 0 0 1-1.15.75a5.61 5.61 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.73 5.73 0 0 1-1.94-.3a3.27 3.27 0 0 1-1.1-.75a3 3 0 0 1-.74-1.15a5.54 5.54 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.54 5.54 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.14 3.14 0 0 1 1.1-.8A5.73 5.73 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.61 5.61 0 0 1 1.86.34a3.06 3.06 0 0 1 1.19.8a3.06 3.06 0 0 1 .75 1.1a5.61 5.61 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4M12 6.87A5.13 5.13 0 1 0 17.14 12A5.12 5.12 0 0 0 12 6.87m0 8.46A3.33 3.33 0 1 1 15.33 12A3.33 3.33 0 0 1 12 15.33" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Contact us Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Contact us</h3>
            <ul className="footer__contact-list">
              <li className="footer__contact-item">
                <div className="footer__contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
                  </svg>
                </div>
                <Link
                  href="tel:+260979611334"
                  className="footer__contact-link"
                >
                  +260979611334
                </Link>
              </li>
              <li className="footer__contact-item">
                <div className="footer__contact-icon">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="white"
                  >
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2m0 4l-8 5-8-5V6l8 5 8-5z" />
                  </svg>
                </div>
                <Link
                  href="mailto:hello@balloads.com"
                  className="footer__contact-link"
                >
                  hello@balloads.com
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
