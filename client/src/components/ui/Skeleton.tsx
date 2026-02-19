/** Pulsing placeholder rectangle used during loading. */
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`}
      aria-hidden="true"
    />
  );
}

/** Skeleton that looks like a menu item card. */
export function MenuCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
      <Skeleton className="aspect-[4/3] rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

/** Full-page loading skeleton with category header + card grid. */
export function MenuSkeleton() {
  return (
    <div className="space-y-8 mt-6" aria-label="Loading menu" role="status">
      {[1, 2].map((section) => (
        <div key={section}>
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
