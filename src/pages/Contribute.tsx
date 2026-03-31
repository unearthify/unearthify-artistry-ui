/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Sparkles,
  Heart,
  Users,
  Palette,
  Calendar,
  MapPin,
  ArrowRight,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";

const Contribute = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    type: "",
    description: "",
  });
  const [submittedName, setSubmittedName] = useState("");
  const [errors, setErrors] = useState<any>({});
  const [touched, setTouched] = useState<any>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: any = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      newErrors.name = "Name can only contain letters and spaces";
    }

    // Mobile validation
    if (!formData.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = "Mobile number must be 10 digits";
    } else if (!/^[6-9]/.test(formData.mobile)) {
      newErrors.mobile = "Mobile number must start with 6-9";
    }

    // Type validation
    if (!formData.type) {
      newErrors.type = "Please select a contribution type";
    }

    // Description validation
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    } else if (formData.description.trim().length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    return newErrors;
  };

  const handleChange = (field: string, value: string) => {
    // Allow only numbers for mobile field
    if (field === "mobile") {
      value = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
    // Validate single field on blur
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!formData.name.trim()) {
          newErrors.name = "Name is required";
        } else if (formData.name.trim().length < 2) {
          newErrors.name = "Name must be at least 2 characters";
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
          newErrors.name = "Name can only contain letters and spaces";
        } else {
          delete newErrors.name;
        }
        break;
      case "mobile":
        if (!formData.mobile.trim()) {
          newErrors.mobile = "Mobile number is required";
        } else if (formData.mobile.length !== 10) {
          newErrors.mobile = "Mobile number must be 10 digits";
        } else if (!/^[6-9][0-9]{9}$/.test(formData.mobile)) {
          newErrors.mobile = "Mobile number must start with 6-9";
        } else {
          delete newErrors.mobile;
        }
        break;
      case "type":
        if (!formData.type) {
          newErrors.type = "Please select a contribution type";
        } else {
          delete newErrors.type;
        }
        break;
      case "description":
        if (!formData.description.trim()) {
          newErrors.description = "Description is required";
        } else if (formData.description.trim().length < 10) {
          newErrors.description = "Description must be at least 10 characters";
        } else if (formData.description.trim().length > 1000) {
          newErrors.description = "Description cannot exceed 1000 characters";
        } else {
          delete newErrors.description;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);
      try {
        const payload = {
          name: formData.name,
          mobileNumber: formData.mobile,
          contributionType: formData.type,
          description: formData.description,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/contribute`,
          payload,
        );

        if (response.status === 200 || response.status === 201) {
          setSubmittedName(formData.name);
          setShowSuccess(true);
          // Reset form
          setFormData({ name: "", mobile: "", type: "", description: "" });
          setErrors({});
          setTouched({});
        }
      } catch (error) {
        console.error("Error submitting contribution:", error);
        toast("Failed to submit contribution. Please try again later.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  useEffect(() => {
    if (!showSuccess) return;
    const t = setTimeout(() => {
      setShowSuccess(false);
      setSubmittedName("");
    }, 4500);
    return () => clearTimeout(t);
  }, [showSuccess]);

  const contributionTypes = [
    {
      value: "artist",
      label: "Artist Information",
      icon: Users,
      description: "Share details about talented artists",
    },
    {
      value: "artform",
      label: "Art Form Details",
      icon: Palette,
      description: "Help document traditional art forms",
    },
    {
      value: "event",
      label: "Cultural Event",
      icon: Calendar,
      description: "Inform us about cultural events",
    },
    {
      value: "other",
      label: "Other",
      icon: Globe,
      description: "Other cultural information",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-white to-white">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="relative bg-gradient-to-r from-[#83261D] to-[#B45F4A] py-20 overflow-hidden">
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
          {["🎭", "🎨", "🎪", "✨"].map((emoji, i) => (
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
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2 mb-6">
              <Heart className="w-4 h-4 text-amber-300" />
              <span className="text-white/90 text-sm font-medium">
                Join Our Mission
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Contribute to Unearthify
            </h1>

            <p className="text-xl text-white/90 max-w-2xl leading-relaxed">
              Help us build a comprehensive database of Indian artists, art
              forms, and cultural events. Your contribution matters!
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

      {/* ================= FORM SECTION ================= */}
      <section className="container mx-auto px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] px-8 py-6">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Share Information
              </h2>
              <p className="text-white/80 text-sm mt-1">
                Fill in the details below to contribute information about an
                artist, art form, or cultural event.
              </p>
            </div>

            {/* Form Content */}
            <div className="p-8">
              <div className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    onBlur={() => handleBlur("name")}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all ${
                      errors.name && touched.name
                        ? "border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-[#83261D]"
                    }`}
                  />
                  {errors.name && touched.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Mobile */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={formData.mobile}
                      onChange={(e) => handleChange("mobile", e.target.value)}
                      onBlur={() => handleBlur("mobile")}
                      className={`w-full pl-14 pr-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all ${
                        errors.mobile && touched.mobile
                          ? "border-red-500 bg-red-50/50"
                          : "border-gray-200 focus:border-[#83261D]"
                      }`}
                    />
                  </div>
                  {errors.mobile && touched.mobile && (
                    <p className="text-sm text-red-600 mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Contribution Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Contribution Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {contributionTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <label
                          key={type.value}
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all ${
                            formData.type === type.value
                              ? "border-[#83261D] bg-[#83261D]/5"
                              : "border-gray-200 hover:border-[#83261D]/30"
                          }`}>
                          <input
                            type="radio"
                            name="type"
                            value={type.value}
                            checked={formData.type === type.value}
                            onChange={(e) =>
                              handleChange("type", e.target.value)
                            }
                            onBlur={() => handleBlur("type")}
                            className="sr-only"
                          />
                          <div className="flex flex-col items-center text-center">
                            <Icon
                              className={`w-6 h-6 mb-2 ${
                                formData.type === type.value
                                  ? "text-[#83261D]"
                                  : "text-gray-400"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                formData.type === type.value
                                  ? "text-[#83261D]"
                                  : "text-gray-700"
                              }`}>
                              {type.label}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {errors.type && touched.type && (
                    <p className="text-sm text-red-600 mt-1">{errors.type}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Provide detailed information about the artist, art form, or event..."
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    onBlur={() => handleBlur("description")}
                    rows={5}
                    className={`w-full px-4 py-3 rounded-xl border focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all resize-none ${
                      errors.description && touched.description
                        ? "border-red-500 bg-red-50/50"
                        : "border-gray-200 focus:border-[#83261D]"
                    }`}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-gray-500">
                      Include names, locations, dates, specialties, etc.
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        formData.description.length > 900
                          ? "text-orange-500"
                          : "text-gray-400"
                      }`}>
                      {formData.description.length}/1000
                    </span>
                  </div>
                  {errors.description && touched.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white py-4 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed text-base">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Submit Contribution
                      <ArrowRight size={18} />
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            {contributionTypes.slice(0, 3).map((type, index) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.value}
                  className="bg-white rounded-xl p-6 text-center border border-gray-100 shadow-lg hover:shadow-xl transition-all group">
                  <div className="w-16 h-16 bg-[#83261D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-8 h-8 text-[#83261D]" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {type.label}
                  </h3>
                  <p className="text-sm text-gray-500">{type.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />

      {/* Success Modal - Responsive */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="max-w-md rounded-2xl p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] p-6 text-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-white" size={40} />
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              Thank You, {submittedName}!
            </DialogTitle>
          </div>

          <div className="p-8 text-center">
            <p className="text-gray-600 mb-6">
              Your contribution has been received successfully. Our team will
              review the information and get back to you soon.
            </p>
            <Button
              onClick={() => setShowSuccess(false)}
              className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white px-8 py-3 rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105">
              Explore More
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Contribute;