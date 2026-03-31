/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import axios from "axios";
import { toast } from "react-toast";
import { State, City } from "country-state-city";
import Select from "react-select";
import { X, User, Phone, Calendar, MapPin, Globe, CheckCircle, ArrowRight } from "lucide-react";

const ArtFormModel = ({ title }: any) => {
  const [formData, setFormData] = useState({
    name: "",
    number: "",
    age: "",
    gender: "",
    countryType: "indian",
    state: "",
    city: "",
    address: "",
  });

  const [errors, setErrors] = useState<any>({});
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  const stateOptions = states.map((s) => ({
    label: s.name,
    value: s.name,
    isoCode: s.isoCode,
  }));

  const cityOptions = cities.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  /* ---------- VALIDATION ---------- */
  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    else if (formData.name.length < 2)
      newErrors.name = "Name must be at least 2 characters";

    if (!formData.number.trim()) newErrors.number = "Phone number is required";
    else if (formData.number.length !== 10)
      newErrors.number = "Phone number must be exactly 10 digits";

    const ageNum = Number(formData.age);
    if (!formData.age.trim()) newErrors.age = "Age is required";
    else if (isNaN(ageNum) || ageNum < 1 || ageNum > 150)
      newErrors.age = "Age must be between 1 and 150";

    if (!formData.gender) newErrors.gender = "Please select a gender";

    if (formData.countryType === "indian") {
      if (!formData.state) newErrors.state = "State is required";
      if (!formData.city) newErrors.city = "City is required";
    }

    if (formData.countryType === "nri") {
      if (!formData.address.trim()) newErrors.address = "Address is required";
    }

    return newErrors;
  };

  /* ---------- CHANGE ---------- */
  const handleChange = (e: any) => {
    const { name, value } = e.target;
    let updatedValue = value;

    if (name === "number") {
      updatedValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: updatedValue }));

    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: "" }));
    }
  };

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length !== 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const formattedLocation =
        formData.countryType === "indian"
          ? `${formData.city}, ${formData.state}, India`
          : `${formData.address.trim()}, NRI`;

      const payload = {
        artFormName: title,
        name: formData.name.trim(),
        phoneNumber: formData.number,
        age: Number(formData.age),
        location: formattedLocation,
        gender: formData.gender,
      };

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/applications`,
        payload,
      );

      setSubmitted(true);
      toast.success("Application submitted successfully");

      setFormData({
        name: "",
        number: "",
        age: "",
        gender: "",
        countryType: "indian",
        state: "",
        city: "",
        address: "",
      });

      setCities([]);

      setTimeout(() => {
        setOpen(false);
        setSubmitted(false);
      }, 4500);
    } catch (err) {
      console.error(err);
      toast.error("Application failed");
    }
  };

  const selectStyles = (hasError: boolean) => ({
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "32px",
      height: "32px",
      borderColor: hasError ? "#ef4444" : state.isFocused ? "#83261D" : "#e5e7eb",
      borderRadius: "6px",
      boxShadow: state.isFocused ? "0 0 0 2px rgba(131,38,29,0.1)" : "none",
      "&:hover": {
        borderColor: "#83261D",
      },
      fontSize: "12px",
    }),
    valueContainer: (base: any) => ({
      ...base,
      height: "30px",
      padding: "0 6px",
    }),
    input: (base: any) => ({
      ...base,
      margin: "0",
      padding: "0",
    }),
    indicatorsContainer: (base: any) => ({
      ...base,
      height: "30px",
    }),
    menu: (base: any) => ({
      ...base,
      maxHeight: "150px",
      overflowY: "auto",
      zIndex: 9999,
      fontSize: "12px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected 
        ? "#83261D" 
        : state.isFocused 
        ? "rgba(131,38,29,0.1)" 
        : "white",
      color: state.isSelected ? "white" : "#374151",
      fontSize: "12px",
      padding: "4px 8px",
    }),
    placeholder: (base: any) => ({
      ...base,
      fontSize: "12px",
    }),
    singleValue: (base: any) => ({
      ...base,
      fontSize: "12px",
    }),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="group relative overflow-hidden bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 lg:py-4 rounded-full text-xs sm:text-sm md:text-base font-semibold hover:shadow-2xl transition-all hover:scale-105 flex items-center gap-1 sm:gap-2">
          <span>Register for {title}</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[85vh] rounded-xl sm:rounded-2xl md:rounded-3xl shadow-2xl p-0 border-0 overflow-hidden flex flex-col">
        {!submitted && (
          <>
            {/* Header with Gradient - Sticky with Close Button */}
            <div className="bg-gradient-to-r from-[#83261D] to-[#B45F4A] px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 md:py-4 sticky top-0 z-10 flex-shrink-0 relative">
              {/* Close Button */}
              <button
                onClick={() => setOpen(false)}
                className="absolute right-3 sm:right-4 md:right-5 top-1/2 -translate-y-1/2 text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-full"
                aria-label="Close modal"
              >
                <X size={18} className="sm:w-5 sm:h-5" />
              </button>
              
              <DialogHeader>
                <DialogTitle className="flex items-center gap-1.5 sm:gap-2 text-base sm:text-lg md:text-xl font-bold text-white pr-8">
                  <div className="p-1 sm:p-1.5 bg-white/20 backdrop-blur-sm rounded-full">
                    <User size={12} className="text-white" />
                  </div>
                  Register for {title}
                </DialogTitle>
              </DialogHeader>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="px-3 sm:px-4 md:px-5 lg:px-6 py-3 sm:py-3.5 md:py-4">
                <div className="space-y-2 sm:space-y-2.5 md:space-y-3 pb-2">
                  {/* Name and Phone Row */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                    {/* Name Field */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                        <User size={10} className="text-[#83261D]" />
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full rounded-md sm:rounded-lg border px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-[#83261D]/20 outline-none transition-all ${
                          errors.name ? "border-red-500" : "border-gray-200 focus:border-[#83261D]"
                        }`}
                      />
                      {errors.name && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.name}</p>}
                    </div>

                    {/* Phone Field */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                        <Phone size={10} className="text-[#83261D]" />
                        Phone <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="number"
                        placeholder="10 digit number"
                        value={formData.number}
                        onChange={handleChange}
                        className={`w-full rounded-md sm:rounded-lg border px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-[#83261D]/20 outline-none transition-all ${
                          errors.number ? "border-red-500" : "border-gray-200 focus:border-[#83261D]"
                        }`}
                      />
                      {errors.number && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.number}</p>}
                    </div>
                  </div>

                  {/* Age and Gender Row */}
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-2.5 md:gap-3">
                    {/* Age Field */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                        <Calendar size={10} className="text-[#83261D]" />
                        Age <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        name="age"
                        placeholder="Your age"
                        value={formData.age}
                        onChange={handleChange}
                        className={`w-full rounded-md sm:rounded-lg border px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-[#83261D]/20 outline-none transition-all ${
                          errors.age ? "border-red-500" : "border-gray-200 focus:border-[#83261D]"
                        }`}
                      />
                      {errors.age && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.age}</p>}
                    </div>

                    {/* Gender Field */}
                    <div className="space-y-0.5">
                      <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`w-full rounded-md sm:rounded-lg border px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-[#83261D]/20 outline-none transition-all ${
                          errors.gender ? "border-red-500" : "border-gray-200 focus:border-[#83261D]"
                        }`}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.gender && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.gender}</p>}
                    </div>
                  </div>

                  {/* Country Type */}
                  <div className="space-y-0.5">
                    <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                      <Globe size={10} className="text-[#83261D]" />
                      Residency Status
                    </label>
                    <div className="flex gap-3 sm:gap-4">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="countryType"
                          value="indian"
                          checked={formData.countryType === "indian"}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              countryType: e.target.value,
                              state: "",
                              city: "",
                              address: "",
                            }));
                            setCities([]);
                          }}
                          className="w-3 h-3 text-[#83261D]"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Indian</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="countryType"
                          value="nri"
                          checked={formData.countryType === "nri"}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              countryType: e.target.value,
                              state: "",
                              city: "",
                              address: "",
                            }));
                            setCities([]);
                          }}
                          className="w-3 h-3 text-[#83261D]"
                        />
                        <span className="text-xs sm:text-sm text-gray-700">Non-Indian</span>
                      </label>
                    </div>
                  </div>

                  {/* INDIAN FLOW */}
                  {formData.countryType === "indian" && (
                    <div className="space-y-2">
                      {/* State Select */}
                      <div className="space-y-0.5">
                        <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                          <MapPin size={10} className="text-[#83261D]" />
                          State <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={stateOptions}
                          placeholder="Select State"
                          value={
                            formData.state
                              ? stateOptions.find((s) => s.value === formData.state)
                              : null
                          }
                          onChange={(option: any) => {
                            if (!option) return;
                            setFormData((prev) => ({
                              ...prev,
                              state: option.value,
                              city: "",
                            }));
                            setCities(City.getCitiesOfState("IN", option.isoCode));
                          }}
                          styles={selectStyles(!!errors.state)}
                        />
                        {errors.state && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.state}</p>}
                      </div>

                      {/* City Select */}
                      <div className="space-y-0.5">
                        <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                          <MapPin size={10} className="text-[#83261D]" />
                          City <span className="text-red-500">*</span>
                        </label>
                        <Select
                          options={cityOptions}
                          placeholder="Select City"
                          isDisabled={!formData.state}
                          value={
                            formData.city
                              ? cityOptions.find((c) => c.value === formData.city)
                              : null
                          }
                          onChange={(option: any) =>
                            setFormData((prev) => ({
                              ...prev,
                              city: option?.value || "",
                            }))
                          }
                          styles={selectStyles(!!errors.city)}
                        />
                        {errors.city && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.city}</p>}
                      </div>
                    </div>
                  )}

                  {/* NRI FLOW */}
                  {formData.countryType === "nri" && (
                    <div className="space-y-0.5">
                      <label className="text-[10px] sm:text-xs font-medium text-gray-700 flex items-center gap-0.5 sm:gap-1">
                        <MapPin size={10} className="text-[#83261D]" />
                        Full Address <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="address"
                        rows={3}
                        placeholder="Enter your complete address"
                        value={formData.address}
                        onChange={handleChange}
                        className={`w-full rounded-md sm:rounded-lg border px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 text-xs sm:text-sm focus:ring-1 focus:ring-[#83261D]/20 outline-none transition-all resize-none ${
                          errors.address ? "border-red-500" : "border-gray-200 focus:border-[#83261D]"
                        }`}
                      />
                      {errors.address && <p className="text-red-500 text-[9px] sm:text-xs mt-0.5">{errors.address}</p>}
                    </div>
                  )}

                  {/* Submit Button - Added extra bottom padding */}
                  <div className="pt-2 sm:pt-3">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white py-2 sm:py-2.5 rounded-md sm:rounded-lg font-semibold hover:shadow-md transition-all hover:scale-[1.02] text-xs sm:text-sm"
                    >
                      Submit Application
                    </button>
                  </div>

                  {/* Required Fields Note */}
                  <p className="text-[9px] sm:text-xs text-gray-400 text-center pt-1">
                    <span className="text-red-500">*</span> Required fields
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Success State - Scrollable */}
        {submitted && (
          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="flex flex-col items-center justify-center py-10 sm:py-12 md:py-14 lg:py-16 px-4 sm:px-6 md:px-8 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-20 lg:h-20 rounded-full bg-green-100 flex items-center justify-center mb-3 sm:mb-4 md:mb-5 lg:mb-6 animate-scale-in">
                <CheckCircle className="text-green-600 w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-10 lg:h-10" />
              </div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-2 sm:mb-3">
                Application Submitted!
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 mb-4 sm:mb-5 md:mb-6 max-w-[250px] sm:max-w-sm">
                Thank you for your interest in {title}. Our team will review your submission and contact you soon.
              </p>
              <button
                onClick={() => setOpen(false)}
                className="px-4 sm:px-5 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 text-xs sm:text-sm md:text-base"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ArtFormModel;