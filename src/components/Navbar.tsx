import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Logo from "../assets/logo.jpg";

const Navbar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // ✅ Better active detection (handles nested routes)
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  // ✅ Scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ✅ Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        mobileMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  // ✅ Lock body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
  }, [mobileMenuOpen]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Artists", path: "/artists" },
    { name: "Art Forms", path: "/art-forms" },
    { name: "Events", path: "/events" },
    { name: "Contribute", path: "/contribute" },
    { name: "About", path: "/about"},
    {name: "Artist Login", path: "/artist-login"}
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-md"
          : "bg-white/90 backdrop-blur-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <div className="relative">
              <img
                src={Logo}
                alt="Unearthify"
                className="h-9 sm:h-11 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[#83261D]/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-4 py-2 rounded-full text-sm lg:text-base font-medium transition-all duration-300 group ${
                  isActive(link.path)
                    ? "text-[#83261D]"
                    : "text-gray-700 hover:text-[#83261D]"
                }`}
              >
                {link.name}
                <span
                  className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-[#83261D] transition-all duration-300 ${
                    isActive(link.path) ? "w-4/5" : "w-0 group-hover:w-4/5"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div
          ref={menuRef}
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            mobileMenuOpen ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition ${
                  isActive(link.path)
                    ? "bg-[#83261D]/10 text-[#83261D]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="w-1.5 h-1.5 bg-[#83261D] rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;