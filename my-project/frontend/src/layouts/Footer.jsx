import { Link } from "react-router-dom";
import { Globe, Phone } from "lucide-react";
import logo from "../assets/logo.png";

const quickLinks = [
  "Home",
  "Features",
  "About",
  "How it Works",
  "Hotlines",
];

const supportLinks = [
  "Help Center",
  "Privacy Policy",
  "Terms of Service",
  "Contact Us",
];

const FacebookIcon = ({ size = 14, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

function Footer() {
  return (
    <footer className="bg-[#3A3A3A] px-6 py-5 sm:px-12 lg:px-[108px]">
      <div className="mx-auto max-w-[1531px]">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">

          {/* Brand */}
          <div className="flex w-full shrink-0 gap-4 md:w-[390px]">
            <div className="h-[134px] w-[95px] shrink-0 overflow-hidden">
              <img
                src={logo}
                alt="NorthSafe icon"
                className="h-[134px] w-auto max-w-none object-cover object-left"
              />
            </div>

            <div className="flex h-[134px] w-[276.82px] flex-col justify-center">
              <h3 className="font-roboto text-2xl font-bold leading-7 text-white">
                NORTHSAFE
              </h3>

              <p className="mt-[10px] font-roboto text-xs font-normal leading-[14px] text-[#CCCCCC]">
                A smart community hazard reporting system with AI-powered image classification
              </p>

              <p className="mt-[10px] font-roboto text-xs font-normal leading-[14px] text-[#BBBBBB]">
                University of Caloocan City
              </p>
            </div>
          </div>

          {/* Right-side content */}
          <div className="flex items-start gap-6 lg:gap-12">

            {/* Quick Links */}
            <div className="w-[110px] shrink-0">
              <h4 className="font-roboto text-sm font-bold leading-4 text-[#CCCCCC]">
                Quick Links
              </h4>

              <ul className="mt-2 space-y-0">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="block font-roboto text-xs font-normal uppercase leading-[18px] tracking-[0.04em] text-[#8F8F8F] transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div className="w-[125px] shrink-0">
              <h4 className="font-roboto text-sm font-bold leading-4 text-[#CCCCCC]">
                Support
              </h4>

              <ul className="mt-2 space-y-0">
                {supportLinks.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="block font-roboto text-xs font-normal leading-[18px] tracking-[0.04em] text-[#8F8F8F] transition-colors duration-150 hover:text-white focus-visible:text-white focus-visible:outline-none"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="w-[283px] shrink-0">
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2">
                  <FacebookIcon
                    size={14}
                    className="shrink-0 text-[#9F9F9F]"
                  />

                  <span className="font-roboto text-xs font-normal leading-[117.3%] tracking-[0.04em] text-[#9F9F9F]">
                    Caloocan City DRRMO
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <Globe
                    size={14}
                    className="shrink-0 text-[#9F9F9F]"
                  />

                  <span className="font-roboto text-xs font-normal leading-[117.3%] tracking-[0.04em] text-[#9F9F9F]">
                    caloocancity.gov.ph
                  </span>
                </li>

                <li className="flex items-center gap-2">
                  <Phone
                    size={14}
                    className="shrink-0 text-[#9F9F9F]"
                  />

                  <span className="font-roboto text-xs font-normal leading-[117.3%] tracking-[0.04em] text-[#9F9F9F]">
                    0917-547-7817
                  </span>
                </li>
              </ul>

              <p className="mt-3 font-roboto text-xs font-normal leading-[117.3%] tracking-[0.04em] text-[#9F9F9F]">
                © 2026 NORTHSAFE. All rights reserved.
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;