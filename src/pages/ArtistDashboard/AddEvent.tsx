/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import {toast} from "react-hot-toast";
import {
  Upload,
  X,
  Image as ImageIcon,
  Calendar,
  MapPin,
  Tag,
  Repeat,
  FileText,
  Check,
} from "lucide-react";

type Category = {
  _id: string;
  name: string;
};

interface AddEventProps {
  editData?: any;
  onSuccess?: () => void;
}

interface EventFormData {
  title: string;
  description: string;
  date: string;
  location: string;
  categories: string;
  recurrence: "none" | "monthly" | "yearly";
  visibleFrom: string;
  imageFile: File | null;
  previewUrl: string | null;
}

const AddEvent = ({ editData, onSuccess }: AddEventProps) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageError, setImageError] = useState("");

  const isEditMode = !!editData;

  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    description: "",
    date: "",
    location: "",
    categories: "",
    recurrence: "none",
    visibleFrom: "",
    imageFile: null,
    previewUrl: null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/categories`);
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : [];
        setCategories(list);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load categories");
      }
    };

    fetchCategories();
  }, [API_BASE_URL]);

  useEffect(() => {
    if (editData) {
      setFormData((prev) => ({
        ...prev,
        title: editData.title || "",
        description: editData.description || "",
        date: editData.date ? editData.date.slice(0, 10) : "",
        location: editData.location || "",
        categories: editData.categories || "",
        recurrence: editData.recurrence || "none",
        visibleFrom: editData.visibleFrom
          ? editData.visibleFrom.slice(0, 10)
          : "",
        previewUrl: editData.image || null,
      }));
    }
  }, [editData]);

  const handleChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setImageError("Image must be less than 2MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageError("Only image files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setImageError("");
    handleChange("imageFile", file);
    handleChange("previewUrl", URL.createObjectURL(file));
  };

  const removeImage = () => {
    handleChange("imageFile", null);
    handleChange("previewUrl", null);
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validateForm = () => {
    if (!formData.categories) {
      toast.error("Please select category");
      return false;
    }
    if (!formData.title.trim()) {
      toast.error("Event title is required");
      return false;
    }
    if (!formData.date) {
      toast.error("Event date is required");
      return false;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return false;
    }
    if (!formData.description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!isEditMode && !formData.imageFile) {
      toast.error("Please upload event image");
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      location: "",
      categories: "",
      recurrence: "none",
      visibleFrom: "",
      imageFile: null,
      previewUrl: null,
    });
    setImageError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required fields properly");
      return;
    }

    setSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("date", formData.date);
      submitData.append("location", formData.location);
      submitData.append("categories", formData.categories);
      submitData.append("recurrence", formData.recurrence);
      submitData.append("visibleFrom", formData.visibleFrom);

      if (formData.imageFile) {
        submitData.append("image", formData.imageFile);
      }

      if (isEditMode) {
        await axios.patch(`${API_BASE_URL}/api/event-submissions/${editData._id}/update`, submitData, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        toast.success("Event updated successfully");
        if (onSuccess) onSuccess();
        return;
      }

      await axios.post(`${API_BASE_URL}/api/event-submissions`, submitData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      // toast.success("Event created successfully");
      resetForm();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error("EVENT SUBMIT ERROR:", error);
      toast.error(error?.response?.data?.message || "Failed to save event");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 sm:p-6 md:p-8">
        <div className="space-y-6 sm:space-y-8">
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Tag size={14} className="text-[#83261D]" />
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categories}
                  onChange={(e) => handleChange("categories", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all bg-white"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Calendar size={14} className="text-[#83261D]" />
                  Event Name <span className="text-red-500">*</span>
                </label>
                <input
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all"
                  placeholder="e.g., Classical Dance Festival"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Calendar size={14} className="text-[#83261D]" />
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange("date", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                  <Repeat size={14} className="text-[#83261D]" />
                  Recurrence
                </label>
                <select
                  value={formData.recurrence}
                  onChange={(e) => handleChange("recurrence", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all bg-white"
                >
                  <option value="none">None</option>
                  <option value="monthly">Every Month</option>
                  <option value="yearly">Every Year</option>
                </select>
              </div>
            </div>

            {formData.recurrence !== "none" && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Visible From
                </label>
                <input
                  type="date"
                  value={formData.visibleFrom}
                  onChange={(e) => handleChange("visibleFrom", e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <MapPin size={14} className="text-[#83261D]" />
                Location <span className="text-red-500">*</span>
              </label>
              <input
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all"
                placeholder="e.g., Kerala Kalamandalam, Thrissur"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
                <FileText size={14} className="text-[#83261D]" />
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all h-32 resize-none"
                placeholder="Write event details..."
              />
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#83261D]/30 transition-colors">
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
                      <ImageIcon size={32} className="text-gray-300" />
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
                    Event Image {!isEditMode && <span className="text-red-500">*</span>}
                  </p>
                  <p className="text-sm text-gray-500">Upload a clear event poster or image</p>
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
                  {imageError && (
                    <p className="text-red-500 text-xs mt-1">{imageError}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t border-gray-200">
            {!isEditMode && (
              <button
                onClick={resetForm}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {isEditMode ? "Updating..." : "Adding Event..."}
                </>
              ) : (
                <>
                  {isEditMode ? "Update Event" : "Add Event"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;