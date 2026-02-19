import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from '../../components/menu/SearchBar';

const defaultCategoryProps = {
  categoryOptions: [{ value: 'all', label: 'All Categories' }],
  selectedCategory: 'all',
  onCategoryChange: () => {},
};

describe('SearchBar', () => {
  it('renders the search input with placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} {...defaultCategoryProps} />);
    expect(screen.getByPlaceholderText('Search menu items...')).toBeInTheDocument();
  });

  it('calls onChange on each keystroke', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="" onChange={onChange} {...defaultCategoryProps} />);
    await user.type(screen.getByRole('textbox'), 'abc');

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, 'a');
  });

  it('shows the clear button only when value is non-empty', () => {
    const { rerender } = render(<SearchBar value="" onChange={() => {}} {...defaultCategoryProps} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();

    rerender(<SearchBar value="pizza" onChange={() => {}} {...defaultCategoryProps} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('calls onChange with empty string when clear button is clicked', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();

    render(<SearchBar value="hello" onChange={onChange} {...defaultCategoryProps} />);
    await user.click(screen.getByLabelText('Clear search'));

    expect(onChange).toHaveBeenCalledWith('');
  });
});
