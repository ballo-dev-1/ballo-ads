import "./footer.css";
import logo from "@/public/Assets/1.png" 
import Image from "next/image";
import Link from "next/link";

const index = () => {
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
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
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
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
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
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {new Date().getFullYear()} Ballo Ads. All rights reserved.
          </p>
          <div className="footer__bottom-links">
            <Link href="/terms" className="footer__bottom-link">Terms</Link>
            <Link href="/privacy" className="footer__bottom-link">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default index;
