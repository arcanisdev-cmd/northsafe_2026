import Button from "../components/Button";
import logo from "../assets/logo.png"; 

const navLinks = ["Home", "Features", "About", "How It Works", "Hotlines"];

function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white h-[82px] flex items-center justify-between px-6 md:px-12 lg:px-20">
      {/* Logo */}
      <img src={logo} alt="NorthSafe logo" className="w-[115px] h-[30.42px]" />

      {/* Nav links */}
      <ul className="hidden md:flex items-center gap-x-8">
        {navLinks.map((link) => (
          <li
            key={link}
            className="font-roboto font-bold text-base text-navy uppercase cursor-pointer hover:text-teal transition-colors"
          >
            {link}
          </li>
        ))}
      </ul>

      {/* Sign In button */}
      <Button variant="navy">Sign In</Button>
    </nav>
  );
}

export default Navbar;