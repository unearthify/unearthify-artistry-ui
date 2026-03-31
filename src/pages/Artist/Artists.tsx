/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtistCard from "@/components/ArtistCard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ArtistFormFields from "./ArtistFormFields";
import { ArrowLeft, Search, Users, Sparkles, X, Plus } from "lucide-react";
import { toast } from "sonner";

const Artists = () => {
  const [selectedArtist, setSelectedArtist] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [artistList, setArtistList] = useState<any[]>([]);
  const [formMode, setFormMode] = useState<"join" | "contribute" | null>(null);
  const [formList, setFormList] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const navigate = useNavigate();

  const createEmptyArtist = () => ({
    id: Date.now() + Math.random(),
    name: "",
    selectedData: [],
    artTypeOptions: [],
    city: "",
    state: "",
    country: "India",
    bio: "",
    imageFile: null,
    previewUrl: null,
    phone: "",
    email: "",
    website: "",
  });

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/artists`)
      .then((response) => {
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data;
        setArtistList(data || []);
      })
      .catch((error) => {
        console.error("Error fetching artists data:", error);
      });
  }, []);

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => setShowSuccess(false), 4500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const handleFormChange = (id: number, field: string, value: any) => {
    setFormList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: value } : f)),
    );
  };

  const addAnotherForm = () => {
    setFormList((prev) => [...prev, createEmptyArtist()]);
  };

  const removeForm = (id: number) => {
    setFormList((prev) =>
      prev.length > 1 ? prev.filter((item) => item.id !== id) : prev,
    );
  };

  const handleBulkSubmit = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);

      const formData = new FormData();
      const payload: any[] = [];

      formList.forEach((f) => {
        f.selectedData.forEach((cat: any) => {
          cat.artTypes.forEach((typeId: string) => {
            const selectedType = cat.artTypeOptions?.find(
              (t: any) => t.value === typeId
            );

            payload.push({
              name: f.name,
              category: cat.categoryId,
              artTypeId: typeId,
              artTypeName: selectedType?.label || "",
              city: f.city,
              state: f.state,
              country: f.country,
              bio: f.bio,
              phone: f.phone,
              email: f.email,
              website: f.website,
            });
          });
        });
      });

      formData.append("artists", JSON.stringify(payload));

      formList.forEach((f) => {
        if (f.imageFile) {
          formData.append("image", f.imageFile);
        }
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/artist-submissions/bulk`,
        formData,
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

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    const cleanPath = imagePath.startsWith("/")
      ? imagePath.substring(1)
      : imagePath;
    return `${import.meta.env.VITE_API_URL}/${cleanPath}`;
  };

  // Filter artists based on search
  const filteredArtists = artistList.filter((artist) => {
    return (
      searchQuery === "" ||
      artist.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.artTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.state?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white overflow-x-hidden">
      <Navbar />

      {/* Gradient Header with Theme Colors - Responsive */}
      <section className="relative bg-gradient-to-br from-[#83261D] via-[#9a2f24] to-[#b84c3f] py-10 sm:py-12 md:py-16 lg:py-20 overflow-hidden">
        {/* Animated Pattern Overlay */}
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

        {/* Floating Orbs */}
        <div className="absolute top-0 left-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-amber-300/10 rounded-full blur-3xl"></div>

        {/* Wave Pattern at Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            className="w-full h-auto"
            preserveAspectRatio="none">
            <path
              fill="rgba(255,255,255,0.05)"
              d="M0,64 C320,96 480,32 720,32 C960,32 1120,96 1440,64 L1440,120 L0,120 Z"></path>
            <path
              fill="#ffffff"
              d="M0,96 C320,120 480,64 720,64 C960,64 1120,120 1440,96 L1440,120 L0,120 Z"></path>
          </svg>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10">
          <div className="max-w-3xl">
            {/* Badge - Responsive */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 mb-3 sm:mb-4 md:mb-6">
              <Users size={12} className="text-amber-300" />
              <span className="text-white/90 text-[10px] sm:text-xs md:text-sm font-medium tracking-wide">
                Our Artists
              </span>
            </div>

            {/* Title - Responsive text sizes */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-2 sm:mb-3 md:mb-4 lg:mb-6 leading-tight">
              Discover Artists
            </h1>

            {/* Description - Responsive */}
            <p className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl text-amber-100/90 max-w-2xl mb-4 sm:mb-5 md:mb-6 lg:mb-8 xl:mb-10 leading-relaxed">
              Meet the talented artists who are keeping India's rich cultural
              heritage alive through their dedication and artistry.
            </p>

            {/* Search Bar - Responsive */}
            <div className="relative max-w-xl">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={14}
              />
              <input
                type="text"
                placeholder="Search artists by name, art form, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base rounded-full border-0 focus:ring-2 focus:ring-white/50 bg-white/95 backdrop-blur-sm shadow-2xl"
              />
            </div>

            {/* Action Buttons - Properly sized for mobile */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6 lg:mt-8 w-full sm:w-auto">
              {/* <button
                onClick={() => {
                  setFormMode("join");
                  setFormList([createEmptyArtist()]);
                }}
                className="group w-full sm:w-auto bg-white text-[#83261D]
                px-5 sm:px-6 lg:px-7
                py-3 sm:py-3.5 lg:py-4
                rounded-full
                text-sm sm:text-base
                font-semibold
                hover:shadow-2xl
                transition-all duration-300
                hover:scale-[1.04]
                active:scale-95
                flex items-center justify-center gap-2">
                <Sparkles
                  size={16}
                  className="transition-transform group-hover:rotate-12"
                />
                Join as Artist
              </button> */}

              <button
                onClick={() => {
                  setFormMode("contribute");
                  setFormList([createEmptyArtist()]);
                }}
                className="group w-full sm:w-auto
                  border-2 border-white/30 text-white
                  px-5 sm:px-6 lg:px-7
                  py-3 sm:py-3.5 lg:py-4
                  rounded-full
                  text-sm sm:text-base
                  font-semibold
                  hover:bg-white hover:text-[#83261D]
                  transition-all duration-300
                  hover:scale-[1.04]
                  active:scale-95
                  flex items-center justify-center gap-2">
                <Plus
                  size={16}
                  className="transition-transform group-hover:rotate-90"
                />
                Contribute Artist
              </button>
            </div>

            {/* Result count with decorative element */}
            <div className="flex items-center gap-2 sm:gap-3 mt-3 sm:mt-4 md:mt-6">
              <div className="h-px w-4 sm:w-6 md:w-8 bg-white/30"></div>
              <p className="text-white/70 text-[10px] sm:text-xs md:text-sm">
                Showing {filteredArtists.length} artist
                {filteredArtists.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form Section - Responsive */}
      {formMode && (
        <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 lg:py-10 xl:py-12">
          <div className="bg-white rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Form Header - Responsive */}
            <div className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-3 md:py-4 lg:py-5 xl:py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
                  <button
                    onClick={() => setFormMode(null)}
                    className="p-1 sm:p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                    <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </button>
                  <h2 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white">
                    {formMode === "join"
                      ? "Join as Artist"
                      : "Contribute Artists"}
                  </h2>
                </div>

                {formMode === "contribute" && (
                  <button
                    onClick={addAnotherForm}
                    className="flex items-center gap-1 sm:gap-1.5 md:gap-2 bg-white text-[#83261D] px-2 sm:px-3 md:px-4 lg:px-5 xl:px-6 py-1 sm:py-1.5 md:py-2 lg:py-2.5 rounded-full text-[10px] sm:text-xs md:text-sm lg:text-base font-semibold hover:shadow-xl transition-all hover:scale-105 w-full sm:w-auto justify-center">
                    <Plus size={12} />
                    Add Another Artist
                  </button>
                )}
              </div>
            </div>

            {/* Form Content - Responsive */}
            <div className="p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8">
              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {formList.map((form, index) => (
                  <div
                    key={form.id}
                    className="relative bg-white rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-gray-100 hover:border-[#83261D]/20 transition-all">
                    {/* Form Number Badge */}
                    <div className="absolute -top-1.5 sm:-top-2 left-2 sm:left-3 md:left-4 lg:left-6 bg-[#83261D] text-white px-1.5 sm:px-2 md:px-2.5 lg:px-3 py-0.5 rounded-full text-[8px] sm:text-[10px] md:text-xs font-semibold">
                      Artist {index + 1}
                    </div>

                    {formMode === "contribute" && formList.length > 1 && (
                      <button
                        onClick={() => removeForm(form.id)}
                        className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white p-1 sm:p-1.5 rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110 z-10">
                        <X size={10} />
                      </button>
                    )}

                    <div className="p-3 sm:p-4 md:p-5 lg:p-6 pt-5 sm:pt-6 md:pt-7 lg:pt-8">
                      <ArtistFormFields
                        formId={form.id}
                        data={form}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Button - Responsive */}
              <div className="flex flex-col sm:flex-row justify-end mt-4 sm:mt-5 md:mt-6 lg:mt-7 xl:mt-8 pt-3 sm:pt-4 md:pt-5 lg:pt-6 border-t border-gray-200">
                <button
                  onClick={handleBulkSubmit}
                  disabled={isSubmitting}
                  className={`w-full sm:w-auto px-3 sm:px-4 md:px-5 lg:px-6 xl:px-8 py-1.5 sm:py-2 md:py-2.5 lg:py-3 rounded-lg sm:rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-1 sm:gap-2 text-[10px] sm:text-xs md:text-sm lg:text-base ${isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#83261D] to-[#B45F4A] hover:shadow-2xl hover:scale-105"
                    }`}>
                  {isSubmitting ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      {formMode === "join"
                        ? "Submit for Review"
                        : "Submit All Artists"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Artists Grid - Responsive */}
      {!formMode && (
        <section className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16">
          {filteredArtists.length === 0 ? (
            <div className="text-center py-8 sm:py-10 md:py-12 lg:py-16">
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3 md:mb-4 opacity-30">
                🎨
              </div>
              <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-gray-700 mb-1">
                No artists found
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-500">
                Try adjusting your search
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
              {filteredArtists.map((artist) => (
                <div key={artist._id || artist.id}>
                  <ArtistCard
                    name={artist.name}
                    artTypeName={artist.artTypeName}
                    image={getImageUrl(artist.image || artist.artistImage)}
                    region={artist.state || artist.region}
                    onClick={() => navigate(`/artists/${artist._id}`)}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Artist Detail Modal - Responsive */}
      <Dialog
        open={!!selectedArtist}
        onOpenChange={() => setSelectedArtist(null)}>
        <DialogContent className="max-w-[95vw] xs:max-w-[90vw] sm:max-w-2xl md:max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
              {selectedArtist?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedArtist && (
            <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
              <div className="aspect-square rounded-lg sm:rounded-xl overflow-hidden bg-gray-100">
                <img
                  src={getImageUrl(selectedArtist.image)}
                  alt={selectedArtist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 sm:space-y-3 md:space-y-4">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 md:gap-3">
                  <span className="px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 bg-[#83261D]/10 text-[#83261D] rounded-full text-[10px] sm:text-xs md:text-sm font-semibold">
                    {selectedArtist.artTypeName}
                  </span>
                  <span className="px-2 sm:px-2.5 md:px-3 lg:px-4 py-1 sm:py-1.5 bg-gray-100 text-gray-700 rounded-full text-[10px] sm:text-xs md:text-sm flex items-center gap-0.5 sm:gap-1">
                    <span>📍</span>{" "}
                    {selectedArtist.state || selectedArtist.region}
                  </span>
                </div>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-700 leading-relaxed">
                  {selectedArtist.bio}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Modal - Responsive */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-[95vw] xs:max-w-[90vw] sm:max-w-md text-center rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6">
          <DialogHeader>
            <DialogTitle className="flex flex-col items-center gap-2 sm:gap-3 md:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-[#83261D]/10 rounded-full flex items-center justify-center">
                <span className="text-[#83261D] text-lg sm:text-xl md:text-2xl lg:text-3xl">
                  ✓
                </span>
              </div>
              <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                Success!
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 sm:space-y-4 md:space-y-5 pt-1 sm:pt-2">
            <p className="text-xs sm:text-sm md:text-base text-gray-600">
              Your submission has been received and is currently under review.
              Our team will verify the details and notify you once the review is
              complete.
            </p>

            <button
              onClick={() => setShowSuccess(false)}
              className="w-full bg-[#83261D] text-white py-1.5 sm:py-2 md:py-2.5 rounded-lg hover:bg-[#83261D]/90 transition-all hover:shadow-lg font-semibold text-xs sm:text-sm md:text-base">
              Continue Browsing
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Artists;
