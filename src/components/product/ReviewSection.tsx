import React from 'react';
import ReviewCard from './ReviewCard';

interface Review {
  id: string;
  rating: number;
  review?: string | null;
  createdAt: string;
  user?: {
    name?: string | null;
    username: string;
    avatarUrl?: string | null;
  };
}

interface ReviewsSectionProps {
  reviews: Review[];
}

const ReviewsSection = ({ reviews }: ReviewsSectionProps) => {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className="px-4 pb-6">
      <div className="bg-white rounded-2xl shadow-md p-4">
        {/* Header */}
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          Customer Reviews ⭐
        </h2>

        {/* Reviews List */}
        <div className="space-y-3">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              userName={review.user?.name || review.user?.username || 'Anonymous'}
              userAvatar={review.user?.avatarUrl || undefined}
              rating={review.rating}
              date={review.createdAt}
              review={review.review || ''}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReviewsSection;