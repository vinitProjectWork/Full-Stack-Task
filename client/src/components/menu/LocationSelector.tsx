import { MapPin } from 'lucide-react';
import { Select } from '../ui/Select';
import type { Location } from '../../types';

interface LocationSelectorProps {
  locations: Location[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  isLoading: boolean;
}

export function LocationSelector({
  locations,
  selectedId,
  onSelect,
  isLoading,
}: LocationSelectorProps) {
  if (isLoading) {
    return (
      <div className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  const options = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
    sublabel: loc.address,
  }));

  return (
    <Select
      options={options}
      value={selectedId ?? ''}
      onChange={onSelect}
      placeholder="Select a location"
      icon={<MapPin className="w-4 h-4" />}
      aria-label="Select a location"
    />
  );
}
