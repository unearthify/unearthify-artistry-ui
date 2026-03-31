/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { slugify } from "@/utils/slug";
import { Palette, ArrowRight, Eye, Search, ImageIcon } from "lucide-react";

/* ================= READ MORE ================= */
const ReadMoreText = ({ text, onReadMore }: any) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setOverflow(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [text]);

  return (
    <div className="min-h-[4rem] xs:min-h-[4.2rem] sm:min-h-[4.5rem]">
      <p
        ref={ref}
        className="text-xs xs:text-sm text-gray-600 line-clamp-3 leading-relaxed">
        {text}
      </p>

      {overflow && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore();
          }}
          className="text-xs xs:text-sm font-semibold mt-0.5 xs:mt-1 text-[#83261D] hover:text-[#83261D]/80 hover:underline transition-colors inline-flex items-center gap-0.5 xs:gap-1">
          Read more
        </button>
      )}
    </div>
  );
};

/* ================= IMAGE WITH FALLBACK ================= */
const ArtFormImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Generate a consistent color based on the alt text for the fallback
  const getFallbackColor = (text: string) => {
    const colors = [
      'from-[#83261D] to-[#B45F4A]',
      'from-[#2D6A4F] to-[#40916C]',
      'from-[#7B2CBF] to-[#9D4EDD]',
      'from-[#E85D04] to-[#F48C06]',
      'from-[#03045E] to-[#023E8A]',
      'from-[#9A031E] to-[#BF4343]',
    ];
    const index = text.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (imageError || !src) {
    return (
      <div className={`${className} bg-gradient-to-br ${getFallbackColor(alt)} flex flex-col items-center justify-center p-4 text-white`}>
        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 opacity-50" />
        <span className="text-xs sm:text-sm font-medium text-center opacity-75">{alt}</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

/* ================= PAGE ================= */
const ArtForms = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        setCategories(res.data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Category fetch error", err);
        setLoading(false);
      });
  }, []);

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.substring(1) : path;
    return `${import.meta.env.VITE_API_URL}/${clean}`;
  };

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
      <Navbar />

      {/* ================= HERO SECTION - Responsive ================= */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-12 sm:py-16 md:py-20 overflow-hidden">
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Floating Elements - Hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none hidden sm:block">
          {["🎨", "🖼️", "🎭", "🪔", "✨"].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-white/5 text-5xl md:text-7xl animate-float"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${i * 2}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}>
              {emoji}
            </div>
          ))}
        </div>

        <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6 relative z-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Palette className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                Indian Artistic Heritage
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              Indian Art Forms
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed mb-6 sm:mb-8 md:mb-10">
              Discover India's diverse artistic heritage — a blend of culture,
              tradition, and creativity passed down through generations.
            </p>

            {/* Search Bar - Responsive */}
            <div className="relative max-w-xl">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search art forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base rounded-full border-0 focus:ring-2 focus:ring-white/50 bg-white/95 backdrop-blur-sm shadow-2xl"
              />
            </div>

            {/* Result count */}
            <p className="text-white/70 text-xs sm:text-sm mt-2 sm:mt-4">
              Showing {filteredCategories.length} art form
              {filteredCategories.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Curved bottom edge */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 60"
            className="w-full h-auto"
            preserveAspectRatio="none">
            <path
              fill="#ffffff"
              d="M0,0 C480,40 960,40 1440,0 L1440,60 L0,60 Z"></path>
          </svg>
        </div>
      </section>

      {/* ================= GRID SECTION - Responsive Grid ================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        {loading ? (
          /* Loading Skeletons - Responsive Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-3 sm:p-4 animate-pulse">
                <div className="h-40 sm:h-44 md:h-48 lg:h-52 bg-gray-200 rounded-lg sm:rounded-xl mb-3 sm:mb-4"></div>
                <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-2 sm:mb-3"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-full mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mb-1 sm:mb-2"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-12 sm:py-16 md:py-20">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 opacity-30">🎨</div>
            <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-1 sm:mb-2">
              No art forms found
            </h3>
            <p className="text-sm sm:text-base text-gray-500">Try adjusting your search</p>
          </div>
        ) : (
          /* Responsive Grid - Changes columns based on screen size */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {filteredCategories.map((cat, index) => (
              <div
                key={cat._id || index}
                className="animate-fade-in-up h-full"
                style={{ animationDelay: `${index * 0.08}s` }}>
                <div
                  onClick={() => navigate(`/artform/${slugify(cat.name)}`)}
                  className="group cursor-pointer bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 h-full flex flex-col hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98]">
                  
                  {/* IMAGE CONTAINER - Using object-cover */}
                  <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52 flex-shrink-0 overflow-hidden bg-gray-100">
                    <ArtFormImage
                      src={getImageUrl(cat.image || cat.categoryImage)}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#83261D]/60 via-[#83261D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  </div>

                  {/* CONTENT - Responsive padding */}
                  <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
                    {/* Title */}
                    <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 mb-1.5 sm:mb-2 line-clamp-1 min-h-[1.5rem] sm:min-h-[2rem] group-hover:text-[#83261D] transition-colors duration-300">
                      {cat.name}
                    </h2>

                    {/* Description */}
                    <div className="flex-1">
                      <ReadMoreText
                        text={cat.description}
                        onReadMore={() => setSelectedCategory(cat)}
                      />
                    </div>

                    {/* Explore Link */}
                    <div className="flex items-center justify-end pt-1.5 sm:pt-2">
                      <div className="text-[#83261D] text-xs sm:text-sm font-medium flex items-center gap-0.5 sm:gap-1 group-hover:gap-1 sm:group-hover:gap-2 transition-all">
                        Learn more
                        <ArrowRight
                          size={12}
                          className="group-hover:translate-x-1 transition-transform"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent Line */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#83261D] to-[#83261D]/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />

      {/* ================= MODAL - Responsive ================= */}
      <Dialog
        open={!!selectedCategory}
        onOpenChange={() => setSelectedCategory(null)}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl rounded-lg sm:rounded-xl md:rounded-2xl p-0 overflow-hidden">
          {/* Modal Image - Using object-cover */}
          <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden bg-gray-100">
            <ArtFormImage
              src={getImageUrl(
                selectedCategory?.image || selectedCategory?.categoryImage,
              )}
              alt={selectedCategory?.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
            <DialogHeader className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-6">
              <DialogTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                {selectedCategory?.name}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* Modal Content */}
          <div className="p-4 sm:p-5 md:p-6">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3 md:mb-4">
              <Palette className="text-[#83261D]" size={16} />
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                About this art form
              </span>
            </div>
            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              {selectedCategory?.description}
            </p>

            {/* Modal Button */}
            <div className="mt-4 sm:mt-5 md:mt-6 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategory(null);
                  navigate(`/artform/${slugify(selectedCategory?.name)}`);
                }}
                className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-xs sm:text-sm md:text-base font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-1 sm:gap-2">
                Explore {selectedCategory?.name}
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ArtForms;