import { Link } from "react-router-dom";
import { Globe, Phone } from "lucide-react";
import logo from "../assets/logo.png";

const quickLinks = ["Home", "Features", "About", "How it Works", "Hotlines"];
const supportLinks = ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"];

const FacebookIcon = ({ size = 14, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
  </svg>
);

function Footer() {
  return (
    <footer className="bg-[#3a3a3a] px-6 sm:px-12 lg:px-[108px] py-8">
      <div className="max-w-[1531px] mx-auto">
        <div className="flex flex-col md:flex-row md:justify-between gap-10">
          {/* Brand */}
          <div className="flex gap-4 w-full md:w-[390px] shrink-0">
            <div className="w-[95px] h-[134px] overflow-hidden shrink-0">
              <img
                src={logo}
                alt="NorthSafe icon"
                className="h-[134px] w-auto max-w-none object-cover object-left"
              />
            </div>
            <div className="w-[276.82px]">
              <h3 className="font-roboto font-bold text-2xl leading-7 text-white">
                NORTHSAFE
              </h3>
              <p className="font-roboto font-normal text-xs leading-[14px] text-[#CCCCCC] mt-[10px]">
                A smart community hazard reporting system with AI-powered image classification
              </p>
              <p className="font-roboto font-normal text-xs leading-[14px] text-[#BBBBBB] mt-[10px]">
                University of Caloocan City
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="w-[110px] shrink-0">
            <h4 className="font-roboto font-bold text-sm leading-4 text-[#CCCCCC] whitespace-nowrap">
              Quick Links
            </h4>
            <ul className="mt-[10px] space-y-1.5">
              {quickLinks.map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="font-roboto font-normal text-xs uppercase leading-[133%] tracking-[0.04em] text-[#8f8f8f] hover:text-white transition-colors whitespace-nowrap"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div className="w-[125px] shrink-0">
            <h4 className="font-roboto font-bold text-sm leading-4 text-[#CCCCCC] whitespace-nowrap">
              Support
            </h4>
            <ul className="mt-[10px] space-y-1.5">
              {supportLinks.map((link) => (
                <li key={link}>
                  <Link
                    to="/"
                    className="font-roboto font-normal text-xs leading-[170%] tracking-[0.04em] text-[#8f8f8f] hover:text-white transition-colors whitespace-nowrap"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact / Social */}
          <div className="w-full md:w-[283.03px] shrink-0">
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <FacebookIcon size={14} className="text-[#9f9f9f] shrink-0" />
                <span className="font-roboto font-normal text-xs leading-[117.3%] tracking-[0.04em] text-[#9f9f9f]">
                  Caloocan City DRRMO
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={14} className="text-[#9f9f9f] shrink-0" />
                <span className="font-roboto font-normal text-xs leading-[117.3%] tracking-[0.04em] text-[#9f9f9f]">
                  caloocancity.gov.ph
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-[#9f9f9f] shrink-0" />
                <span className="font-roboto font-normal text-xs leading-[117.3%] tracking-[0.04em] text-[#9f9f9f]">
                  0917-547-7817
                </span>
              </li>
            </ul>
            <p className="font-roboto font-normal text-xs leading-[117.3%] tracking-[0.04em] text-[#9f9f9f] mt-4">
              © 2026 NORTHSAFE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;