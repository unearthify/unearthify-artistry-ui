import { baseCard } from "@/styles/cardBase";
import { ArrowRight, MapPin } from "lucide-react";
import { useState } from "react";

interface ArtistCardProps {
  name: string;
  artTypeName: string;
  region: string;
  image: string;
  onClick: () => void;
}

const ArtistCard = ({
  name,
  artTypeName,
  region,
  image,
  onClick,
}: ArtistCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Fallback image if the main image fails to load
  const fallbackImage = "https://via.placeholder.com/400x300?text=Artist+Image";

  return (
    <div
      onClick={onClick}
      className={`${baseCard} relative overflow-hidden group cursor-pointer bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98] sm:active:scale-100`}>
      {/* IMAGE CONTAINER - Fixed with aspect ratio */}
      <div
        className="relative w-full overflow-hidden bg-gray-100"
        style={{ aspectRatio: "4/3" }}>
        <img
          src={imageError ? fallbackImage : image}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {/* Gradient overlay for better text contrast if needed */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* CONTENT - Responsive padding */}
      <div className="p-3 xs:p-4 sm:p-5">
        <div className="flex items-start justify-between mb-2 sm:mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 mb-0.5 sm:mb-1 group-hover:text-[#83261D] transition-colors duration-300 line-clamp-1">
              {name}
            </h3>
            <p className="text-xs xs:text-sm text-[#83261D] font-medium line-clamp-1">
              {artTypeName}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 sm:gap-1.5 text-gray-500 text-xs xs:text-sm mb-2 sm:mb-3 md:mb-4">
          <MapPin size={12} className="text-[#83261D]/60 flex-shrink-0" />
          <span className="truncate">{region}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 pt-2 sm:pt-3">
          <button className="text-[#83261D] text-xs xs:text-sm font-medium flex items-center gap-1 w-full justify-center sm:justify-start overflow-hidden">
            <span className="transition-transform duration-300">
              View Profile
            </span>

            <ArrowRight
              size={14}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </button>
        </div>
      </div>

      {/* Subtle Hover Border */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-transparent group-hover:ring-[#83261D]/20 transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default ArtistCard;