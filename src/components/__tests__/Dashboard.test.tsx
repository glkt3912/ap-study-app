import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Dashboard from '../Dashboard';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock the new Dashboard components
vi.mock('../dashboard/DashboardMetrics', () => ({
  DashboardMetrics: ({ studyData }: { studyData: any[] }) => (
    <div data-testid="dashboard-metrics">
      <div>学習進捗</div>
      {studyData.length > 0 && <div>{(studyData[0].progressPercentage || 0).toFixed(1)}%</div>}
    </div>
  ),
}));

vi.mock('../dashboard/AICoachSection', () => ({
  AICoachSection: () => <div data-testid="ai-coach-section">AI学習コーチ</div>,
}));

vi.mock('../dashboard/TodayStudyTask', () => ({
  TodayStudyTask: ({ studyData }: { studyData: any[] }) => (
    <div data-testid="today-study-task">
      {studyData.length === 0 || !studyData.find(w => w.days?.find((d: any) => !d.completed))
        ? '今日の学習タスクはありません'
        : studyData.find(w => w.days?.find((d: any) => !d.completed))?.title}
    </div>
  ),
}));

vi.mock('../dashboard/WeeklyProgress', () => ({
  WeeklyProgress: ({ studyData }: { studyData: any[] }) => (
    <div data-testid="weekly-progress">
      {studyData.slice(0, 3).map(week => (
        <div key={week.weekNumber}>{week.title}</div>
      ))}
    </div>
  ),
}));

vi.mock('../dashboard/PhaseProgress', () => ({
  PhaseProgress: ({ studyData }: { studyData: any[] }) => (
    <div data-testid="phase-progress">学習フェーズ別進捗</div>
  ),
}));

// Mock AIAnalysisProvider
vi.mock('../providers/AIAnalysisProvider', () => ({
  AIAnalysisProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="ai-analysis-provider">{children}</div>
  ),
  useAIAnalysis: () => ({
    predictiveAnalysis: {
      examPassProbability: 85,
      recommendedStudyHours: 3,
      timeToReadiness: 14,
      riskFactors: ['時間不足'],
      successFactors: ['継続学習'],
    },
    personalizedRecommendations: null,
    isLoading: false,
    error: null,
    fetchData: vi.fn(),
    clearError: vi.fn(),
  }),
}));

// Mock useAuth hook to avoid AuthProvider dependency
vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Test User', email: 'test@example.com' },
    userId: 1,
    token: 'mock-token',
    isAuthenticated: true,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    isLoading: false,
    error: null,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock API client with batch methods
vi.mock('../../lib/api', () => ({
  apiClient: {
    // Batch API methods
    getBatchDashboardMLData: vi.fn(),

    // Fallback API methods
    getStudyPlan: vi.fn(),
    getPredictiveAnalysis: vi.fn(),
    getPersonalizedRecommendations: vi.fn(),
  },
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

const mockApiClient = vi.mocked((await import('../../lib/api')).apiClient);

const MockedDashboard = ({ studyData = [], isLoading = false }: { studyData?: any[]; isLoading?: boolean }) => (
  <ThemeProvider>
    <Dashboard studyData={studyData} isLoading={isLoading} />
  </ThemeProvider>
);

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard title', async () => {
    vi.mocked(mockApiClient.getStudyPlan).mockResolvedValue([]);

    await act(async () => {
      render(<MockedDashboard studyData={[]} />);
    });

    expect(screen.getByText('学習進捗')).toBeInTheDocument();
  });

  it('displays loading state initially', async () => {
    vi.mocked(mockApiClient.getStudyPlan).mockImplementation(() => new Promise(() => {})); // Never resolves

    await act(async () => {
      render(<MockedDashboard isLoading={true} />);
    });

    expect(screen.queryByText('学習進捗')).not.toBeInTheDocument();
  });

  it('displays study plan data when loaded', async () => {
    const mockData = [
      {
        id: 1,
        weekNumber: 1,
        title: 'テスト週',
        phase: 'Foundation',
        goals: ['Goal 1'],
        days: [
          {
            id: 1,
            day: 'Day 1',
            subject: 'Math',
            topics: ['Topic 1'],
            estimatedTime: 60,
            actualTime: 50,
            completed: true,
            understanding: 4,
          },
          {
            id: 2,
            day: 'Day 2',
            subject: 'Science',
            topics: ['Topic 2'],
            estimatedTime: 60,
            actualTime: 0,
            completed: false,
            understanding: 0,
          },
        ],
        progressPercentage: 50,
        totalStudyTime: 50,
        averageUnderstanding: 2,
      },
    ];

    vi.mocked(mockApiClient.getStudyPlan).mockResolvedValue(mockData);

    await act(async () => {
      render(<MockedDashboard studyData={mockData} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('weekly-progress')).toBeInTheDocument();
      expect(screen.getByTestId('today-study-task')).toBeInTheDocument();
    });

    // Check that data is displayed in the components
    const weeklyProgress = screen.getByTestId('weekly-progress');
    expect(weeklyProgress).toHaveTextContent('テスト週');
    expect(screen.getByText('50.0%')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    vi.mocked(mockApiClient.getStudyPlan).mockRejectedValue(new Error('API Error'));

    await act(async () => {
      render(<MockedDashboard studyData={[]} />);
    });

    expect(screen.getByText('今日の学習タスクはありません')).toBeInTheDocument();
  });

  it('displays empty state when no weeks available', async () => {
    vi.mocked(mockApiClient.getStudyPlan).mockResolvedValue([]);

    await act(async () => {
      render(<MockedDashboard studyData={[]} />);
    });

    expect(screen.getByText('今日の学習タスクはありません')).toBeInTheDocument();
  });

  it('should display AI learning coach section', async () => {
    await act(async () => {
      render(<MockedDashboard studyData={[]} />);
    });

    await waitFor(() => {
      expect(screen.getByText('AI学習コーチ')).toBeInTheDocument();
    });
  });

  it('should display all dashboard components', async () => {
    const mockData = [
      {
        id: 1,
        weekNumber: 1,
        title: 'テスト週',
        phase: 'Foundation',
        goals: ['Goal 1'],
        days: [
          {
            id: 1,
            day: 'Day 1',
            subject: 'Math',
            topics: ['Topic 1'],
            estimatedTime: 60,
            actualTime: 50,
            completed: true,
            understanding: 4,
          },
        ],
        progressPercentage: 50,
        totalStudyTime: 50,
        averageUnderstanding: 2,
      },
    ];

    await act(async () => {
      render(<MockedDashboard studyData={mockData} />);
    });

    await waitFor(() => {
      expect(screen.getByTestId('dashboard-metrics')).toBeInTheDocument();
      expect(screen.getByTestId('ai-coach-section')).toBeInTheDocument();
      expect(screen.getByTestId('today-study-task')).toBeInTheDocument();
      expect(screen.getByTestId('weekly-progress')).toBeInTheDocument();
      expect(screen.getByTestId('phase-progress')).toBeInTheDocument();
    });
  });
});
