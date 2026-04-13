import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChartContainer } from './ChartContainer';

describe('ChartContainer', () => {
  it('should render loading state', () => {
    render(<ChartContainer />);
    expect(screen.getByText(/Loading chart data/i)).toBeDefined();
  });

  it('should render without crashing', () => {
    const { container } = render(<ChartContainer />);
    expect(container).toBeDefined();
  });
});
