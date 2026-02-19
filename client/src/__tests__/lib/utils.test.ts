import { describe, it, expect } from 'vitest';
import { formatPrice, cn } from '../../lib/utils';

describe('formatPrice', () => {
  it('converts cents to dollars with two decimal places', () => {
    expect(formatPrice(1250, 'USD')).toBe('$12.50');
  });

  it('handles zero', () => {
    expect(formatPrice(0, 'USD')).toBe('$0.00');
  });

  it('handles large amounts', () => {
    expect(formatPrice(999999, 'USD')).toBe('$9,999.99');
  });

  it('handles single-digit cents', () => {
    expect(formatPrice(5, 'USD')).toBe('$0.05');
  });

  it('formats non-USD currency', () => {
    const result = formatPrice(1000, 'EUR');
    // Intl formatting may vary, but should contain the amount
    expect(result).toContain('10.00');
  });
});

describe('cn', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters out falsy values', () => {
    expect(cn('a', false, null, undefined, 'b')).toBe('a b');
  });

  it('returns empty string when all values are falsy', () => {
    expect(cn(false, null, undefined)).toBe('');
  });
});
