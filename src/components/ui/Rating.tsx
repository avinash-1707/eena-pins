import React from 'react';
import { Star } from 'lucide-react';

interface RatingProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  totalReviews?: number;
  size?: 'sm' | 'md' | 'lg';
}

const Rating = ({ 
  rating, 
  maxRating = 5, 
  showNumber = false,
  totalReviews,
  size = 'md' 
}: RatingProps) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div className="flex items-center gap-1">
      {/* Stars */}
      <div className="flex gap-0.5">
        {Array.from({ length: maxRating }, (_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Rating Number */}
      {showNumber && (
        <span className="text-sm text-gray-700 font-medium ml-1">
          {rating.toFixed(1)}
        </span>
      )}

      {/* Total Reviews */}
      {totalReviews && (
        <span className="text-sm text-gray-500">
          ({totalReviews})
        </span>
      )}
    </div>
  );
};

export default Rating;