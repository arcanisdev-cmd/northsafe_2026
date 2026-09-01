import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const quickLinks = ["Home", "Features", "About", "How It Works", "Hotlines"];
const supportLinks = ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"];

function Footer() {
  return (
    <footer className="bg-[#2C2C2C] px-6 sm:px-12 lg:px-[108px] pt-8 pb-12">
      <div className="max-w-[1280px] mx-auto">
        {/* Content row: brand + link columns */}
        <div className="flex flex-col md:flex-row justify-between gap-10 md:gap-8">
          {/* Logo + description */}
          <div className="flex gap-4 max-w-[340px]">
            <img src={logo} alt="NorthSafe logo" className="h-[60px] w-auto shrink-0" />
            <div>
              <h3 className="font-inter font-bold text-lg text-white">NORTHSAFE</h3>
              <p className="font-inter text-sm text-gray-400 mt-1">
                Smart Community Hazard Reporting System with AI-Powered Image Classification
              </p>
              <p className="font-inter text-sm text-gray-400 mt-3">
                University of Caloocan City
              </p>
            </div>
          </div>

          {/* Link columns grouped together so they don't drift apart on wide screens */}
          <div className="flex gap-16 sm:gap-24">
            {/* Quick Links */}
            <div>
              <h4 className="font-inter font-bold text-sm text-white">Quick Links</h4>
              <ul className="mt-3 space-y-1.5">
                {quickLinks.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="font-inter text-xs uppercase text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-inter font-bold text-sm text-white">Support</h4>
              <ul className="mt-3 space-y-1.5">
                {supportLinks.map((link) => (
                  <li key={link}>
                    <Link
                      to="/"
                      className="font-inter text-xs text-gray-400 hover:text-white transition-colors"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom row: divider + copyright, anchored directly below content instead of floating */}
        <div className="mt-10 pt-6 border-t border-white/10">
          <p className="font-inter text-xs text-gray-400 text-center md:text-right">
            © 2026 NORTHSAFE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;