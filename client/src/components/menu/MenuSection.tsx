import { MenuItemCard } from './MenuItemCard';
import type { CategoryWithItems } from '../../types';

interface MenuSectionProps {
  category: CategoryWithItems;
}

/** A category heading followed by a responsive grid of MenuItemCards. */
export function MenuSection({ category }: MenuSectionProps) {
  return (
    <section className="mb-10" aria-label={category.name}>
      <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
        {category.name}
        <span className="text-sm font-normal text-gray-400">
          ({category.items.length}{' '}
          {category.items.length === 1 ? 'item' : 'items'})
        </span>
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
