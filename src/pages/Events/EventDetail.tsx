/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import EventFormModel from "./EventFormModel";
import {
  Calendar,
  MapPin,
  Tag,
  ArrowLeft,
  Clock,
  Sparkles,
  Users,
  ChevronRight,
  Home,
  ImageIcon,
} from "lucide-react";

// Image Component with Fallback
const EventImage = ({ src, alt, className }: { src: string; alt: string; className?: string }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

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
        <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 mb-2 opacity-50" />
        <span className="text-sm sm:text-base font-medium text-center opacity-75 line-clamp-2">{alt}</span>
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

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedEvents, setRelatedEvents] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/events/${eventId}`,
        );
        const eventData = res.data.data || res.data;
        setEvent(eventData);

        // Fetch related events from same category
        if (eventData?.categories) {
          const allEventsRes = await axios.get(
            `${import.meta.env.VITE_API_URL}/api/events`,
          );
          const allEvents = allEventsRes.data.data || allEventsRes.data;

          const related = allEvents
            .filter(
              (e: any) =>
                e.categories === eventData.categories && e._id !== eventId,
            )
            .slice(0, 3);

          setRelatedEvents(related);
        }

        setLoading(false);
      } catch (err) {
        console.error("Event fetch error:", err);
        setLoading(false);
      }
    }
    load();
  }, [eventId]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const getDayName = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { weekday: "long" });
  };

  const getImageUrl = (path: string) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const clean = path.startsWith("/") ? path.slice(1) : path;
    return `${import.meta.env.VITE_API_URL}/${clean}`;
  };

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

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
        <Navbar />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 opacity-30">🎭</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-2">
            Event Not Found
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8">
            The event you're looking for doesn't exist.
          </p>
          <button
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-2 bg-[#83261D] text-white px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full text-sm sm:text-base hover:bg-[#6e1f17] transition-all hover:scale-105">
            <ArrowLeft size={16} />
            Back to Events
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const isUpcoming = new Date(event.date) >= new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white">
      <Navbar />

      {/* Breadcrumbs - Responsive Sticky */}
      <div className="sticky top-[64px] sm:top-[70px] md:top-[80px] z-40  shadow-sm py-2">
        <div className="container mx-auto">
          <nav className="flex items-center bg-white/60 ms-6 backdrop-blur gap-2 w-fit rounded-full text-sm text-gray-500">
            {/* <Link 
              to="/" 
              className="hover:text-[#83261D] transition-colors flex items-center gap-0.5 sm:gap-1 flex-shrink-0 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full"
            >
              <Home size={12} />
              <span className="hidden xs:inline">Home</span>
            </Link>
            <ChevronRight size={12} className="text-gray-400 flex-shrink-0" /> */}

            <Link
              to="/events"
              className="hover:text-[#83261D] transition-colors flex-shrink-0 hover:bg-gray-200 px-2 py-1 rounded-full"
            >
              Events
            </Link>
            <ChevronRight size={20} className="text-gray-400 flex-shrink-0" />

            <span className="text-[#83261D] font-medium truncate max-w-[120px] xs:max-w-[180px] sm:max-w-[250px] md:max-w-[300px] bg-[#83261D]/10 px-2 py-1 rounded-full">
              {event.title}
            </span>
          </nav>
        </div>
      </div>

      {/* ================= HERO SECTION - Responsive ================= */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-8 sm:py-10 md:py-12 lg:py-16 mt-4 sm:mt-6 overflow-hidden rounded-xl sm:rounded-2xl md:rounded-3xl mx-3 sm:mx-4 md:mx-6">
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
          {["🎭", "🎪", "✨"].map((emoji, i) => (
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
            onClick={() => navigate("/events")}
            className="inline-flex items-center gap-1 sm:gap-2 text-white/80 hover:text-white mb-3 sm:mb-4 md:mb-6 transition-colors group text-sm sm:text-base">
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            <span>Back to Events</span>
          </button>

          <div className="max-w-4xl">
            {/* Category Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-3 sm:mb-4 md:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                {event.categories}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
              {event.title}
            </h1>

            {/* Event Meta Info */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 mt-2 sm:mt-3 md:mt-4">
              <div className="flex items-center gap-1 sm:gap-1.5 text-white/80 text-xs sm:text-sm">
                <Calendar size={14} className="text-amber-300" />
                <span>
                  {getDayName(event.date)}, {formatDate(event.date)}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 text-white/80 text-xs sm:text-sm">
                <MapPin size={14} className="text-amber-300" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{event.location}</span>
              </div>
              <div
                className={`px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold ${isUpcoming ? "bg-green-500" : "bg-gray-500"
                  } text-white`}>
                {isUpcoming ? "Upcoming" : "Completed"}
              </div>
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

      {/* ================= MAIN CONTENT - Responsive ================= */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-12">
            {/* Left Column - Image */}
            <div className="lg:w-2/5">
              <div className="lg:sticky lg:top-24 self-start">
                <div className="relative group">
                  <div className="w-full aspect-square rounded-xl sm:rounded-2xl overflow-hidden bg-gray-100">
                    <EventImage
                      src={getImageUrl(event.image)}
                      alt={event.title}
                      className="w-full h-full object-cover transition-transform duration-700"
                    />
                  </div>

                  {/* Category Badge - Responsive */}
                  <div className="absolute -bottom-2 sm:-bottom-3 md:-bottom-4 -right-2 sm:-right-3 md:-right-4 bg-[#83261D] text-white px-3 sm:px-4 md:px-5 lg:px-6 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-full shadow-xl">
                    <span className="text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">{event.categories}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:w-3/5">
              {/* Quick Info Cards - Responsive Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <Calendar size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Date</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {formatDate(event.date)}
                  </p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <Clock size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Day</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800">
                    {getDayName(event.date)}
                  </p>
                </div>
                <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                  <MapPin size={16} className="text-[#83261D] mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-gray-500">Location</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-1">
                    {event.location}
                  </p>
                </div>
              </div>

              {/* Description Section - Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 flex items-center gap-1.5 sm:gap-2">
                  <Sparkles size={20} className="text-[#83261D]" />
                  About the Event
                </h2>
                <p className="text-sm sm:text-base md:text-lg text-gray-700 leading-relaxed">
                  {event.description}
                </p>
              </div>

              {/* Additional Details Grid - Responsive */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 shadow-lg border border-gray-100 mb-6 sm:mb-8">
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5 sm:gap-2">
                  <Tag size={20} className="text-[#83261D]" />
                  Event Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Event Name</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 break-words">
                      {event.title}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Category</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {event.categories}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Date</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {formatDate(event.date)}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Day</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {getDayName(event.date)}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Location</p>
                    <p className="text-sm sm:text-base md:text-lg font-semibold text-gray-800">
                      {event.location}
                    </p>
                  </div>
                  <div className="border-b border-gray-100 pb-2 sm:pb-3 md:pb-4">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
                    <p
                      className={`text-sm sm:text-base md:text-lg font-semibold ${isUpcoming ? "text-green-600" : "text-gray-600"
                        }`}>
                      {isUpcoming ? "Upcoming" : "Completed"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Register Button - Responsive */}
              {/* Register Button - Only show for upcoming events */}
              {isUpcoming ? (
                <div className="flex justify-end">
                  <EventFormModel
                    eventName={event.title}
                    categoryName={event.categories}
                  />
                </div>
              ) : (
                <div className="flex justify-end">
                  <div className="relative group">
                    <button
                      disabled
                      className="bg-gray-400 text-white px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-full text-xs sm:text-sm md:text-base font-semibold cursor-not-allowed opacity-60 flex items-center gap-1 sm:gap-2"
                    >
                      <Calendar size={14} className="opacity-50" />
                      <span>Registration Closed</span>
                    </button>
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block">
                      <div className="bg-gray-800 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                        This event has already ended
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Events - Responsive */}
              {relatedEvents.length > 0 && (
                <div className="mt-10 sm:mt-12 md:mt-16">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mb-4 sm:mb-5 md:mb-6 flex items-center gap-1.5 sm:gap-2">
                    <Users size={20} className="text-[#83261D]" />
                    More {event.categories} Events
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                    {relatedEvents.map((relatedEvent) => (
                      <div
                        key={relatedEvent._id}
                        onClick={() => navigate(`/events/${relatedEvent._id}`)}
                        className="bg-white rounded-lg sm:rounded-xl p-2 sm:p-3 shadow-md border border-gray-100 hover:shadow-xl transition-all cursor-pointer group hover:scale-[1.02] sm:hover:scale-105">
                        <div className="aspect-video bg-gray-100 rounded-lg mb-2 sm:mb-3 overflow-hidden">
                          <img
                            src={getImageUrl(relatedEvent.image)}
                            alt={relatedEvent.title}
                            className="w-full h-full object-cover transition-transform duration-500"
                          />
                        </div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-800 group-hover:text-[#83261D] transition-colors line-clamp-1">
                          {relatedEvent.title}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-500 flex items-center gap-0.5 sm:gap-1 mt-0.5 sm:mt-1">
                          <Calendar size={8} />
                          {formatDate(relatedEvent.date)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}