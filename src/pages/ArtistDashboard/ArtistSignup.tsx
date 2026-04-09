/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ArrowRight, Eye, EyeOff, User, Phone, Info, Briefcase, Award, MapPin, Globe, Camera, X, Sparkles, Check, AlertCircle, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";
import { toast } from "react-hot-toast";

const ArtistSignup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Artist-specific fields
  const [about, setAbout] = useState("");
  const [specialization, setSpecialization] = useState<string[]>([]);
  const [specializationInput, setSpecializationInput] = useState("");
  const [experience, setExperience] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [website, setWebsite] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleAddSpecialization = () => {
    if (specializationInput.trim() && !specialization.includes(specializationInput.trim())) {
      setSpecialization([...specialization, specializationInput.trim()]);
      setSpecializationInput("");
    }
  };

  const handleRemoveSpecialization = (item: string) => {
    setSpecialization(specialization.filter(s => s !== item));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSpecialization();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image must be less than 2MB");
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSignup = async () => {
    // Trim values
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();
    const trimmedAbout = about.trim();
    const trimmedExperience = experience.toString().trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedWebsite = website.trim();

    // Regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const urlRegex =
      /^(https?:\/\/)?([\w\d-]+\.)+[\w-]{2,}(\/.*)?$/i;

    // Required field validation
    if (
      !trimmedName ||
      !trimmedEmail ||
      !trimmedPhone ||
      !password ||
      !confirmPassword ||
      !trimmedAbout ||
      specialization.length === 0 ||
      !trimmedExperience ||
      !trimmedCity ||
      !trimmedState
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Name validation
    if (!nameRegex.test(trimmedName)) {
      toast.error("Name should contain only letters");
      return;
    }

    if (trimmedName.length < 3) {
      toast.error("Name must be at least 3 characters");
      return;
    }

    // Email validation
    if (!emailRegex.test(trimmedEmail)) {
      toast.error("Enter a valid email address");
      return;
    }

    // Phone validation
    if (!phoneRegex.test(trimmedPhone)) {
      toast.error("Enter a valid 10-digit mobile number");
      return;
    }

    // Password validation
    if (!passwordRegex.test(password)) {
      toast.error(
        "Password must contain 8+ chars, uppercase, lowercase, number, special character"
      );
      return;
    }

    // Confirm password
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // About validation
    if (trimmedAbout.length < 20) {
      toast.error("About section must be at least 20 characters");
      return;
    }

    // Experience validation
    if (isNaN(Number(trimmedExperience)) || Number(trimmedExperience) < 0) {
      toast.error("Experience must be a valid positive number");
      return;
    }

    // City / State validation
    if (trimmedCity.length < 2) {
      toast.error("Enter valid city name");
      return;
    }

    if (trimmedState.length < 2) {
      toast.error("Enter valid state name");
      return;
    }

    // Website validation (optional field)
    if (trimmedWebsite && !urlRegex.test(trimmedWebsite)) {
      toast.error("Enter a valid website URL");
      return;
    }

    // Profile image validation
    if (profileImage) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(profileImage.type)) {
        toast.error("Profile image must be JPG, PNG, or WEBP");
        return;
      }

      if (profileImage.size > 2 * 1024 * 1024) {
        toast.error("Profile image must be less than 5MB");
        return;
      }
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", trimmedName);
      formData.append("email", trimmedEmail);
      formData.append("phone", trimmedPhone);
      formData.append("password", password);
      formData.append("about", trimmedAbout);
      formData.append("specialization", JSON.stringify(specialization));
      formData.append("experience", trimmedExperience);
      formData.append("city", trimmedCity);
      formData.append("state", trimmedState);
      formData.append("website", trimmedWebsite);

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/artists/signup`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(
        "Signup submitted successfully! Wait for admin approval"
      );
      navigate("/artist-login");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/30 via-white to-[#83261D]/5">
      <Navbar />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center my-8 sm:my-8 animate-fadeInDown">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full shadow-lg transform transition-transform hover:scale-110 duration-300">
                <User size={32} className="text-white" />
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mt-4 bg-gradient-to-r from-[#83261D] to-[#B45F4A] bg-clip-text text-transparent">
              Create Artist Account
            </h1>
          </div>

          {/* Signup Form Card */}
          <div className="relative animate-slideUp">
            <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-2xl blur-xl opacity-20"></div>
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-100 p-6 sm:p-8 md:p-10">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#83261D]/5 to-transparent rounded-tr-2xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tl from-[#B45F4A]/5 to-transparent rounded-bl-2xl"></div>

              <div className="space-y-6 sm:space-y-8">

                {/* Personal Information Section */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-lg">
                      <User size={16} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Name Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="email"
                          placeholder="artist@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    {/* Phone Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="tel"
                          placeholder="10 digit mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    {/* City Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="Your city"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    {/* State Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="Your state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>

                    {/* Website Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Website (Optional)
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="url"
                          placeholder="https://yourwebsite.com"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Professional Information Section */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-lg">
                      <Briefcase size={16} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Professional Information</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>

                  <div className="space-y-5">
                    {/* About Artist */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        About Artist <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Info className="absolute left-3 top-3 text-gray-400" size={18} />
                        <textarea
                          placeholder="Tell us about yourself, your artistic journey, inspiration, etc."
                          value={about}
                          onChange={(e) => setAbout(e.target.value)}
                          rows={4}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm resize-none bg-white/50"
                        />
                      </div>
                    </div>

                    {/* Specialization */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Specialization <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                        <input
                          type="text"
                          placeholder="Type your art form and press Enter or click Add"
                          value={specializationInput}
                          onChange={(e) => setSpecializationInput(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="w-full pl-10 pr-24 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                        <button
                          onClick={handleAddSpecialization}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white text-xs rounded-lg hover:shadow-md transition-all"
                        >
                          Add
                        </button>
                      </div>

                      {/* Specialization Chips */}
                      {specialization.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {specialization.map((item, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-50 to-amber-100 text-[#83261D] text-sm rounded-xl border border-[#83261D]/20 shadow-sm"
                            >
                              {item}
                              <button
                                onClick={() => handleRemoveSpecialization(item)}
                                className="hover:text-red-500 transition-colors"
                              >
                                <X size={14} />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                      <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                        <Sparkles size={10} /> Add all your art forms/specializations
                      </p>
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Years of Experience <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#83261D] transition-colors" size={18} />
                        <input
                          type="text"
                          placeholder="e.g., 5 years, Fresher, 10+ years"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Image Section */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-lg">
                      <Camera size={16} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Profile Image</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    {previewUrl && (
                      <div className="relative group/image">
                        <div className="absolute inset-0 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-xl blur opacity-50"></div>
                        <div className="relative w-28 h-28 rounded-xl overflow-hidden border-3 border-white shadow-lg">
                          <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <button
                          onClick={() => {
                            setProfileImage(null);
                            setPreviewUrl(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-all hover:scale-110 shadow-lg"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    )}

                    <label className="cursor-pointer group/upload">
                      <div className="px-6 py-3 border-2 border-[#83261D] text-[#83261D] rounded-xl hover:bg-gradient-to-r hover:from-[#83261D] hover:to-[#B45F4A] hover:text-white transition-all duration-300 text-sm font-medium flex items-center gap-2">
                        <Camera size={16} />
                        {previewUrl ? "Change Image" : "Upload Profile Image"}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <AlertCircle size={12} /> Max file size: 2MB (JPG, PNG, GIF)
                    </p>
                  </div>
                </div>

                {/* Account Security Section */}
                <div className="group">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-lg">
                      <Lock size={16} className="text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Account Security</h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Password Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#83261D] transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="group/field">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/field:text-[#83261D] transition-colors" size={18} />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm bg-white/50"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#83261D] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signup Button */}
                <button
                  onClick={handleSignup}
                  disabled={isLoading}
                  className={`w-full bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg ${isLoading
                    ? "opacity-70 cursor-not-allowed"
                    : "hover:shadow-2xl hover:scale-[1.02] active:scale-98"
                    }`}
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Artist Account</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <Link
                      to="/artist-login"
                      className="text-[#83261D] font-semibold hover:text-[#6e1f17] transition-all hover:underline"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>

                {/* Terms */}
                <div className="text-center pt-4">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-gradient-to-r from-[#83261D] to-[#B45F4A] rounded-full flex items-center justify-center">
                          <Mail size={14} className="text-white" />
                        </div>
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-gray-800 mb-1">Admin Approval Required</p>
                        <p className="text-xs text-gray-600">
                          Your account will be reviewed by our admin team. Once approved or rejected,
                          you will receive a notification email at <span className="font-semibold text-[#83261D]">{email || "your registered email address"}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                          <span className="font-semibold text-[#83261D]">Note:</span> You will be able to login only after your account is <span className="font-semibold text-green-600">approved</span> by the admin.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ArtistSignup;