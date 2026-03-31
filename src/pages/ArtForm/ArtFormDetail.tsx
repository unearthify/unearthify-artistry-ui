/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtFormModel from "./ArtFormModel";
import axios from "axios";
import { slugify } from "@/utils/slug";
import {
  ArrowLeft,
  Palette,
  MapPin,
  Globe,
  Users,
  Calendar,
  Sparkles,
  BookOpen,
  Music,
  Award,
  ExternalLink,
  ChevronRight,
  Home,
  ImageIcon,
} from "lucide-react";

// Image Component with Fallback
const ArtFormImage = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const getFallbackColor = (text: string) => {
    const colors = [
      "from-[#83261D] to-[#B45F4A]",
      "from-[#2D6A4F] to-[#40916C]",
      "from-[#7B2CBF] to-[#9D4EDD]",
      "from-[#E85D04] to-[#F48C06]",
      "from-[#03045E] to-[#023E8A]",
      "from-[#9A031E] to-[#BF4343]",
    ];
    const index =
      text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
      colors.length;
    return colors[index];
  };

  if (imageError || !src) {
    return (
      <div
        className={`${className} bg-gradient-to-br ${getFallbackColor(alt)} flex flex-col items-center justify-center p-4 text-white`}>
        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 mb-2 opacity-50" />
        <span className="text-sm sm:text-base font-medium text-center opacity-75 line-clamp-2">
          {alt}
        </span>
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
        className={`${className} transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

// Breadcrumbs Component - Responsive
const Breadcrumbs = ({
  category,
  artForm,
}: {
  category: any;
  artForm: any;
}) => {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 px-4 py-2">
      {/* <Link
        to="/"
        className="hover:text-[#83261D] transition-colors flex items-center gap-1">
        <Home size={12} />
        <span className="hidden xs:inline">Home</span>
      </Link>
      <ChevronRight size={12} className="text-gray-300 flex-shrink-0" /> */}

      <Link to="/art-forms" className="hover:text-[#83261D] transition-colors">
        Art Forms
      </Link>
      <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />

      <Link
        to={`/artform/${slugify(category?.name)}`}
        className="hover:text-[#83261D] transition-colors">
        {category?.name}
      </Link>
      <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />

      <span className="text-[#83261D] font-medium truncate max-w-[150px]">
        {artForm?.name}
      </span>
    </nav>
  );
};

const normalizeArtists = (value: any): string[] => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);
  }
  return [];
};

const ArtFormDetail: React.FC = () => {
  const { categorySlug, artTypeSlug } = useParams();
  const navigate = useNavigate();
  const [artForm, setArtForm] = useState<any>(null);
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const catRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/categories`,
        );

        const categories = catRes.data.data || catRes.data;

        const category = categories.find(
          (c: any) => slugify(c.name) === categorySlug,
        );

        if (!category) return;

        const artType = (category.arttypes || category.artTypes).find(
          (a: any) => slugify(a.name) === artTypeSlug,
        );

        if (!artType) return;

        const detailRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/details`,
        );

        const details = detailRes.data.data || detailRes.data;

        const artDetail = details.find(
          (d: any) =>
            String(d.artType?._id) === String(artType._id) &&
            String(d.category?._id) === String(category._id),
        );

        setArtForm({
          ...artType,
          ...artDetail,
          category,
        });

        const artistRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/artists`,
        );

        setArtists(artistRes.data.data || []);
        setLoading(false);
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    }

    load();
  }, [categorySlug, artTypeSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-6 sm:h-8 bg-gray-200 rounded w-1/3 mb-6 sm:mb-8"></div>
              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                <div className="lg:w-2/5">
                  <div className="aspect-square bg-gray-200 rounded-xl sm:rounded-2xl"></div>
                </div>
                <div className="lg:w-3/5 space-y-3 sm:space-y-4">
                  <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!artForm) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 opacity-30">
            🎨
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Art Form Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
            The art form you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/art-forms")}
            className="inline-flex items-center gap-2 bg-[#83261D] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base hover:bg-[#6e1f17] transition-all hover:scale-105">
            <ArrowLeft size={16} />
            Back to Art Forms
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_URL}/${clean}`;
  };

  const artistMap = new Map(artists.map((a: any) => [slugify(a.name), a]));
  const famousArtistList = normalizeArtists(artForm?.famousArtist);

  const categoryUrl = artForm.category?.name
    ? `/artform/${slugify(artForm.category.name)}`
    : null;

  // Group details into sections
  const basicInfo = [
    {
      label: "Category",
      value: artForm.category?.name,
      icon: Palette,
      link: categoryUrl,
    },
    { label: "Origin", value: artForm.origin, icon: MapPin },
    { label: "State", value: artForm.state, icon: MapPin },
    { label: "Languages", value: artForm.language, icon: BookOpen },
  ];

  const performanceInfo = [
    { label: "Typical Length", value: artForm.typicalLength, icon: Calendar },
    {
      label: "Contemporary Performers",
      value: artForm.contemporaryPerformers,
      icon: Users,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white">
      <Navbar />

      {/* Breadcrumbs - Fixed Sticky */}
      <div className="sticky top-20 z-40 w-fit overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 py-2">
          <div className="bg-white/90 backdrop-blur-sm shadow-sm border border-gray-100 rounded-full inline-block">
            <Breadcrumbs category={artForm.category} artForm={artForm} />
          </div>
        </div>
      </div>

      {/* ================= HERO SECTION - Responsive ================= */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-8 sm:py-10 md:py-12 lg:py-16 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl mx-3 sm:mx-4 md:mx-6">
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
          {["🎨", "✨", "🎭"].map((emoji, i) => (
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

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Back Button */}
          <button
            onClick={() =>
              navigate(`/artform/${slugify(artForm.category?.name)}`)
            }
            className="inline-flex items-center gap-1 sm:gap-2 text-white/80 hover:text-white my-4 sm:mb-4 md:mb-6 transition-colors group text-sm sm:text-base">
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to {artForm.category?.name}</span>
          </button>

          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 md:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                {artForm.category?.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
              {artForm.name}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-3xl leading-relaxed">
              {artForm.description}
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

      {/* ================= MAIN CONTENT - Responsive ================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Left Column - Image */}
            <div className="lg:w-2/5">
              <div className="lg:sticky lg:top-24 self-start">
                <div className="relative group">
                  <div className="w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100">
                    <ArtFormImage
                      src={getImageUrl(artForm.image)}
                      alt={artForm.name}
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                  </div>

                  {/* Category Badge - Responsive */}
                  <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 -right-2 sm:-right-3 md:-right-4 bg-[#83261D] text-white px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-full shadow-xl">
                    <span className="text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">
                      {artForm.category?.name}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:w-3/5">
              {/* Basic Info Cards - Responsive Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {basicInfo.map((info, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <info.icon
                      size={16}
                      className="text-[#83261D] mb-1 sm:mb-2"
                    />
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {info.label}
                    </p>
                    {info.link ? (
                      <Link
                        to={info.link}
                        className="text-xs sm:text-sm font-semibold text-[#83261D] hover:underline line-clamp-1">
                        {info.value || "N/A"}
                      </Link>
                    ) : (
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                        {info.value || "N/A"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Performance Info Cards - Responsive Grid */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {performanceInfo.map((info, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                    <info.icon size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                    <p className="text-[10px] sm:text-xs text-gray-500">{info.label}</p>

                    {info.label === "Contemporary Performers" ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {normalizeArtists(info.value).length === 0 ? (
                          <span className="text-xs sm:text-sm font-semibold text-gray-800">N/A</span>
                        ) : (
                          normalizeArtists(info.value).map((name: string, i: number) => {
                            const matched = artistMap.get(slugify(name));
                            return matched ? (
                              <Link
                                key={i}
                                to={`/artists/${matched._id}`}
                                className="inline-flex items-center gap-0.5 bg-[#83261D]/10 text-[#83261D] px-2 py-0.5 rounded-full text-xs font-medium hover:bg-[#83261D] hover:text-white transition-colors">
                                {name}
                                <ExternalLink size={10} />
                              </Link>
                            ) : (
                              <span key={i} className="inline-block bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                                {name}
                              </span>
                            );
                          })
                        )}
                      </div>
                    ) : (
                      <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                        {info.value || "N/A"}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Famous Artists Section - Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <Award size={20} className="text-[#83261D]" />
                  Famous Artists
                </h2>

                {famousArtistList.length === 0 ? (
                  <p className="text-sm sm:text-base text-gray-500">
                    No famous artists listed
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    {famousArtistList.map((name: string, index: number) => {
                      const matched = artistMap.get(slugify(name));
                      return (
                        <span key={index}>
                          {matched ? (
                            <Link
                              to={`/artists/${matched._id}`}
                              className="inline-flex items-center gap-0.5 sm:gap-1 bg-[#83261D]/10 text-[#83261D] px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#83261D] hover:text-white transition-colors">
                              {name}
                              <ExternalLink size={10} />
                            </Link>
                          ) : (
                            <span className="inline-block bg-gray-100 text-gray-700 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
                              {name}
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Additional Details Grid - Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5 sm:gap-2">
                  <BookOpen size={20} className="text-[#83261D]" />
                  Additional Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Origin
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artForm.origin || "N/A"}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Languages
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artForm.language || "N/A"}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Typical Length
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artForm.typicalLength || "N/A"}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Contemporary Performers
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {normalizeArtists(artForm.contemporaryPerformers).length === 0 ? (
                        <span className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">N/A</span>
                      ) : (
                        normalizeArtists(artForm.contemporaryPerformers).map((name: string, index: number) => {
                          const matched = artistMap.get(slugify(name));
                          return (
                            <span key={index}>
                              {matched ? (
                                <Link
                                  to={`/artists/${matched._id}`}
                                  className="inline-flex items-center gap-0.5 sm:gap-1 bg-[#83261D]/10 text-[#83261D] px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium hover:bg-[#83261D] hover:text-white transition-colors">
                                  {name}
                                  <ExternalLink size={10} />
                                </Link>
                              ) : (
                                <span className="inline-block bg-gray-100 text-gray-700 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm">
                                  {name}
                                </span>
                              )}
                            </span>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Website Link - Responsive */}
                {artForm.websiteLink && (
                  <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-gray-200 overflow-hidden">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                      Official Website
                    </p>
                    <a
                      href={artForm.websiteLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 sm:gap-2 text-[#83261D] hover:text-[#6e1f17] font-medium text-sm sm:text-base break-all">
                      <Globe size={16} />
                      <span className="truncate max-w-[200px] sm:max-w-[300px]">
                        {artForm.websiteLink}
                      </span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>

              {/* Apply Button - Responsive */}
              <div className="flex justify-end">
                <ArtFormModel title={artForm.name} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ArtFormDetail;
