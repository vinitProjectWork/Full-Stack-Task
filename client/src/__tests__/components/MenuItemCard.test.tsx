import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MenuItemCard } from '../../components/menu/MenuItemCard';
import type { MenuItem } from '../../types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseItem: MenuItem = {
  id: 'ITEM_1',
  name: 'Classic Burger',
  description: 'A juicy beef patty with lettuce, tomato, and our special sauce.',
  category: 'Mains',
  imageUrl: 'https://example.com/burger.jpg',
  variations: [
    {
      id: 'VAR_1',
      name: 'Regular',
      priceMoney: { amount: 1250, currency: 'USD' },
    },
  ],
};

const multiVariationItem: MenuItem = {
  ...baseItem,
  id: 'ITEM_2',
  variations: [
    { id: 'V1', name: 'Small', priceMoney: { amount: 800, currency: 'USD' } },
    { id: 'V2', name: 'Medium', priceMoney: { amount: 1000, currency: 'USD' } },
    { id: 'V3', name: 'Large', priceMoney: { amount: 1200, currency: 'USD' } },
  ],
};

const longDescItem: MenuItem = {
  ...baseItem,
  id: 'ITEM_3',
  description:
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MenuItemCard', () => {
  it('renders item name and description', () => {
    render(<MenuItemCard item={baseItem} />);

    expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    expect(screen.getByText(/A juicy beef patty/)).toBeInTheDocument();
  });

  it('formats and displays the price for a single variation', () => {
    render(<MenuItemCard item={baseItem} />);

    expect(screen.getByText('$12.50')).toBeInTheDocument();
  });

  it('renders all variation badges when multiple variations exist', () => {
    render(<MenuItemCard item={multiVariationItem} />);

    expect(screen.getByText(/Small/)).toBeInTheDocument();
    expect(screen.getByText(/Medium/)).toBeInTheDocument();
    expect(screen.getByText(/Large/)).toBeInTheDocument();
  });

  it('truncates long descriptions and reveals them on click', async () => {
    const user = userEvent.setup();
    render(<MenuItemCard item={longDescItem} />);

    // "Read more" should be visible
    const readMore = screen.getByText('Read more');
    expect(readMore).toBeInTheDocument();

    await user.click(readMore);

    // After expanding, full text is shown
    expect(screen.getByText('Show less')).toBeInTheDocument();
  });

  it('shows placeholder icon when there is no image', () => {
    const noImg: MenuItem = { ...baseItem, imageUrl: null };
    render(<MenuItemCard item={noImg} />);

    // The <img> element should NOT exist
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
