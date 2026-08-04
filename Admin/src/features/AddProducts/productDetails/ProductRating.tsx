import { Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface RatingCount {
  stars: 1 | 2 | 3 | 4 | 5;
  count: number;
}

export interface ProductRatingProps {
  averageRating?: number;
  totalReviews?: number;
  counts?: RatingCount[];
}

export default function ProductRating({
  averageRating = 0,
  totalReviews = 0,
  counts = [],
}: ProductRatingProps) {
  const { t } = useTranslation();
  const safeAvg = typeof averageRating === 'number' && !isNaN(averageRating) ? averageRating : 0;
  const safeTotal = typeof totalReviews === 'number' && !isNaN(totalReviews) ? totalReviews : 0;
  const safeCounts = Array.isArray(counts) ? counts : [];
  const maxCount = Math.max(...safeCounts.map((c) => c?.count || 0), 1);
  const sorted = [...safeCounts].sort((a, b) => (b?.stars || 0) - (a?.stars || 0));

  return (
    <div className="w-full rounded-2xl border border-gray-200 bg-white p-4 lg:p-8">
      <div className="flex items-center flex-col lg:flex-row gap-10">
        {/* Summary */}
        <div className="flex shrink-0 flex-col items-center w-full lg:w-[25%]">
          <h2 className="text-[64px] font-bold text-gray-900 pb-2">
            {safeAvg.toFixed(1)}
          </h2>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={16}
                className={
                  i < Math.round(safeAvg)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
          </div>
          <span className="mt-1 whitespace-nowrap text-xs text-gray-400">
            {t("productDetails.rating.basedOn", { count: safeTotal, defaultValue: `Based on ${safeTotal} Reviews` })}
          </span>
        </div>

        {/* Bars */}
        <div className="flex-1 space-y-2.5 max-sm:w-full">
          {sorted.map(({ stars, count }) => (
            <div key={stars} className="flex items-center gap-3 text-sm">
              <span className="w-14 shrink-0 text-gray-500">
                {stars} {stars > 1 ? t("productDetails.rating.stars", { defaultValue: "stars" }) : t("productDetails.rating.star", { defaultValue: "star" })}
              </span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{ width: `${(count / maxCount) * 100}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-gray-500">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}