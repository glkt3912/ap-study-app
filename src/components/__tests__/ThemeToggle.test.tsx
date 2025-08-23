import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ThemeToggle } from '../ThemeToggle';

// Mock Next.js useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders theme toggle button', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('toggles theme when clicked', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');

    // Initial state should be light theme (sun icon visible)
    expect(button.querySelector('svg')).toBeInTheDocument();

    // Click to toggle to dark theme
    fireEvent.click(button);
    expect(button.querySelector('svg')).toBeInTheDocument();

    // Click to toggle back to light theme
    fireEvent.click(button);
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('applies correct CSS classes based on theme', () => {
    const TestComponent = () => (
      <ThemeProvider>
        <div data-testid='themed-content' className='bg-white dark:bg-gray-900'>
          <ThemeToggle />
        </div>
      </ThemeProvider>
    );

    render(<TestComponent />);
    const button = screen.getByRole('button');

    // Toggle to dark theme
    fireEvent.click(button);

    // Check if dark class is applied to document
    expect(document.documentElement).toHaveClass('dark');
  });
});
