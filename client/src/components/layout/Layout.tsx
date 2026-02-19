import type { ReactNode } from 'react';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
  locationSelector: ReactNode;
}

/** Page shell: sticky header + centered content area. */
export function Layout({ children, locationSelector }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      <Header locationSelector={locationSelector} />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {children}
      </main>
    </div>
  );
}
