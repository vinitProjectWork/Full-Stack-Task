import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from '../../components/ui/EmptyState';

describe('EmptyState', () => {
  it('renders the message', () => {
    render(<EmptyState message="No items found" />);
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders different messages correctly', () => {
    const { rerender } = render(
      <EmptyState message="Select a location to view the menu" />,
    );
    expect(screen.getByText('Select a location to view the menu')).toBeInTheDocument();

    rerender(<EmptyState message="No items match your search" />);
    expect(screen.getByText('No items match your search')).toBeInTheDocument();
  });
});
