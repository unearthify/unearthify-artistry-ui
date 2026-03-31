/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  MapPin,
  Calendar,
  Award,
  Heart,
  Share2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

const ArtistDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artist, setArtist] = useState<any>(null);
  const [relatedArtists, setRelatedArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    artistId: "",
    artistName: "",
    category: "",
    artTypeId: "",
    artTypeName: "",
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    // Fetch current artist
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/artists/${id}`)
      .then((res) => {
        const artistData = res.data.data || res.data;
        setArtist(artistData);

        // Fetch related artists with same art form
        if (artistData?.artTypeName) {
          return axios.get(`${import.meta.env.VITE_API_URL}/api/artists`);
        }
      })
      .then((response: any) => {
        if (response?.data) {
          const allArtists = Array.isArray(response.data)
            ? response.data
            : response.data.data || [];

          const related = allArtists
            .filter(
              (a: any) =>
                a.artTypeName === artist?.artTypeName && a._id !== id && a.name,
            )
            .slice(0, 3);

          setRelatedArtists(related);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Artist fetch error:", err);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Artist fetch error:", err);
        setLoading(false);
      });
  }, [id, artist?.artTypeName]);

  useEffect(() => {
    if (artist) {
      setFormData((prev) => ({
        ...prev,
        artistId: artist._id || "",
        artistName: artist.name || "",
        category: typeof artist.category === "object"
          ? artist.category?._id
          : artist.category || "",
        artTypeId: artist.artTypeId || "",
        artTypeName: artist.artTypeName || "",
      }));
    }
  }, [artist]);

  const handleRelatedArtistClick = (artistId: string) => {
    navigate(`/artists/${artistId}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone || !formData.email || !formData.message) {
      toast.error("Fill all required fields");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/contact-artist`,
        formData
      );

      toast.success("Contact request sent");
      setIsModalOpen(false);
      setFormData((prev) => ({
        ...prev,
        name: "",
        phone: "",
        email: "",
        message: "",
      }));
    } catch (error: any) {
      console.error(error.response?.data);
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-6 sm:h-7 md:h-8 bg-gray-200 rounded w-1/3 mb-4 sm:mb-6 md:mb-8"></div>
              <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 md:gap-8">
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

  if (!artist) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 opacity-30">
            🎨
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Artist Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
            The artist you're looking for doesn't exist.
          </p>
          <Link
            to="/artists"
            className="inline-flex items-center gap-2 bg-[#83261D] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base hover:bg-[#6e1f17] transition-all hover:scale-105">
            <ArrowLeft size={16} />
            Back to Artists
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white">
      <Navbar />

      {/* Hero Section with Artist Name - Responsive */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-12 sm:py-14 md:py-16 overflow-hidden">
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
          <div className="absolute top-10 right-10 text-white/5 text-6xl md:text-8xl animate-float">
            🎨
          </div>
          <div className="absolute bottom-10 left-10 text-white/5 text-6xl md:text-8xl animate-float animation-delay-2000">
            ✨
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 md:py-6 relative z-10">
          <Link
            to="/artists"
            className="inline-flex items-center gap-1 sm:gap-2 text-white/80 hover:text-white mb-4 sm:mb-6 md:mb-8 transition-colors group text-sm sm:text-base">
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Artists</span>
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4">
              {artist.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
              <span className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-[10px] sm:text-xs md:text-sm font-medium">
                {artist.artTypeName}
              </span>
              <span className="text-white/80 flex items-center gap-1 text-xs sm:text-sm md:text-base">
                <MapPin size={12} />
                {artist.city}, {artist.state}
              </span>
            </div>
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

      {/* Main Content - Responsive */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Left Column - Image */}
            <div className="lg:w-2/5">
              <div className="lg:sticky lg:top-24 self-start">
                <div className="relative group">
                  <img
                    src={getImageUrl(artist.image || artist.artistImage)}
                    alt={artist.name}
                    className="w-full rounded-xl sm:rounded-2xl shadow-2xl object-cover aspect-square"
                  />

                  {/* Art Form Badge */}
                  <div className="absolute -bottom-3 sm:-bottom-4 -right-3 sm:-right-4 bg-[#83261D] text-white px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-full shadow-xl">
                    <span className="text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">
                      {artist.artTypeName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:w-3/5">
              {/* Quick Info Cards - Responsive grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <MapPin size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Location
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                    {artist.city}
                  </p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <Award size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-gray-500">
                    Art Form
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                    {artist.artTypeName}
                  </p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <Calendar size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-gray-500">State</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate">
                    {artist.state}
                  </p>
                </div>
              </div>

              {/* Biography Section - Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles size={20} className="text-[#83261D]" />
                  Biography
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  {artist.bio}
                </p>
              </div>

              {/* Additional Details Grid - Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6">
                  Artist Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Full Name
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 break-words">
                      {artist.name}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Art Form
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artist.artTypeName}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      City
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artist.city}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      State
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artist.state}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">
                      Country
                    </p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {artist.country || "India"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-[#83261D] text-white px-6 py-3 rounded-lg"
                >
                  Contact Artist
                </button>
              </div>

              {/* Related Artists Section - Responsive */}
              {relatedArtists.length > 0 && (
                <div className="mt-8 sm:mt-10 md:mt-12">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5 sm:gap-2">
                    <Sparkles size={20} className="text-[#83261D]" />
                    More in {artist.artTypeName}
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {relatedArtists.map((relatedArtist) => (
                      <div
                        key={relatedArtist._id}
                        onClick={() =>
                          handleRelatedArtistClick(relatedArtist._id)
                        }
                        className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-100
                          shadow-md
                          transform transition-all duration-300 ease-out
                          hover:-translate-y-1 hover:scale-[1.02] sm:hover:scale-[1.04] hover:shadow-2xl
                          cursor-pointer group will-change-transform">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-2 sm:mb-3 overflow-hidden">
                          <img
                            src={getImageUrl(
                              relatedArtist.image || relatedArtist.artistImage,
                            )}
                            alt={relatedArtist.name}
                            className="w-full h-full object-cover transition-transform duration-500"
                            loading="lazy"
                          />
                        </div>
                        <p className="text-sm sm:text-base font-semibold text-gray-800 group-hover:text-[#83261D] transition-colors line-clamp-1">
                          {relatedArtist.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={10} />
                          <span className="truncate">
                            {relatedArtist.city}, {relatedArtist.state}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No related artists message - Responsive */}
              {relatedArtists.length === 0 && (
                <div className="mt-8 sm:mt-10 md:mt-12 text-center py-6 sm:py-8 bg-white/50 rounded-xl sm:rounded-2xl border border-gray-100 px-4">
                  <p className="text-sm sm:text-base text-gray-500">
                    No other artists found in {artist.artTypeName}
                  </p>
                  <Link
                    to="/artists"
                    className="inline-flex items-center gap-1 sm:gap-2 text-[#83261D] hover:text-[#6e1f17] font-medium mt-2 text-sm sm:text-base transition-colors">
                    Browse all artists
                    <ArrowLeft size={14} className="rotate-180" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Modal - Updated with scrolling */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[85vh] shadow-2xl transform animate-in slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
            
            {/* Header - Sticky */}
            <div className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] p-5 rounded-t-2xl sticky top-0 z-10 flex-shrink-0">
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Contact Artist</h2>
                  <p className="text-white/80 text-sm mt-0.5">{artist?.name}</p>
                </div>
              </div>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="phone"
                      placeholder="Enter your phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      name="email"
                      type="email"
                      placeholder="Enter your email address"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none transition-all text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="message"
                      placeholder="Tell us why you'd like to connect with this artist..."
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none transition-all text-sm resize-none"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-2">
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 font-medium hover:bg-gray-50 transition-all text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] transition-all text-sm"
                  >
                    Send Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ArtistDetails;