/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { State, City } from "country-state-city";
import Select from "react-select";
import toast from "react-hot-toast";
import { Upload, X, Image, MapPin, User, Palette, FileText } from "lucide-react";

type Props = {
  formId: number;
  data: any;
  errors: any;
  onChange: (id: number, field: string, value: any) => void;
};

export default function ArtistFormFields({ formId, data, errors, onChange }: Props) {
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/categories`)
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.data;
        setCategories(list);
      });
  }, []);

  const cityOptions = cities.map((c) => ({
    label: c.name,
    value: c.name,
  }));

  const stateOptions = states.map((s) => ({
    label: s.name,
    value: s.name,
    isoCode: s.isoCode,
  }));

  const MAX_FILE_SIZE = 2 * 1024 * 1024;

  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    onChange(formId, "imageFile", file);
    onChange(formId, "previewUrl", URL.createObjectURL(file));
  };

  const removeImage = () => {
    onChange(formId, "imageFile", null);
    onChange(formId, "previewUrl", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      "@media (min-width: 640px)": {
        minHeight: "44px",
        fontSize: "15px",
      },
      "@media (min-width: 768px)": {
        minHeight: "48px",
        fontSize: "16px",
      },
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
      "@media (min-width: 640px)": {
        fontSize: "14px",
      },
      "@media (min-width: 768px)": {
        fontSize: "15px",
      },
      "&:active": {
        backgroundColor: "#83261D",
        color: "white",
      },
    }),
  };

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8">
      {/* Header with Icon - Responsive */}
      <div className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 flex-col xs:flex-row">
        <div className="p-1.5 sm:p-2 md:p-2.5 bg-gradient-to-br from-[#83261D] to-[#B45F4A] rounded-lg sm:rounded-xl shadow-lg flex-shrink-0">
          <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">Artist Details</h3>
          <p className="text-xs sm:text-sm text-gray-500">Provide the essential information for the artist profile</p>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-5 md:space-y-6">
        {/* Name and Art Form Row - Responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          {/* Artist Name Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
              <User size={14} className="text-[#83261D]" />
              Artist Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                value={data.name}
                onChange={(e) => onChange(formId, "name", e.target.value)}
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 md:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all bg-white text-sm sm:text-base"
                placeholder="e.g. Ravi Shankar"
              />
              {errors?.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>
          </div>

          {/* Art Form Field */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
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
              value={categories
                .map(cat => ({ label: cat.name, value: cat._id }))
                .filter(c =>
                  data.selectedData?.some((s: any) => s.categoryId === c.value)
                )}
              onChange={(selectedCategories: any) => {
                const newData = selectedCategories.map((cat: any) => {
                  const existing = data.selectedData?.find(
                    (s: any) => s.categoryId === cat.value
                  );

                  return (
                    existing || {
                      categoryId: cat.value,
                      artTypes: [],
                      artTypeOptions: cat.artTypes.map((t: any) => ({
                        label: t.name,
                        value: t._id,
                      })),
                    }
                  );
                });

                onChange(formId, "selectedData", newData);
              }}
            />
            {errors?.category && (
              <p className="text-red-500 text-xs">{errors.category}</p>
            )}
          </div>

          {/* Art Type Field - Only show if category is selected */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
              <Palette size={14} className="text-[#83261D]" />
              Art Types <span className="text-red-500">*</span>
            </label>
            {data.selectedData?.length > 0 && (
              <div>
                {data.selectedData.map((item: any, index: number) => {
                  const catLabel = categories.find(
                    (c) => c._id === item.categoryId
                  )?.name;

                  return (
                    <div key={item.categoryId} className="mb-3">
                      <p className="text-xs font-semibold">{catLabel}</p>

                      <Select
                        isMulti
                        options={item.artTypeOptions}
                        value={item.artTypeOptions.filter((opt: any) =>
                          item.artTypes.includes(opt.value)
                        )}
                        onChange={(selected: any) => {
                          const updated = [...data.selectedData];

                          updated[index] = {
                            ...updated[index],
                            artTypes: selected
                              ? selected.map((s: any) => s.value)
                              : [],
                          };

                          onChange(formId, "selectedData", updated);
                        }}
                      />
                      {errors?.artTypes && (
                        <p className="text-red-500 text-xs">{errors.artTypes}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Contact Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">

          {/* Phone */}
          <div>
            <label className="text-sm font-semibold">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              value={data.phone}
              onChange={(e) => {
                const value = e.target.value;
                if (/^\d*$/.test(value)) {
                  onChange(formId, "phone", value);
                }
              }}
              placeholder="Enter phone number"
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors?.phone && (
              <p className="text-red-500 text-xs">{errors.phone}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-sm font-semibold">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => onChange(formId, "email", e.target.value)}
              placeholder="Enter email"
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors?.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
          </div>

          {/* Website (Optional) */}
          <div className="sm:col-span-2">
            <label className="text-sm font-semibold">
              Artist Website <span className="text-red-500">*</span>
            </label>
            <input
              value={data.website}
              onChange={(e) => onChange(formId, "website", e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3 py-2 border rounded-lg"
            />
            {errors?.website && (
              <p className="text-red-500 text-xs">{errors.website}</p>
            )}
          </div>

        </div>

        {/* Location Section - Responsive */}
        <div className="bg-gradient-to-r from-amber-50/50 to-white p-3 sm:p-4 md:p-5 lg:p-6 rounded-xl sm:rounded-2xl border border-amber-100">
          <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            <MapPin size={16} className="text-[#83261D]" />
            <h4 className="text-sm sm:text-base font-semibold text-gray-900">Location Details</h4>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {/* Country - Read-only */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs font-medium text-gray-600">Country</label>
              <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-lg sm:rounded-xl text-gray-700 flex items-center gap-1.5 sm:gap-2 shadow-sm text-sm">
                <span className="text-base sm:text-lg">🇮🇳</span>
                <span className="font-medium truncate">{data.country}</span>
              </div>
            </div>

            {/* State Select */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                State <span className="text-red-500">*</span>
              </label>
              <Select
                options={stateOptions}
                value={data.state ? stateOptions.find((s) => s.value === data.state) : null}
                placeholder="Select State"
                onChange={(option) => {
                  if (!option) return;
                  onChange(formId, "state", option.value);
                  onChange(formId, "city", "");
                  const cityList = City.getCitiesOfState("IN", option.isoCode);
                  setCities(cityList);
                }}
                styles={customSelectStyles}
                className="text-xs sm:text-sm"
              />
              {errors?.state && (
                <p className="text-red-500 text-xs">{errors.state}</p>
              )}
            </div>

            {/* City Select */}
            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs font-medium text-gray-600 flex items-center gap-1">
                City <span className="text-red-500">*</span>
              </label>
              <Select
                options={cityOptions}
                value={data.city ? { label: data.city, value: data.city } : null}
                onChange={(option) => onChange(formId, "city", option?.value || "")}
                placeholder="Select City"
                isDisabled={!data.state}
                styles={customSelectStyles}
                className="text-xs sm:text-sm"
              />
              {errors?.city && (
                <p className="text-red-500 text-xs">{errors.city}</p>
              )}
            </div>
          </div>
        </div>

        {/* Biography Section - Responsive */}
        <div className="space-y-1.5 sm:space-y-2">
          <label className="text-xs sm:text-sm font-semibold text-gray-700 flex items-center gap-1">
            <FileText size={14} className="text-[#83261D]" />
            Artist Biography <span className="text-red-500">*</span>
          </label>
          <textarea
            value={data.bio}
            onChange={(e) => onChange(formId, "bio", e.target.value)}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl border border-gray-200 focus:border-[#83261D] focus:ring-2 focus:ring-[#83261D]/20 outline-none transition-all h-24 sm:h-28 md:h-32 lg:h-36 resize-none bg-white text-sm sm:text-base"
            placeholder="Share the artist's journey, achievements, artistic style, and contributions to Indian art..."
          />
          {errors?.bio && (
            <p className="text-red-500 text-xs">{errors.bio}</p>
          )}
          <p className="text-[10px] sm:text-xs text-gray-400 text-right">
            {data.bio?.length || 0} characters
          </p>
        </div>

        {/* Image Upload Section - Responsive */}
        <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl border-2 border-dashed border-gray-200 hover:border-[#83261D]/30 transition-colors">
          <div className="flex flex-col xs:flex-row items-center gap-4 sm:gap-5 md:gap-6">
            {/* Preview */}
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-gradient-to-br from-gray-100 to-gray-50 rounded-lg sm:rounded-xl md:rounded-2xl border-2 border-gray-200 overflow-hidden flex items-center justify-center shadow-md">
                {data.previewUrl ? (
                  <img
                    src={data.previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image size={24} className="text-gray-300" />
                )}
              </div>
              {data.previewUrl && (
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 bg-red-500 text-white rounded-full p-1 sm:p-1.5 shadow-lg hover:bg-red-600 transition-all hover:scale-110"
                >
                  <X size={10} />
                </button>
              )}
            </div>

            {/* Upload Info */}
            <div className="flex-1 text-center xs:text-left space-y-1.5 sm:space-y-2">
              <p className="text-sm sm:text-base font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2 justify-center xs:justify-start">
                <Upload size={16} className="text-[#83261D]" />
                Artist Profile Picture <span className="text-red-500">*</span>
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                Upload a clear portrait or photo of the artist
              </p>
              <div className="flex flex-wrap gap-2 sm:gap-3 justify-center xs:justify-start">
                <label className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-[#83261D] to-[#B45F4A] text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium hover:shadow-lg transition-all cursor-pointer hover:scale-105">
                  <Upload size={12} className="mr-1 sm:mr-2" />
                  Choose Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  {errors?.image && (
                    <p className="text-red-500 text-xs">{errors.image}</p>
                  )}
                </label>
                <p className="text-[10px] sm:text-xs text-gray-400 self-center">
                  JPG, PNG • Max 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Required Fields Note - Responsive */}
        <div className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1.5 sm:gap-2 bg-gray-50 p-2 sm:p-3 rounded-lg sm:rounded-xl">
          <span className="text-red-500 font-bold">*</span>
          <span>Required fields must be filled to submit the form</span>
        </div>
      </div>
    </div>
  );
}