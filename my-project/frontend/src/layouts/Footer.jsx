import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

const quickLinks = ["Home", "Features", "About", "How It Works", "Hotlines"];
const supportLinks = ["Help Center", "Privacy Policy", "Terms of Service", "Contact Us"];

function Footer() {
  return (
    <footer className="bg-[#2C2C2C] px-[108px] py-14">
      <div className="flex justify-between items-start">
        {/* Logo + description */}
        <div className="flex gap-4 max-w-[340px]">
          <img src={logo} alt="NorthSafe logo" className="h-[60px] w-auto" />
          <div>
            <h3 className="font-inter font-bold text-lg text-white">NORTHSAFE</h3>
            <p className="font-inter text-sm text-gray-400 mt-1">
              Smart Community Hazard Reporting System with AI-Powered Image Classification
            </p>
            <p className="font-inter text-sm text-gray-400 mt-4">
              University of Caloocan City
            </p>
          </div>
        </div>

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

        {/* Copyright */}
        <p className="font-inter text-xs text-gray-400 self-end">
          © 2026 NORTHSAFE. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;