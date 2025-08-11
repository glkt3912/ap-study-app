import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ExamConfigModal } from '../ExamConfigModal';

// Mock API - 簡単なmock
vi.mock('@/lib/api', () => ({
  apiClient: {
    getExamConfig: vi.fn().mockRejectedValue(new Error('Not found')),
    setExamConfig: vi.fn(),
    updateExamConfig: vi.fn(),
    deleteExamConfig: vi.fn(),
  },
}));

describe('ExamConfigModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    userId: '1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render modal when open', () => {
    render(<ExamConfigModal {...mockProps} />);
    
    expect(screen.getByText('試験設定')).toBeInTheDocument();
    expect(screen.getByLabelText('試験日')).toBeInTheDocument();
    expect(screen.getByLabelText('目標点数')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(<ExamConfigModal {...mockProps} isOpen={false} />);
    
    expect(screen.queryByText('試験設定')).not.toBeInTheDocument();
  });

  it('should show required form fields', () => {
    render(<ExamConfigModal {...mockProps} />);
    
    const examDateInput = screen.getByLabelText('試験日');
    const targetScoreInput = screen.getByLabelText('目標点数');
    
    expect(examDateInput).toBeRequired();
    expect(targetScoreInput).toBeInTheDocument();
    expect(targetScoreInput).toHaveAttribute('type', 'number');
    expect(targetScoreInput).toHaveAttribute('min', '0');
    expect(targetScoreInput).toHaveAttribute('max', '100');
  });
});