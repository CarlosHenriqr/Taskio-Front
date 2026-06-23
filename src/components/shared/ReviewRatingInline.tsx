import { Star } from 'lucide-react';

type ReviewRatingInlineProps = {
  averageRating: number;
  totalReviews: number;
  size?: 'sm' | 'md';
  className?: string;
};

export function ReviewRatingInline({
  averageRating,
  totalReviews,
  size = 'sm',
  className = '',
}: ReviewRatingInlineProps) {
  if (totalReviews <= 0) return null;

  const starClass = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';
  const textClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <span className="inline-flex text-warning">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${starClass} ${i < Math.round(averageRating) ? 'fill-current' : 'opacity-30'}`}
          />
        ))}
      </span>
      <span className={`${textClass} text-muted-foreground`}>
        ({totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'})
      </span>
    </span>
  );
}
