/* eslint-disable @typescript-eslint/no-explicit-any */
import { Mail, Facebook, Instagram, Twitter, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.jpg";
import { useEffect, useState } from "react";
import axios from "axios";
import { slugify } from "@/utils/slug";

const Footer = () => {
  const [latestCategories, setLatestCategories] = useState<any[]>([]);
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      icon: Facebook,
      url: "https://www.facebook.com/unearthify",
    },
    {
      icon: Instagram,
      url: "https://www.instagram.com/unearthifyart/",
    },
    {
      icon: Twitter,
      url: "https://x.com/unearthify",
    },
  ];

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        const sorted = (res.data.data || [])
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          )
          .slice(0, 3);

        setLatestCategories(sorted);
      })
      .catch((err) => console.error("Category fetch error", err));
  }, []);

  return (
    <footer className="bg-gradient-to-br from-[#83261D] via-[#9a2f24] to-[#b84c3f] text-white rounded-t-2xl overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Main Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* About */}
          <div className="lg:col-span-4">
            <img
              src={Logo}
              alt="Unearthify"
              className="h-10 sm:h-12 w-auto mb-4"
            />
            <p className="text-white/80 text-sm sm:text-base leading-relaxed max-w-md">
              Celebrating and preserving the rich heritage of Indian art forms
              and the talented artists who bring them to life.
            </p>
            <div className="flex items-center gap-2 mt-4 text-white/60 text-sm">
              <Heart size={14} className="text-amber-300 animate-pulse" />
              <span>Preserving heritage since 2024</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {[
                { name: "Artists", path: "/artists" },
                { name: "Art Forms", path: "/art-forms" },
                { name: "Events", path: "/events" },
                { name: "Contribute", path: "/contribute" },
              ].map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/70 hover:text-white text-sm sm:text-base transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Art Forms */}
          <div className="lg:col-span-2">
            <h3 className="text-base sm:text-lg font-semibold mb-4">
              Art Forms
            </h3>
            <ul className="space-y-2">
              {latestCategories.map((cat) => (
                <li key={cat._id}>
                  <Link
                    to={`/artform/${slugify(cat.name)}`}
                    className="text-white/70 hover:text-white text-sm sm:text-base transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-4">
            <h3 className="text-base sm:text-lg font-semibold mb-4">Connect</h3>

            <div className="mb-5">
              <a
                href="mailto:unearthify@gmail.com"
                className="text-white/70 hover:text-white text-sm sm:text-base flex items-center gap-2 transition-colors break-all">
                <Mail size={18} />
                unearthify@gmail.com
              </a>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="social link"
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white hover:text-[#83261D] flex items-center justify-center transition-all duration-300 active:scale-95">
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-10 pt-6 text-center text-white/60 text-xs sm:text-sm">
          <p>
            © {currentYear} Unearthify. Preserving Indian art and culture with
            love.
          </p>
        </div>
      </div>

      <style>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
