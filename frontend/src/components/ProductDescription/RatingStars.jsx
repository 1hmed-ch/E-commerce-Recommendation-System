import { Star } from 'lucide-react';

function RatingStars({ rating }) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 != 0;

    return (
        <div className="flex items-center gap-1">
            {[...Array(fullStars)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
            ))}
            {halfStar && <Star className="w-4 h-4 fill-orange-400/50 text-orange-400" />}
        </div>
    );
}

export default RatingStars;