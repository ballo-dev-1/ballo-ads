import "./footer.css";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  Circle
} from "lucide-react";
import Image from "next/image";
import logo from "@/public/BalloAds Logo New/BalloAds-logo.png";

// Custom WhatsApp icon as Lucide doesn't have it by default
const WhatsAppIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    stroke="none"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .018 5.394 0 12.03c0 2.119.554 4.188 1.606 6.01L0 24l6.117-1.605a11.803 11.803 0 005.925 1.597h.005c6.632 0 12.028-5.395 12.033-12.03a11.799 11.799 0 00-3.489-8.487" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__grid">
          {/* Logo Section */}
          <div className="footer__logo-section">
            <Link href="/" className="footer__logo-link h-full flex justify-center align-center">
              <Image
                src={logo}
                alt="BalloAds Logo"
                className="footer__logo-img h-full w-auto object-contain"
              />
            </Link>
          </div>

          {/* Information Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Information</h3>
            <ul className="footer__link-list">
              <li><Link href="/features">Features</Link></li>
              <li><Link href="/how-it-works">How it works</Link></li>
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/careers">Careers</Link></li>
            </ul>
          </div>

          {/* Help & Support Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Help & Support</h3>
            <ul className="footer__link-list">
              <li><Link href="/knowledge-base">Knowledge Base</Link></li>
              <li><Link href="/live-chat">Live Chat</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link href="/resources">Resources</Link></li>
              <li><Link href="/whats-new">What&apos;s New</Link></li>
            </ul>
          </div>

          {/* Our Socials Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Our Socials</h3>
            <div className="footer__socials-grid">
              <Link href="#" className="footer__social-icon"><Facebook size={24} fill="white" stroke="none" /></Link>
              <Link href="#" className="footer__social-icon"><WhatsAppIcon className="w-6 h-6 text-white" /></Link>
              <Link href="#" className="footer__social-icon"><Linkedin size={24} fill="white" stroke="none" /></Link>
              <Link href="#" className="footer__social-icon"><Instagram size={24} stroke="white" strokeWidth={2} /></Link>
            </div>
          </div>

          {/* Contact Us Column */}
          <div className="footer__column">
            <h3 className="footer__column-title">Contact us</h3>
            <div className="footer__contact-info">
              <div className="footer__contact-item">
                <div className="footer__contact-icon-wrapper">
                  <Phone size={14} className="footer__contact-icon-inner" />
                </div>
                <span>+260979611334</span>
              </div>
              <div className="footer__contact-item">
                <div className="footer__contact-icon-wrapper">
                  <Mail size={14} className="footer__contact-icon-inner" />
                </div>
                <span>hello@balloads.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
