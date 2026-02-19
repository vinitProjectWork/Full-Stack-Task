import { useState } from 'react';
import { ImageOff } from 'lucide-react';
import type { MenuItem } from '../../types';
import { formatPrice } from '../../lib/utils';

interface MenuItemCardProps {
  item: MenuItem;
}

/**
 * Displays a single menu item with image, name, description,
 * and price or variation list.
 */
export function MenuItemCard({ item }: MenuItemCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const showImage = item.imageUrl && !imgError;
  const longDesc = item.description.length > 100;
  const displayDesc =
    expanded || !longDesc
      ? item.description
      : `${item.description.slice(0, 100)}...`;

  const primary = item.variations[0];
  const multiVariation = item.variations.length > 1;

  return (
    <article
      className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
    >
      {/* Image */}
      <div className="aspect-4/3 bg-gray-100 dark:bg-gray-800 relative overflow-hidden">
        {showImage ? (
          <img
            src={item.imageUrl!}
            alt={item.name}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="w-10 h-10 text-gray-300 dark:text-gray-600" />
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        {/* Name + single-variation price */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">
            {item.name}
          </h3>
          {primary && !multiVariation && (
            <span className="text-amber-600 dark:text-amber-500 font-semibold whitespace-nowrap text-sm">
              {formatPrice(primary.priceMoney.amount, primary.priceMoney.currency)}
            </span>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {displayDesc}
            {longDesc && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="ml-1 text-amber-600 dark:text-amber-500 font-medium hover:underline"
              >
                {expanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </p>
        )}

        {/* Multiple variations */}
        {multiVariation && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {item.variations.map((v) => (
              <span
                key={v.id}
                className="inline-flex items-center text-xs px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 font-medium"
              >
                {v.name}&nbsp;
                {formatPrice(v.priceMoney.amount, v.priceMoney.currency)}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
