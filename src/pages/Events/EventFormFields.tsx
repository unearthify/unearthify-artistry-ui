/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState, ChangeEvent } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Upload, X, Image, FileText, MapPin, Calendar, Palette } from "lucide-react";

type Props = {
  formId: number;
  data: any;
  errors: any;
  onChange: (id: number, field: string, value: any) => void;
};

export default function EventFormFields({ formId, data, errors, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    axios
      .get(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : res.data.data;
        setCategories(list || []);
      })
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be less than 2MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    onChange(formId, "imageFile", file);
    onChange(formId, "previewUrl", URL.createObjectURL(file));
  };

  const removeImage = () => {
    onChange(formId, "imageFile", null);
    onChange(formId, "previewUrl", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const inputClass = (hasError: boolean) =>
    `w-full border rounded-lg px-3 py-2 sm:py-2.5 text-xs sm:text-sm focus:ring-2 focus:ring-[#83261D]/20 focus:border-[#83261D] outline-none transition-all ${
      hasError ? "border-red-500" : "border-gray-200"
    }`;

  return (
    <div className="space-y-4 sm:space-y-5">

      {/* Category & Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Palette size={14} className="text-[#83261D]" />
            Select Category <span className="text-red-500">*</span>
          </label>
          <select
            value={data.categories}
            onChange={(e) => onChange(formId, "categories", e.target.value)}
            className={inputClass(!!errors?.categories)}>
            <option value="">-- Select category --</option>
            {categories.map((c) => (
              <option key={c._id} value={c.name}>{c.name}</option>
            ))}
          </select>
          {errors?.categories && <p className="text-red-500 text-xs">{errors.categories}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
            <FileText size={14} className="text-[#83261D]" />
            Event Name <span className="text-red-500">*</span>
          </label>
          <input
            value={data.title}
            onChange={(e) => onChange(formId, "title", e.target.value)}
            placeholder="Eg: Classical Dance Festival"
            className={inputClass(!!errors?.title)}
          />
          {errors?.title && <p className="text-red-500 text-xs">{errors.title}</p>}
        </div>
      </div>

      {/* Date & Recurrence */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Calendar size={14} className="text-[#83261D]" />
            Event Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={data.date}
            onChange={(e) => onChange(formId, "date", e.target.value)}
            className={inputClass(!!errors?.date)}
          />
          {errors?.date && <p className="text-red-500 text-xs">{errors.date}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 mb-1 block">
            Recurring Event
          </label>
          <select
            value={data.recurrence}
            onChange={(e) => onChange(formId, "recurrence", e.target.value)}
            className={inputClass(false)}>
            <option value="none">None</option>
            <option value="monthly">Every Month</option>
            <option value="yearly">Every Year</option>
          </select>
        </div>
      </div>

      {/* Visible From — only if recurrence is set */}
      {data.recurrence !== "none" && (
        <div className="space-y-1">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
            <Calendar size={14} className="text-[#83261D]" />
            Visible From
          </label>
          <input
            type="date"
            value={data.visibleFrom}
            onChange={(e) => onChange(formId, "visibleFrom", e.target.value)}
            className={inputClass(false)}
          />
        </div>
      )}

      {/* Location */}
      <div className="space-y-1">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
          <MapPin size={14} className="text-[#83261D]" />
          Location <span className="text-red-500">*</span>
        </label>
        <input
          value={data.location}
          onChange={(e) => onChange(formId, "location", e.target.value)}
          placeholder="Eg: Kerala Kalamandalam, Thrissur"
          className={inputClass(!!errors?.location)}
        />
        {errors?.location && <p className="text-red-500 text-xs">{errors.location}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
          <FileText size={14} className="text-[#83261D]" />
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          value={data.description}
          onChange={(e) => onChange(formId, "description", e.target.value)}
          rows={4}
          placeholder="Write full event details..."
          className={`${inputClass(!!errors?.description)} resize-none`}
        />
        {errors?.description && <p className="text-red-500 text-xs">{errors.description}</p>}
      </div>

      {/* Image Upload */}
      <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 rounded-xl border-2 border-dashed border-gray-200 hover:border-[#83261D]/30 transition-colors">
        <div className="flex flex-col xs:flex-row items-center gap-4 sm:gap-5">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border-2 border-gray-200 overflow-hidden flex items-center justify-center shadow-md">
              {data.previewUrl ? (
                <img src={data.previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <Image size={24} className="text-gray-300" />
              )}
            </div>
            {data.previewUrl && (
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600 transition-all hover:scale-110">
                <X size={10} />
              </button>
            )}
          </div>

          {/* Upload info */}
          <div className="flex-1 text-center xs:text-left space-y-2">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2 justify-center xs:justify-start">
              <Upload size={16} className="text-[#83261D]" />
              Event Banner / Image <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-gray-500">Upload a banner or poster for the event</p>
            <div className="flex flex-wrap gap-2 justify-center xs:justify-start">
              <label className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                <Upload size={12} className="mr-2" />
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
            {errors?.image && <p className="text-red-500 text-xs">{errors.image}</p>}
          </div>
        </div>
      </div>

      {/* Required note */}
      <div className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 bg-gray-50 p-2 sm:p-3 rounded-xl">
        <span className="text-red-500 font-bold">*</span>
        <span>Required fields must be filled to submit the form</span>
      </div>

    </div>
  );
}