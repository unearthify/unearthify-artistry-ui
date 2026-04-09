/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { State, City } from "country-state-city";
import Select from "react-select";
import { toast } from "react-hot-toast";
import { Upload, X, Image, MapPin, User, Palette, FileText, Check, Phone, Mail } from "lucide-react";
import axios from "axios";

interface ArtistData {
  name: string;
  email: string;
  phone: string;
  website: string;
  country: string;
  state: string;
  city: string;
  bio: string;
  selectedData: any[];
  imageFile: File | null;
  previewUrl: string | null;
}

interface AddArtistProps {
  editData?: any;
  onSuccess?: () => void;
}

const AddArtist = ({ editData, onSuccess }: AddArtistProps) => {
  const [formData, setFormData] = useState<ArtistData>({
    name: "",
    email: "",
    phone: "",
    website: "",
    country: "India",
    state: "",
    city: "",
    bio: "",
    selectedData: [],
    imageFile: null,
    previewUrl: null,
  });

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditMode = !!editData;

  const API_BASE_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    // Fetch categories
    fetch(`${API_BASE_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data;
        setCategories(list || []);
      })
      .catch(err => console.error("Error fetching categories:", err));

    // Fetch states
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  useEffect(() => {
    if (editData && categories.length > 0) {
      //  find category
      const categoryObj = categories.find(
        (c) => c._id === editData.category
      );

      let selectedDataFormatted: any[] = [];

      if (categoryObj) {
        selectedDataFormatted = [
          {
            categoryId: categoryObj._id,
            artTypes: [editData.artTypeId], // 🔥 selected artType
            artTypeOptions: categoryObj.artTypes.map((t: any) => ({
              label: t.name,
              value: t._id,
            })),
          },
        ];
      }

      setFormData((prev) => ({
        ...prev,
        name: editData.name || "",
        email: editData.email || "",
        phone: editData.phone || "",
        website: editData.website || "",
        country: editData.country || "India",
        state: editData.state || "",
        city: editData.city || "",
        bio: editData.bio || "",
        selectedData: selectedDataFormatted, // 🔥 IMPORTANT
        previewUrl: editData.image || null,
      }));

      // load cities
      if (editData.state) {
        const stateObj = State.getStatesOfCountry("IN").find(
          (s) => s.name === editData.state
        );
        if (stateObj) {
          const cityList = City.getCitiesOfState("IN", stateObj.isoCode);
          setCities(cityList);
        }
      }
    }
  }, [editData, categories]);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 2 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image must be smaller than 2MB");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    handleChange("imageFile", file);
    handleChange("previewUrl", URL.createObjectURL(file));
  };

  const removeImage = () => {
    handleChange("imageFile", null);
    handleChange("previewUrl", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const nameRegex = /^[A-Za-z\s]+$/;
    const urlRegex =
      /^(https?:\/\/)?([\w\d-]+\.)+[\w-]{2,}(\/.*)?$/i;

    // Name validation
    if (!formData.name.trim()) {
      toast.error("Artist name is required");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return false;
    }

    if (!nameRegex.test(formData.name.trim())) {
      toast.error("Artist name should contain only letters");
      return false;
    }

    if (formData.name.trim().length < 3) {
      toast.error("Artist name must be at least 3 characters");
      return false;
    }

    // Email validation
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Enter a valid email address");
      return false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return false;
    }

    if (!phoneRegex.test(formData.phone.trim())) {
      toast.error("Enter valid 10-digit mobile number");
      return false;
    }

    // Website validation (optional)
    if (
      formData.website &&
      formData.website.trim() &&
      !urlRegex.test(formData.website.trim())
    ) {
      toast.error("Enter valid website URL");
      return false;
    }

    // State validation
    if (!formData.state) {
      toast.error("Please select state");
      return false;
    }

    // City validation
    if (!formData.city) {
      toast.error("Please select city");
      return false;
    }

    // Bio validation
    if (!formData.bio.trim()) {
      toast.error("Artist biography is required");
      return false;
    }

    if (formData.bio.trim().length < 20) {
      toast.error("Biography must be at least 20 characters");
      return false;
    }

    // Category validation
    if (!formData.selectedData || formData.selectedData.length === 0) {
      toast.error("Please select at least one category");
      return false;
    }

    // Art type validation
    const hasArtTypes = formData.selectedData.every(
      (item: any) => item.artTypes && item.artTypes.length > 0
    );

    if (!hasArtTypes) {
      toast.error("Please select at least one art type for each category");
      return false;
    }

    // Image validation only in create mode
    if (!isEditMode && !formData.imageFile) {
      toast.error("Please upload artist profile picture");
      return false;
    }

    // Image file validation
    if (formData.imageFile) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

      if (!allowedTypes.includes(formData.imageFile.type)) {
        toast.error("Image must be JPG, PNG, or WEBP");
        return false;
      }

      if (formData.imageFile.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      if (editData) {
        const firstCategory = formData.selectedData?.[0];

        if (!firstCategory || !firstCategory.artTypes?.length) {
          toast.error("Please select category and art type");
          setSubmitting(false);
          return;
        }

        const firstArtTypeId = firstCategory.artTypes[0];

        const firstArtTypeName =
          categories
            .find((c: any) => c._id === firstCategory.categoryId)
            ?.artTypes?.find((t: any) => t._id === firstArtTypeId)?.name || "";

        const submitData = new FormData();

        submitData.append("name", formData.name);
        submitData.append("email", formData.email);
        submitData.append("phone", formData.phone);
        submitData.append("website", formData.website || "");
        submitData.append("country", formData.country);
        submitData.append("state", formData.state);
        submitData.append("city", formData.city);
        submitData.append("bio", formData.bio);
        submitData.append("category", firstCategory.categoryId);
        submitData.append("artTypeId", firstArtTypeId);
        submitData.append("artTypeName", firstArtTypeName);

        if (formData.imageFile) {
          submitData.append("image", formData.imageFile);
        }

        const source = editData._source || "artist";

        if (source === "submission") {
          await axios.patch(
            `${API_BASE_URL}/api/artist-submissions/${editData._id}/update`,
            submitData,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        } else {
          await axios.put(
            `${API_BASE_URL}/api/artists/${editData._id}`,
            submitData,
            { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
          );
        }

        toast.success("Artist updated successfully!");
        if (onSuccess) onSuccess();
        return;
      }

      // ── CREATE flow (unchanged) ──
      const submissions = [];

      for (const categoryData of formData.selectedData) {
        const categoryName = categories.find((c) => c._id === categoryData.categoryId);

        for (const artTypeId of categoryData.artTypes) {
          const artTypeName =
            categoryName?.artTypes?.find((t: any) => t._id === artTypeId)?.name || "";

          const submitData = new FormData();
          submitData.append("name", formData.name);
          submitData.append("email", formData.email);
          submitData.append("phone", formData.phone);
          submitData.append("website", formData.website || "");
          submitData.append("country", formData.country);
          submitData.append("state", formData.state);
          submitData.append("city", formData.city);
          submitData.append("bio", formData.bio);
          submitData.append("category", categoryData.categoryId);
          submitData.append("artTypeId", artTypeId);
          submitData.append("artTypeName", artTypeName);

          if (formData.imageFile) {
            submitData.append("image", formData.imageFile);
          }

          submissions.push(submitData);
        }
      }

      await Promise.all(
        submissions.map((submitData) =>
          axios.post(
            `${API_BASE_URL}/api/artist-submissions`,
            submitData,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
        )
      );

      toast.success(`${submissions.length} artist submission(s) sent for review!`);
      setFormData({
        name: "", email: "", phone: "", website: "",
        country: "India", state: "", city: "", bio: "",
        selectedData: [], imageFile: null, previewUrl: null,
      });
      setCities([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

    } catch (error: any) {
      console.error("SUBMIT ERROR", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to submit artist");
    } finally {
      setSubmitting(false);
    }
  };

  const stateOptions = states.map((s) => ({
    label: s.name,
    value: s.name,
    isoCode: s.isoCode,
  }));

  const cityOptions = cities.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  const customSelectStyles = {
    control: (base: any, state: any) => ({
      ...base,
      minHeight: "40px",
      borderRadius: "10px",
      borderColor: state.isFocused ? "#83261D" : "#e5e7eb",
      boxShadow: state.isFocused ? "0 0 0 3px rgba(131,38,29,0.1)" : "none",
      "&:hover": {
        borderColor: "#83261D",
      },
      fontSize: "14px",
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isSelected
        ? "#83261D"
        : state.isFocused
          ? "rgba(131,38,29,0.1)"
          : "white",
      color: state.isSelected ? "white" : "#374151",
      fontSize: "13px",
    }),
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="space-y-6 sm:space-y-8">

          {/* Form Fields */}
          <div className="space-y-5">
            {/* Name and Email Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <User size={14} className="text-[#83261D]" />
                  Artist Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm sm:text-base"
                  placeholder="e.g., Ravi Shankar"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Mail size={14} className="text-[#83261D]" />
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm sm:text-base"
                  placeholder="artist@example.com"
                />
              </div>
            </div>

            {/* Phone and Website Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Phone size={14} className="text-[#83261D]" />
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm sm:text-base"
                  placeholder="+91 9876543210"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Website (Optional)</label>
                <input
                  value={formData.website}
                  onChange={(e) => handleChange("website", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all text-sm sm:text-base"
                  placeholder="https://example.com"
                />
              </div>
            </div>

            {/* Categories and Art Types */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Palette size={14} className="text-[#83261D]" />
                  Category <span className="text-red-500">*</span>
                </label>
                <Select
                  isMulti
                  options={categories.map(cat => ({
                    label: cat.name,
                    value: cat._id,
                    artTypes: cat.artTypes
                  }))}
                  value={formData.selectedData.map(item => ({
                    label: categories.find(c => c._id === item.categoryId)?.name,
                    value: item.categoryId
                  }))}
                  onChange={(selectedCategories: any) => {
                    const newData = selectedCategories.map((cat: any) => {
                      const existing = formData.selectedData.find(
                        (s: any) => s.categoryId === cat.value
                      );
                      return existing || {
                        categoryId: cat.value,
                        artTypes: [],
                        artTypeOptions: cat.artTypes.map((t: any) => ({
                          label: t.name,
                          value: t._id,
                        })),
                      };
                    });
                    handleChange("selectedData", newData);
                  }}
                  styles={customSelectStyles}
                  placeholder="Select categories..."
                />
              </div>

              {formData.selectedData.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                    <Palette size={14} className="text-[#83261D]" />
                    Art Types <span className="text-red-500">*</span>
                  </label>
                  {formData.selectedData.map((item: any, index: number) => {
                    const catLabel = categories.find(c => c._id === item.categoryId)?.name;
                    return (
                      <div key={item.categoryId} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-sm font-semibold text-gray-800 mb-2">{catLabel}</p>
                        <Select
                          isMulti
                          options={item.artTypeOptions}
                          value={item.artTypeOptions.filter((opt: any) =>
                            item.artTypes.includes(opt.value)
                          )}
                          onChange={(selected: any) => {
                            const updated = [...formData.selectedData];
                            updated[index] = {
                              ...updated[index],
                              artTypes: selected ? selected.map((s: any) => s.value) : [],
                            };
                            handleChange("selectedData", updated);
                          }}
                          styles={customSelectStyles}
                          placeholder="Select art types..."
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="bg-gradient-to-r from-amber-50/50 to-white p-4 sm:p-5 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={18} className="text-[#83261D] flex-shrink-0" />
                <h4 className="text-base font-semibold text-gray-900">Location Details</h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">Country</label>
                  <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 text-sm sm:text-base">
                    <span className="mr-2">🇮🇳</span> India
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">State <span className="text-red-500">*</span></label>
                  <Select
                    key={formData.state}
                    options={stateOptions}
                    value={stateOptions.find(s => s.value === formData.state)}
                    placeholder="Select State"
                    onChange={(option) => {
                      if (!option) return;
                      handleChange("state", option.value);
                      handleChange("city", "");
                      const cityList = City.getCitiesOfState("IN", option.isoCode);
                      setCities(cityList);
                    }}
                    styles={customSelectStyles}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-600">City <span className="text-red-500">*</span></label>
                  <Select
                    options={cityOptions}
                    value={cityOptions.find(c => c.value === formData.city)}
                    onChange={(option) => handleChange("city", option?.value || "")}
                    placeholder="Select City"
                    isDisabled={!formData.state}
                    styles={customSelectStyles}
                  />
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <FileText size={14} className="text-[#83261D]" />
                Artist Biography <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all h-32 resize-none text-sm sm:text-base"
                placeholder="Share the artist's journey, achievements, artistic style, and contributions..."
              />
              <p className="text-xs text-gray-400 text-right">{formData.bio.length} characters</p>
            </div>

            {/* Image Upload */}
            <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#83261D]/30 transition-colors">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative group flex-shrink-0">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center shadow-md">
                    {formData.previewUrl ? (
                      <img
                        src={formData.previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image size={32} className="text-gray-300" />
                    )}
                  </div>
                  {formData.previewUrl && (
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-2">
                  <p className="text-base font-bold text-gray-800 flex items-center gap-2 justify-center sm:justify-start">
                    Artist Profile Picture <span className="text-red-500">*</span>
                  </p>
                  <p className="text-sm text-gray-500">Upload a clear portrait or photo of the artist</p>
                  <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                    <label className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                      <Upload size={14} className="mr-2" />
                      Choose Image
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-400 self-center">JPG, PNG • Max 2MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
            {!isEditMode && (
              <button
                onClick={() => {
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    website: "",
                    country: "India",
                    state: "",
                    city: "",
                    bio: "",
                    selectedData: [],
                    imageFile: null,
                    previewUrl: null,
                  });
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Reset
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? "Updating..." : "Adding Artist..."}
                </>
              ) : (
                <>
                  {editData ? "Update Artist" : "Submit for Review"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddArtist;