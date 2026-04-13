import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderPanel } from './OrderPanel';

describe('OrderPanel', () => {
  it('should render without crashing', () => {
    render(<OrderPanel />);
    expect(screen.getByText(/Account/i)).toBeDefined();
  });

  it('should display balance', () => {
    render(<OrderPanel />);
    expect(screen.getByText(/Balance:/i)).toBeDefined();
  });

  it('should display equity', () => {
    render(<OrderPanel />);
    expect(screen.getByText(/Equity:/i)).toBeDefined();
  });
});
