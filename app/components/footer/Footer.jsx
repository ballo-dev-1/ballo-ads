import ring from "@/public/elements small/15.png";

import "./footer.css";
import background from "@/public/Backgrounds/hero-bg.png";
import logo from "@/public/Ballo Logo New/Ballo logo new copy white.png";
import Image from "next/image";
import Link from "next/link";

const index = () => {
  return (
    <footer
      id="footer" 
      className="bg-[#0e0e39] flex-center flex-col text-white gap-10 py-5 relative overflow-hidden z-[4]"
    >      
      <span id="footer_" className="absolute -top-20 mb-20" />
      <Image src={ring} alt="Logo" quality={100} className="footer-ring" />
      <div className="absolute h-full w-full bg-gradient-to-b from-transparent via-[#00000094] to-black" />
      <Image
        src={logo}
        alt="Ballo Innovations"
        quality={100}
        className="logo-white w-11/12 md:w-1/3 z-[2]"
      />

      <h2 className="subheading z-[2]">What&apos;s in your Ballo today?</h2>

      <p className="font-semibold text-center z-[2] px-5 md:px-0">
        For more information, contact us by phone, email, or via our social media channels.
      </p>

      <Link
        href="mailto:info@balloinnovations.com"
        className="font-bold border-white border-[3px] rounded-full px-20 md:px-10 py-3 md:py-2 z-[2]"
      >
        Contact Us
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:gap-32 md:pb-10 md:pt-5 z-[2]">
        <div className="flex flex-col justify-between">        
          <Link href="mailto:info@balloinnovations.com" className="md:pt-5 text-center hover:underline">
            info@balloinnovations.com
          </Link>

          <Link href="tel:+260979611334" className="md:pt-5 text-center hover:underline">
            +260979611334
          </Link>

          <div className="flex-center gap-2 pt-5">
            <Link
              target="_"
              href="https://www.facebook.com/profile.php?id=100087875482090&mibextid=LQQJ4d"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z"
                ></path>
              </svg>
            </Link>
            <Link target="_" href="https://wa.me/+260979611334">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.183 8.183 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31c-.22.25-.86.85-.86 2.07c0 1.22.89 2.4 1.01 2.56c.12.17 1.75 2.67 4.23 3.74c.59.26 1.05.41 1.41.52c.59.19 1.13.16 1.56.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.22-.16-.47-.28"
                ></path>
              </svg>
            </Link>
            <Link
              target="_"
              href="https://www.linkedin.com/company/ballo-innovations/"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 16 16"
              >
                <path
                  fill="white"
                  d="M14.5 0h-13C.675 0 0 .675 0 1.5v13c0 .825.675 1.5 1.5 1.5h13c.825 0 1.5-.675 1.5-1.5v-13c0-.825-.675-1.5-1.5-1.5M6 13H4V6h2zM5 5a1 1 0 1 1 0-2a1 1 0 1 1 0 2m8 8h-2V9a1 1 0 1 0-2 0v4H7V6h2v1.241C9.412 6.675 10.044 6 10.75 6C11.994 6 13 7.119 13 8.5z"
                ></path>
              </svg>
            </Link>
            <Link
              target="_"
              href="https://instagram.com/ballo_zm?igshid=YmMyMTA2M2Y="
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="40"
                height="40"
                viewBox="0 0 24 24"
              >
                <path
                  fill="white"
                  d="M17.34 5.46a1.2 1.2 0 1 0 1.2 1.2a1.2 1.2 0 0 0-1.2-1.2m4.6 2.42a7.59 7.59 0 0 0-.46-2.43a4.94 4.94 0 0 0-1.16-1.77a4.7 4.7 0 0 0-1.77-1.15a7.3 7.3 0 0 0-2.43-.47C15.06 2 14.72 2 12 2s-3.06 0-4.12.06a7.3 7.3 0 0 0-2.43.47a4.78 4.78 0 0 0-1.77 1.15a4.7 4.7 0 0 0-1.15 1.77a7.3 7.3 0 0 0-.47 2.43C2 8.94 2 9.28 2 12s0 3.06.06 4.12a7.3 7.3 0 0 0 .47 2.43a4.7 4.7 0 0 0 1.15 1.77a4.78 4.78 0 0 0 1.77 1.15a7.3 7.3 0 0 0 2.43.47C8.94 22 9.28 22 12 22s3.06 0 4.12-.06a7.3 7.3 0 0 0 2.43-.47a4.7 4.7 0 0 0 1.77-1.15a4.85 4.85 0 0 0 1.16-1.77a7.59 7.59 0 0 0 .46-2.43c0-1.06.06-1.4.06-4.12s0-3.06-.06-4.12M20.14 16a5.61 5.61 0 0 1-.34 1.86a3.06 3.06 0 0 1-.75 1.15a3.19 3.19 0 0 1-1.15.75a5.61 5.61 0 0 1-1.86.34c-1 .05-1.37.06-4 .06s-3 0-4-.06a5.73 5.73 0 0 1-1.94-.3a3.27 3.27 0 0 1-1.1-.75a3 3 0 0 1-.74-1.15a5.54 5.54 0 0 1-.4-1.9c0-1-.06-1.37-.06-4s0-3 .06-4a5.54 5.54 0 0 1 .35-1.9A3 3 0 0 1 5 5a3.14 3.14 0 0 1 1.1-.8A5.73 5.73 0 0 1 8 3.86c1 0 1.37-.06 4-.06s3 0 4 .06a5.61 5.61 0 0 1 1.86.34a3.06 3.06 0 0 1 1.19.8a3.06 3.06 0 0 1 .75 1.1a5.61 5.61 0 0 1 .34 1.9c.05 1 .06 1.37.06 4s-.01 3-.06 4M12 6.87A5.13 5.13 0 1 0 17.14 12A5.12 5.12 0 0 0 12 6.87m0 8.46A3.33 3.33 0 1 1 15.33 12A3.33 3.33 0 0 1 12 15.33"
                ></path>
              </svg>
            </Link>
          </div>
        </div>

        <div className="flex items-center flex-col gap-4 md:gap-0">
          <Link href="/" className="md:pt-5 text-center hover:underline">
            Home
          </Link>

          <Link href="/about" className="md:pt-5 text-center hover:underline">
            About
          </Link>

          <Link href="/works" className="md:pt-5 text-center hover:underline">
            Works
          </Link>          
        </div>

        <div className="flex items-center flex-col gap-4 md:gap-0">
          <Link href="/careers" className="md:pt-5 text-center hover:underline">
            Careers
          </Link>

          <Link href="/packages" className="md:pt-5 text-center hover:underline">
            Packages
          </Link>          
        </div>
      </div>
    </footer>
  );
};

export default index;
