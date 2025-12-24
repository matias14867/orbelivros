import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  totalReviews?: number;
  size?: "sm" | "md";
  showCount?: boolean;
}

export const RatingStars = ({ 
  rating, 
  totalReviews, 
  size = "sm", 
  showCount = true 
}: RatingStarsProps) => {
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-xs" : "text-sm";
  
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star 
            key={`full-${i}`} 
            className={`${starSize} fill-yellow-400 text-yellow-400`} 
          />
        ))}
        
        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star className={`${starSize} text-muted-foreground/30`} />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
            </div>
          </div>
        )}
        
        {/* Empty stars */}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star 
            key={`empty-${i}`} 
            className={`${starSize} text-muted-foreground/30`} 
          />
        ))}
      </div>
      
      {showCount && totalReviews !== undefined && totalReviews > 0 && (
        <span className={`${textSize} text-muted-foreground`}>
          ({totalReviews})
        </span>
      )}
    </div>
  );
};
