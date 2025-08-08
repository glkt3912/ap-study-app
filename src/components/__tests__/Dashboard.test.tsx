import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '../Dashboard'
import { ThemeProvider } from '../../contexts/ThemeContext'

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
}))

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
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockApiClient = vi.mocked((await import('../../lib/api')).apiClient)

const MockedDashboard = ({ studyData = [], isLoading = false }: { studyData?: any[], isLoading?: boolean }) => (
  <ThemeProvider>
    <Dashboard studyData={studyData} isLoading={isLoading} />
  </ThemeProvider>
)

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // デフォルトモック設定
    vi.mocked(mockApiClient.getBatchDashboardMLData).mockResolvedValue({
      predictiveAnalysis: null,
      personalizedRecommendations: null
    })
  })

  it('renders dashboard title', () => {
    vi.mocked(mockApiClient.getStudyPlan).mockResolvedValue([])

    render(<MockedDashboard studyData={[]} />)
    
    expect(screen.getByText('学習進捗')).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    vi.mocked(mockApiClient.getStudyPlan).mockImplementation(() => new Promise(() => {})) // Never resolves

    render(<MockedDashboard isLoading={true} />)
    
    expect(screen.queryByText('学習進捗')).not.toBeInTheDocument()
  })

  it('displays study plan data when loaded', async () => {
    const mockData = [
      {
        id: 1,
        weekNumber: 1,
        title: 'テスト週',
        phase: 'Foundation',
        goals: ['Goal 1'],
        days: [
          { id: 1, day: 'Day 1', subject: 'Math', topics: ['Topic 1'], estimatedTime: 60, actualTime: 50, completed: true, understanding: 4 },
          { id: 2, day: 'Day 2', subject: 'Science', topics: ['Topic 2'], estimatedTime: 60, actualTime: 0, completed: false, understanding: 0 },
        ],
        progressPercentage: 50,
        totalStudyTime: 50,
        averageUnderstanding: 2,
      },
    ]

    vi.mocked(mockApiClient.getStudyPlan).mockResolvedValue(mockData)

    render(<MockedDashboard studyData={mockData} />)
    
    await waitFor(() => {
      expect(screen.getByText('テスト週')).toBeInTheDocument()
    })

    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('displays error message when API call fails', async () => {
    vi.mocked(mockApiClient.getStudyPlan).mockRejectedValue(new Error('API Error'))

    render(<MockedDashboard studyData={[]} />)
    
    expect(screen.getByText('今日の学習タスクはありません')).toBeInTheDocument()
  })

  it('displays empty state when no weeks available', async () => {
    vi.mocked(mockApiClient.getStudyPlan).mockResolvedValue([])

    render(<MockedDashboard studyData={[]} />)
    
    expect(screen.getByText('今日の学習タスクはありません')).toBeInTheDocument()
  })

  it('should use batch ML API for AI learning coach data', async () => {
    const mockMLData = {
      predictiveAnalysis: {
        examPassProbability: 85,
        recommendedStudyHours: 3,
        timeToReadiness: 14,
        riskFactors: ['時間不足'],
        successFactors: ['継続学習'],
        confidenceInterval: { lower: 80, upper: 90 },
        weakAreaPredictions: []
      },
      personalizedRecommendations: {
        dailyStudyPlan: [{
          date: '2024-01-01',
          subjects: ['Math'],
          estimatedTime: 90,
          priority: 'high' as const,
          objectives: ['基礎理解'],
          adaptiveAdjustments: {
            basedOnPerformance: true,
            basedOnTimeConstraints: false,
            basedOnMotivation: true
          }
        }],
        prioritySubjects: [],
        reviewSchedule: [],
        motivationalInsights: [],
        learningPathOptimization: {
          currentPath: 'basic',
          optimizedPath: 'advanced',
          expectedImprovement: 15
        }
      }
    }

    vi.mocked(mockApiClient.getBatchDashboardMLData).mockResolvedValue(mockMLData)

    render(<MockedDashboard studyData={[]} />)

    await waitFor(() => {
      expect(mockApiClient.getBatchDashboardMLData).toHaveBeenCalledWith(1)
      expect(screen.getByText('🤖 AI学習コーチ')).toBeInTheDocument()
      expect(screen.getByText('85%')).toBeInTheDocument()
      expect(screen.getByText('合格予測確率')).toBeInTheDocument()
    })

    // 個別APIが呼ばれないことを確認
    expect(mockApiClient.getPredictiveAnalysis).not.toHaveBeenCalled()
    expect(mockApiClient.getPersonalizedRecommendations).not.toHaveBeenCalled()
  })

  it('should fall back to individual APIs when batch ML API fails', async () => {
    // バッチAPIは失敗
    vi.mocked(mockApiClient.getBatchDashboardMLData).mockRejectedValue(new Error('Batch ML API not available'))
    
    // 個別APIは成功
    const mockPredictiveAnalysis = {
      examPassProbability: 90,
      recommendedStudyHours: 2,
      timeToReadiness: 10,
      riskFactors: ['集中力'],
      successFactors: ['計画性'],
      confidenceInterval: { lower: 85, upper: 95 },
      weakAreaPredictions: []
    }

    vi.mocked(mockApiClient.getPredictiveAnalysis).mockResolvedValue(mockPredictiveAnalysis)
    vi.mocked(mockApiClient.getPersonalizedRecommendations).mockResolvedValue(null as any)

    render(<MockedDashboard studyData={[]} />)

    await waitFor(() => {
      expect(mockApiClient.getBatchDashboardMLData).toHaveBeenCalledWith(1)
      // フォールバックAPIが呼ばれることを確認
      expect(mockApiClient.getPredictiveAnalysis).toHaveBeenCalledWith(1)
      expect(mockApiClient.getPersonalizedRecommendations).toHaveBeenCalledWith(1)
      
      expect(screen.getByText('🤖 AI学習コーチ')).toBeInTheDocument()
      expect(screen.getByText('90%')).toBeInTheDocument()
    })
  })
})