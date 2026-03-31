import { baseCard } from "@/styles/cardBase";
import { slugify } from "@/utils/slug";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface ArtFormCardProps {
  title: string;
  category: string;
  description: string;
  image: string;
  artTypeName: string;
}

const ArtFormCard = ({
  title,
  category,
  description,
  image,
  artTypeName,
}: ArtFormCardProps) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  // Fallback image if the main image fails to load
  const fallbackImage = "https://via.placeholder.com/400x300?text=Art+Form";

  const handleClick = () => {
    const categorySlug = slugify(category);
    const artTypeSlug = slugify(artTypeName);
    navigate(`/artform/${categorySlug}/${artTypeSlug}`);
  };

  return (
    <div
      onClick={handleClick}
      className={`${baseCard} group cursor-pointer bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98] sm:active:scale-100`}>
      
      {/* IMAGE with overlay - Fixed with proper aspect ratio */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
        <img
          src={imageError ? fallbackImage : image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={() => setImageError(true)}
          loading="lazy"
        />
        
        {/* Simple overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* CONTENT - Responsive padding */}
      <div className="p-3 xs:p-4 sm:p-5">
        {/* Category Chip - Responsive sizing */}
        <div className="mb-2 sm:mb-3">
          <span className="text-[10px] xs:text-xs font-medium text-[#83261D] bg-[#83261D]/5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full inline-block">
            {category}
          </span>
        </div>

        {/* Title - Responsive text */}
        <h3 className="text-sm xs:text-base sm:text-lg md:text-xl font-bold text-gray-900 mb-1 sm:mb-2 group-hover:text-[#83261D] transition-colors duration-300 line-clamp-1">
          {title}
        </h3>

        {/* Description - Responsive text and lines */}
        <p className="text-xs xs:text-sm text-gray-500 mb-2 sm:mb-3 md:mb-4 line-clamp-2 sm:line-clamp-2">
          {description}
        </p>

        {/* Explore Link - Responsive sizing */}
        <div className="flex items-center text-[#83261D] text-xs xs:text-sm font-medium">
          <span>Explore</span>
          <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform flex-shrink-0" />
        </div>
      </div>

      {/* Subtle Hover Border */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-transparent group-hover:ring-[#83261D]/20 transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default ArtFormCard;