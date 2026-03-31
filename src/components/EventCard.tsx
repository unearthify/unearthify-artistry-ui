import { baseCard } from "@/styles/cardBase";
import { Calendar, MapPin } from "lucide-react";
import { useState } from "react";

interface EventCardProps {
  title: string;
  date: string;
  location: string;
  image: string;
  description: string;
  onClick: () => void;
}

const EventCard = ({
  title,
  date,
  location,
  image,
  description,
  onClick,
}: EventCardProps) => {
  const [imageError, setImageError] = useState(false);

  // Fallback image if the main image fails to load
  const fallbackImage = "https://via.placeholder.com/400x225?text=Event+Image";

  return (
    <div 
      onClick={onClick} 
      className={`${baseCard} overflow-hidden group cursor-pointer bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:scale-[1.02] sm:hover:scale-105 active:scale-[0.98] sm:active:scale-100`}>
      
      {/* IMAGE - Fixed with proper aspect ratio */}
      <div className="relative w-full overflow-hidden bg-gray-100" style={{ aspectRatio: "16/9" }}>
        <img
          src={imageError ? fallbackImage : image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          onError={() => setImageError(true)}
          loading="lazy"
        />

        {/* gradient overlay */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/30 via-black/5 to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-500
          "
        />
      </div>

      {/* CONTENT - Responsive padding */}
      <div className="p-3 xs:p-4 sm:p-5">
        <h3
          className="
            font-semibold text-sm xs:text-base sm:text-lg text-foreground
            mb-1 sm:mb-2
            group-hover:text-[#83261D]
            transition-colors duration-300
            line-clamp-1
          ">
          {title}
        </h3>
        <p
          className="
            text-xs xs:text-sm text-muted-foreground
            mb-2 sm:mb-3 md:mb-4 leading-relaxed
            line-clamp-2
          ">
          {description}
        </p>
        
        {/* Divider - Responsive spacing */}
        <div className="flex flex-col gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-border/50">
          {/* Date - Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs xs:text-sm text-muted-foreground">
            <Calendar
              size={14}
              className="text-[#83261d] group-hover:scale-110 transition-transform flex-shrink-0"
            />
            <span className="truncate">{date}</span>
          </div>

          {/* Location - Responsive */}
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs xs:text-sm text-muted-foreground">
            <MapPin
              size={14}
              className="text-[#83261d] group-hover:scale-110 transition-transform flex-shrink-0"
            />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>

      {/* Subtle Hover Border */}
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-1 ring-transparent group-hover:ring-[#83261D]/20 transition-all duration-300 pointer-events-none" />
    </div>
  );
};

export default EventCard;