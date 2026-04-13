/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Search,
  ChevronRight,
  Home,
  ImageIcon,
} from "lucide-react";
import { Plus, ArrowLeft, X, Sparkles as SparklesIcon } from "lucide-react";
import { toast } from "sonner";
import EventFormFields from "./EventFormFields";

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
        <ImageIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 mb-2 opacity-50" />
        <span className="text-xs sm:text-sm font-medium text-center opacity-75 line-clamp-2">{alt}</span>
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

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [formMode, setFormMode] = useState<"contribute" | null>(null);
  const [formList, setFormList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  const createEmptyEvent = () => ({
    id: Date.now() + Math.random(),
    title: "",
    description: "",
    date: "",
    visibleFrom: "",
    location: "",
    categories: "",
    recurrence: "none" as "none" | "monthly" | "yearly",
    imageFile: null,
    previewUrl: null,
  });

  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<
    "all" | "upcoming" | "completed"
  >("all");

  useEffect(() => {
    setLoading(true);
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/events`)
      .then((res) => {
        setEvents(res.data.data || res.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const filteredEvents = events.filter((e) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const visibleFrom = new Date(e.visibleFrom || e.createdAt);
    visibleFrom.setHours(0, 0, 0, 0);

    const eventDate = new Date(e.date);
    eventDate.setHours(0, 0, 0, 0);

    // Apply search filter
    const matchesSearch =
      searchQuery === "" ||
      e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === "all") return true;

    if (filterType === "upcoming") {
      return visibleFrom <= today && eventDate >= today;
    }

    if (filterType === "completed") {
      return eventDate < today;
    }

    return true;
  });

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

  const getImage = (img: string) =>
    img?.startsWith("http") ? img : `${import.meta.env.VITE_API_URL}/${img}`;

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 4500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const handleFormChange = (id: number, field: string, value: any) => {
    setFormList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const addAnotherForm = () => {
    setFormList((prev) => [...prev, createEmptyEvent()]);
  };

  const removeForm = (id: number) => {
    setFormList((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev
    );
  };

  const validateForm = (form: any) => {
    const errors: any = {};
    if (!form.title?.trim()) errors.title = "Event name is required";
    if (!form.description?.trim()) errors.description = "Description is required";
    if (!form.date) errors.date = "Event date is required";
    if (!form.location?.trim()) errors.location = "Location is required";
    if (!form.categories?.trim()) errors.categories = "Category is required";
    if (!form.imageFile) errors.image = "Image is required";
    return errors;
  };

  const handleBulkSubmit = async () => {
    if (isSubmitting) return;

    const errorsMap: any = {};
    let hasError = false;
    formList.forEach((form) => {
      const errors = validateForm(form);
      if (Object.keys(errors).length > 0) hasError = true;
      errorsMap[form.id] = errors;
    });
    setFormErrors(errorsMap);
    if (hasError) { toast.error("Fix form errors before submitting"); return; }

    try {
      setIsSubmitting(true);

      const formData = new FormData();

      const payload = formList.map((f) => ({
        title: f.title,
        description: f.description,
        date: f.date,
        location: f.location,
        categories: f.categories,
        recurrence: f.recurrence,
        visibleFrom: f.visibleFrom || f.date,
      }));

      formData.append("events", JSON.stringify(payload));

      formList.forEach((f) => {
        if (f.imageFile) formData.append("image", f.imageFile);
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/event-submissions/bulk`,
        formData
      );

      setFormMode(null);
      setFormList([]);
      setShowSuccess(true);
    } catch (err) {
      console.error(err);
      toast.error("Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
      <Navbar />

      {/* ================= HERO SECTION - Responsive ================= */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-12 sm:py-14 md:py-16 lg:py-20 overflow-hidden">
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
          {["🎭", "🎪", "🎨", "✨"].map((emoji, i) => (
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

        <div className="container mx-auto my-6 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-4xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 mb-4 sm:mb-6">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-amber-300" />
              <span className="text-white/90 text-xs sm:text-sm font-medium">
                Cultural Celebrations
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight">
              Cultural Events
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl leading-relaxed mb-6 sm:mb-8 md:mb-10">
              Join us for upcoming cultural events celebrating Indian art,
              music, dance, and traditional crafts.
            </p>

            {/* Search Bar - Responsive */}
            <div className="relative max-w-xl">
              <Search
                className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base rounded-full border-0 focus:ring-2 focus:ring-white/50 bg-white/95 backdrop-blur-sm shadow-2xl"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 w-full sm:w-auto">
              <button
                onClick={() => { setFormMode("contribute"); setFormList([createEmptyEvent()]); }}
                className="group w-full sm:w-auto border-2 border-white/30 text-white px-5 sm:px-6 lg:px-7 py-3 sm:py-3.5 rounded-full text-sm sm:text-base font-semibold hover:bg-white hover:text-[#83261D] transition-all duration-300 hover:scale-[1.04] active:scale-95 flex items-center justify-center gap-2">
                <Plus size={16} className="transition-transform group-hover:rotate-90" />
                Add Events
              </button>
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

      {formMode && (
        <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 md:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <button
                    onClick={() => setFormMode(null)}
                    className="p-1 sm:p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </button>
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white">
                    Contribute Events
                  </h2>
                </div>
                <button
                  onClick={addAnotherForm}
                  className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white text-[#83261D] px-2 sm:px-3 md:px-4 lg:px-5 py-1 sm:py-1.5 md:py-2 rounded-full text-[10px] sm:text-xs md:text-sm font-semibold hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto justify-center">
                  <Plus size={12} />
                  Add Another Event
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {formList.map((form, index) => (
                  <div key={form.id} className="relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-gray-100 hover:border-[#83261D]/20 transition-all">
                    <div className="absolute -top-1.5 sm:-top-2 left-2 sm:left-3 md:left-4 lg:left-6 bg-[#83261D] text-white px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-0.5 rounded-full text-[8px] sm:text-[10px] md:text-xs font-semibold">
                      Event {index + 1}
                    </div>
                    {formList.length > 1 && (
                      <button
                        onClick={() => removeForm(form.id)}
                        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white p-1 sm:p-1.5 rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110 z-10">
                        <X size={10} />
                      </button>
                    )}
                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 pt-5 sm:pt-6 md:pt-7 lg:pt-8">
                      <EventFormFields
                        formId={form.id}
                        data={form}
                        errors={formErrors[form.id] || {}}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button */}
              <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                <button
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 text-xs sm:text-sm lg:text-base ${isSubmitting ? "bg-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-[#83261D] to-[#B45F4A] hover:shadow-2xl hover:scale-105"
                    }`}>
                  {isSubmitting ? (
                    <><div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /><span>Submitting...</span></>
                  ) : (
                    <><Sparkles size={12} />Submit All Events</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {!formMode && (
        <section className="sticky top-[64px] sm:top-[70px] md:top-[80px] z-40 backdrop-blur-sm bg-white/80 border-b border-gray-200 py-2 sm:py-2.5 shadow-sm">
          <div className="container mx-auto px-3 sm:px-4 md:px-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              {/* Filter Buttons - Responsive */}
              <div className="flex gap-1.5 sm:gap-2 flex-wrap justify-center">
                {[
                  { type: "upcoming", label: "Upcoming", icon: Clock },
                  { type: "completed", label: "Completed", icon: Calendar },
                  { type: "all", label: "All", icon: Sparkles },
                ].map(({ type, label, icon: Icon }) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`group relative px-2.5 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-300 flex items-center gap-1 sm:gap-1.5 ${filterType === type
                      ? "bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-[#83261D]/30 hover:text-[#83261D]"
                      }`}>
                    <Icon size={12} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Result count - Responsive */}
              <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
                Showing{" "}
                <span className="font-semibold text-[#83261D]">
                  {filteredEvents.length}
                </span>{" "}
                events
              </div>
            </div>
          </div>
        </section>
      )}

      {!formMode && (
        <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
          {loading ? (
            /* Loading Skeletons - Matching grid pattern */
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
          ) : filteredEvents.length === 0 ? (
            /* Empty State - Responsive */
            <div className="text-center py-12 sm:py-16 md:py-20">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4 opacity-30">🎭</div>
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-700 mb-1 sm:mb-2">
                No events found
              </h3>
              <p className="text-sm sm:text-base text-gray-500">Try adjusting your search or filter</p>
            </div>
          ) : (
            /* Events Grid - Updated grid pattern */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
              {filteredEvents.map((e, index) => (
                <div
                  key={e._id}
                  onClick={() => navigate(`/events/${e._id}`)}
                  className="group cursor-pointer animate-fade-in-up h-full"
                  style={{ animationDelay: `${index * 0.05}s` }}>
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 h-full flex flex-col hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98]">

                    {/* Image Container - Responsive heights */}
                    <div className="relative w-full h-40 sm:h-44 md:h-48 lg:h-52 flex-shrink-0 overflow-hidden bg-gray-100">
                      <EventImage
                        src={getImage(e.image)}
                        alt={e.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
                      />

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#83261D]/60 via-[#83261D]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                      {/* Status Badge - Responsive */}
                      <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4">
                        <span
                          className={`px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-semibold shadow-lg ${new Date(e.date) >= new Date()
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                            }`}>
                          {new Date(e.date) >= new Date()
                            ? "Upcoming"
                            : "Completed"}
                        </span>
                      </div>

                      {/* Date Badge - Responsive */}
                      <div className="absolute bottom-2 sm:bottom-3 md:bottom-4 left-2 sm:left-3 md:left-4">
                        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 md:py-2 shadow-lg">
                          <div className="text-[8px] sm:text-[10px] md:text-xs text-[#83261D] font-semibold">
                            {getDayName(e.date)}
                          </div>
                          <div className="text-[10px] sm:text-xs md:text-sm font-bold text-gray-800">
                            {formatDate(e.date)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content - Responsive padding */}
                    <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
                      {/* Title */}
                      <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 mb-1 sm:mb-1.5 md:mb-2 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem] md:min-h-[3.5rem] group-hover:text-[#83261D] transition-colors duration-300">
                        {e.title}
                      </h2>

                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 line-clamp-2 mb-1.5 sm:mb-2 md:mb-3 min-h-[2rem] sm:min-h-[2.2rem] md:min-h-[2.5rem]">
                        {e.description}
                      </p>

                      {/* Location */}
                      {e.location ? (
                        <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-2.5 md:mb-3 min-h-[1.2rem] sm:min-h-[1.5rem]">
                          <MapPin
                            size={12}
                            className="text-[#83261D] flex-shrink-0"
                          />
                          <span className="truncate">{e.location}</span>
                        </div>
                      ) : (
                        <div className="mb-2 sm:mb-2.5 md:mb-3 min-h-[1.2rem] sm:min-h-[1.5rem]"></div>
                      )}

                      {/* View Details Link */}
                      <div className="flex items-center justify-end text-[#83261D] text-xs sm:text-sm font-medium group-hover:gap-1 sm:group-hover:gap-2 transition-all mt-auto">
                        <span>View Details</span>
                        <ChevronRight
                          size={12}
                          className="group-hover:translate-x-1 transition-transform flex-shrink-0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <Footer />
    </div>
  );
}