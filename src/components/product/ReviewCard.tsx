import React from 'react';
import Image from 'next/image';
import Rating from '@/components/ui/Rating';

interface ReviewCardProps {
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  review: string;
}

const ReviewCard = ({ userName, userAvatar, rating, date, review }: ReviewCardProps) => {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        {/* User Avatar */}
        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt={userName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-gray-900 text-sm">{userName}</h4>
            <Rating rating={rating} size="sm" />
          </div>
          <p className="text-xs text-gray-500">{formattedDate}</p>
        </div>
      </div>

      {/* Review Text */}
      <p className="text-sm text-gray-700 leading-relaxed">{review}</p>
    </div>
  );
};

export default ReviewCard;