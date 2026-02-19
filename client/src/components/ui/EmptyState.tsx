import { UtensilsCrossed } from 'lucide-react';

interface EmptyStateProps {
  message: string;
}

/** Friendly empty state with a subtle icon. */
export function EmptyState({ message }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <UtensilsCrossed className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}
