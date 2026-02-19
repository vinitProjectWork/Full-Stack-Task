import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSelector } from '../../components/menu/LocationSelector';
import type { Location } from '../../types';

const locations: Location[] = [
  { id: 'LOC_1', name: 'Downtown', address: '123 Main St', timezone: 'America/New_York', status: 'ACTIVE' },
  { id: 'LOC_2', name: 'Uptown', address: '456 Oak Ave', timezone: 'America/New_York', status: 'ACTIVE' },
];

describe('LocationSelector', () => {
  it('renders a loading skeleton when isLoading is true', () => {
    const { container } = render(
      <LocationSelector locations={[]} selectedId={null} onSelect={() => {}} isLoading />,
    );
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument();
  });

  it('renders a select with location options', async () => {
    const user = userEvent.setup();
    render(
      <LocationSelector locations={locations} selectedId={null} onSelect={() => {}} isLoading={false} />,
    );
    const trigger = screen.getByLabelText('Select a location');
    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(screen.getByText('Downtown')).toBeInTheDocument();
    expect(screen.getByText('Uptown')).toBeInTheDocument();
  });

  it('calls onSelect when a location is chosen', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <LocationSelector locations={locations} selectedId={null} onSelect={onSelect} isLoading={false} />,
    );

    await user.click(screen.getByLabelText('Select a location'));
    await user.click(screen.getByText('Uptown'));

    expect(onSelect).toHaveBeenCalledWith('LOC_2');
  });

  it('shows the currently selected location', () => {
    render(
      <LocationSelector locations={locations} selectedId="LOC_1" onSelect={() => {}} isLoading={false} />,
    );
    expect(screen.getByLabelText('Select a location')).toHaveTextContent('Downtown');
  });
});
