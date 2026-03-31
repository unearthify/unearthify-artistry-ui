/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { slugify } from "@/utils/slug";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { baseCard } from "@/styles/cardBase";
import {
  ArrowLeft,
  Palette,
  Eye,
  Sparkles,
  Search,
  Home,
  ChevronRight,
} from "lucide-react";

// Breadcrumbs Component
const Breadcrumbs = ({ category }: { category: any }) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-100">
      {/* <Link
        to="/"
        className="hover:text-[#83261D] transition-colors flex items-center gap-1">
        <Home size={14} />
        <span>Home</span>
      </Link>
      <ChevronRight size={14} className="text-gray-300" /> */}
      <Link to="/art-forms" className="hover:text-[#83261D] transition-colors">
        Art Forms
      </Link>
      <ChevronRight size={14} className="text-gray-300" />
      <span className="text-[#83261D] font-medium truncate max-w-[150px]">
        {category?.name}
      </span>
    </nav>
  );
};

const ReadMoreText = ({ text, onReadMore }: any) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [overflow, setOverflow] = useState(false);

  useEffect(() => {
    if (ref.current) {
      setOverflow(ref.current.scrollHeight > ref.current.clientHeight);
    }
  }, [text]);

  return (
    <div>
      <p
        ref={ref}
        className="text-sm text-gray-600 mt-2 line-clamp-2 leading-relaxed">
        {text}
      </p>

      {overflow && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onReadMore();
          }}
          className="text-sm font-semibold mt-2 text-[#83261D] hover:text-[#83261D]/80 hover:underline transition-colors inline-flex items-center gap-1">
          Read more
        </button>
      )}
    </div>
  );
};

/* ================= PAGE ================= */
const CategoryArtForms = () => {
  const { categorySlug } = useParams();
  const [artForms, setArtForms] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [selectedForm, setSelectedForm] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_URL}/${clean}`;
  };

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/categories`,
        );

        const categories = res.data.data || res.data;

        const matchedCategory = categories.find(
          (c: any) => slugify(c.name) === categorySlug,
        );

        if (!matchedCategory) return;

        setCategory(matchedCategory);
        setArtForms(matchedCategory.arttypes || matchedCategory.artTypes || []);
        setLoading(false);
      } catch (err) {
        console.error("Category fetch error", err);
        setLoading(false);
      }
    }

    load();
  }, [categorySlug]);

  // Filter art forms based on search
  const filteredArtForms = artForms.filter(
    (form) =>
      form.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      form.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Breadcrumbs - Sticky at top */}
      <div className="sticky top-16 z-40 bg-transparent py-2 w-fit">
        <div className="container mx-auto px-6">
          <Breadcrumbs category={category} />
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-16 overflow-hidden">
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

        {/* Floating Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {["🎨", "🖼️", "🎭", "🪔", "✨"].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-white/5 text-7xl animate-float"
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

        <div className="container mx-auto px-6 relative z-10">
          {/* Back Button */}
          <button
            onClick={() => navigate("/art-forms")}
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors group">
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Art Forms</span>
          </button>

          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
              <Palette className="w-4 h-4 text-amber-300" />
              <span className="text-white/90 text-sm font-medium">
                {category?.name}
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              {category?.name}
            </h1>

            <p className="text-xl text-white/90 max-w-2xl leading-relaxed mb-10">
              Explore the various art forms under {category?.name} — each with
              its own unique history, style, and cultural significance.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search art forms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-full border-0 focus:ring-2 focus:ring-white/50 bg-white/95 backdrop-blur-sm shadow-2xl"
              />
            </div>

            {/* Result count */}
            <p className="text-white/70 text-sm mt-4">
              Showing {filteredArtForms.length} art form
              {filteredArtForms.length !== 1 ? "s" : ""}
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

      {/* ================= MAIN CONTENT ================= */}
      <section className="container mx-auto px-6 py-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white rounded-2xl shadow-lg p-4 animate-pulse">
                <div className="h-56 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : filteredArtForms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4 opacity-30">🎨</div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              No art forms found
            </h3>
            <p className="text-gray-500">Try adjusting your search</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArtForms.map((form, index) => (
              <div
                key={form._id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}>
                <div
                  onClick={() =>
                    navigate(
                      `/artform/${slugify(category.name)}/${slugify(form.name)}`,
                    )
                  }
                  className="group cursor-pointer bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
                  {/* IMAGE CONTAINER */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={getImageUrl(form.image)}
                      alt={form.name}
                      className="w-full h-full object-cover transition-transform duration-700"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#83261D]/60 via-[#83261D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* View Button - Appears on Hover */}
                    {/* <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      <button className="bg-white text-[#83261D] px-6 py-3 rounded-full font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 shadow-xl">
                        <Eye size={18} />
                        View Details
                      </button>
                    </div> */}

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-[#83261D] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md">
                        <Palette size={12} />
                        {category?.name}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#83261D] transition-colors duration-300 line-clamp-1">
                      {form.name}
                    </h2>

                    <ReadMoreText
                      text={form.description}
                      onReadMore={() => setSelectedForm(form)}
                    />

                    {/* Explore Link */}
                    <div className="mt-4 flex items-center justify-end">
                      <div className="text-[#83261D] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                        Learn more
                        <span className="text-lg group-hover:translate-x-1 transition-transform">
                          →
                        </span>
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

      {/* ================= MODAL ================= */}
      <Dialog open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
        <DialogContent
          className="
      w-[95vw]
      sm:w-full
      max-w-[95vw]
      sm:max-w-xl
      md:max-w-2xl
      lg:max-w-3xl
      h-auto
      max-h-[90vh]
      p-0
      overflow-hidden
      rounded-xl
      sm:rounded-2xl
      flex
      flex-col
    ">
          {/* IMAGE SECTION */}
          <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 shrink-0 overflow-hidden">
            <img
              src={getImageUrl(selectedForm?.image)}
              alt={selectedForm?.name}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <DialogHeader className="absolute bottom-0 left-0 p-3 sm:p-4 md:p-6">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white leading-tight">
                {selectedForm?.name}
              </DialogTitle>
            </DialogHeader>
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="p-4 sm:p-5 md:p-6 overflow-y-auto">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Sparkles className="text-[#83261D]" size={18} />
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                About this art form
              </span>
            </div>

            <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
              {selectedForm?.description}
            </p>

            {/* BUTTON */}
            <div className="mt-5 md:mt-6 flex justify-end">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedForm(null);
                }}
                className="
            bg-gradient-to-r from-[#83261D] to-[#B45F4A]
            text-white
            px-4 sm:px-5 md:px-6
            py-2 sm:py-2.5 md:py-3
            rounded-full
            text-xs sm:text-sm md:text-base
            font-semibold
            hover:shadow-xl
            transition-all
            hover:scale-105
            active:scale-95
          ">
                Close
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default CategoryArtForms;
