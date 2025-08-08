import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

// Simple component for testing
const SimpleComponent = ({ title }: { title: string }) => (
  <div>
    <h1>{title}</h1>
    <p>This is a test component</p>
  </div>
);

describe('Simple Component Test', () => {
  it('renders component with title', () => {
    render(<SimpleComponent title='Test Title' />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('This is a test component')).toBeInTheDocument();
  });

  it('renders with different title', () => {
    render(<SimpleComponent title='Another Title' />);

    expect(screen.getByText('Another Title')).toBeInTheDocument();
  });
});
