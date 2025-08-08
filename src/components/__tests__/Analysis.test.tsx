import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Analysis from '../Analysis'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Mock useAuth hook
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
    getBatchAnalysisData: vi.fn(),
    
    // Fallback API methods
    getStudyLogs: vi.fn(),
    getMorningTests: vi.fn(),
    getAfternoonTests: vi.fn(),
    getStudyLogStats: vi.fn(),
    getPredictiveAnalysis: vi.fn(),
    getPersonalizedRecommendations: vi.fn(),
    getAdvancedWeakPoints: vi.fn(),
    
    // Other analysis methods
    getLatestAnalysis: vi.fn(),
    runAnalysis: vi.fn(),
    generateMLAnalysis: vi.fn(),
  },
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}))

const mockApiClient = vi.mocked(await import('../../lib/api')).apiClient

const MockedAnalysis = () => (
  <ThemeProvider>
    <Analysis />
  </ThemeProvider>
)

describe('Analysis Component - Batch API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Batch API Data Loading', () => {
    it('should use batch API for initial data loading', async () => {
      const mockBatchData = {
        studyLogs: [
          { id: 1, subject: 'Math', studyTime: 120, understanding: 4, date: '2024-01-01', topics: ['Algebra'] }
        ],
        morningTests: [
          { id: 1, category: 'AM', totalQuestions: 80, correctAnswers: 64, timeSpent: 150, date: '2024-01-01' }
        ],
        afternoonTests: [
          { id: 1, category: 'PM', score: 75, timeSpent: 150, date: '2024-01-01' }
        ],
        studyLogStats: {
          totalTime: 120,
          averageUnderstanding: 4.2,
          totalSessions: 10,
          subjectStats: [{
            subject: 'Math',
            totalTime: 120,
            sessionCount: 1,
            averageUnderstanding: 4.2,
            latestActivity: '2024-01-01'
          }]
        },
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
        },
        advancedWeakPoints: {
          criticalWeakPoints: [],
          improvementPotential: [],
          learningPath: [],
          aiRecommendations: []
        }
      }

      vi.mocked(mockApiClient.getBatchAnalysisData).mockResolvedValue(mockBatchData)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue({
        analysisDate: '2024-01-01',
        overallScore: 85,
        recommendations: []
      })

      render(<MockedAnalysis />)

      await waitFor(() => {
        expect(mockApiClient.getBatchAnalysisData).toHaveBeenCalledWith(1)
        expect(mockApiClient.getBatchAnalysisData).toHaveBeenCalledTimes(1)
      })

      // バッチAPIが呼ばれ、個別APIは呼ばれないことを確認
      expect(mockApiClient.getStudyLogs).not.toHaveBeenCalled()
      expect(mockApiClient.getMorningTests).not.toHaveBeenCalled()
      expect(mockApiClient.getAfternoonTests).not.toHaveBeenCalled()
      expect(mockApiClient.getPredictiveAnalysis).not.toHaveBeenCalled()
    })

    it('should fall back to individual APIs when batch API fails', async () => {
      // バッチAPIは失敗
      vi.mocked(mockApiClient.getBatchAnalysisData).mockRejectedValue(new Error('Batch API not available'))
      
      // 個別APIは成功
      vi.mocked(mockApiClient.getStudyLogs).mockResolvedValue([])
      vi.mocked(mockApiClient.getMorningTests).mockResolvedValue([])
      vi.mocked(mockApiClient.getAfternoonTests).mockResolvedValue([])
      vi.mocked(mockApiClient.getStudyLogStats).mockResolvedValue(null)
      vi.mocked(mockApiClient.getPredictiveAnalysis).mockResolvedValue(null)
      vi.mocked(mockApiClient.getPersonalizedRecommendations).mockResolvedValue(null)
      vi.mocked(mockApiClient.getAdvancedWeakPoints).mockResolvedValue(null)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)

      render(<MockedAnalysis />)

      await waitFor(() => {
        expect(mockApiClient.getBatchAnalysisData).toHaveBeenCalledWith(1)
        // フォールバックAPIが呼ばれることを確認
        expect(mockApiClient.getStudyLogs).toHaveBeenCalled()
        expect(mockApiClient.getMorningTests).toHaveBeenCalled()
        expect(mockApiClient.getAfternoonTests).toHaveBeenCalled()
      })
    })
  })

  describe('ML Analysis Features', () => {
    it('should display predictive analysis when available', async () => {
      const mockBatchData = {
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: {
          examPassProbability: 92,
          recommendedStudyHours: 2.5,
          timeToReadiness: 10,
          riskFactors: ['時間管理'],
          successFactors: ['継続性'],
          confidenceInterval: { lower: 88, upper: 95 },
          weakAreaPredictions: []
        },
        personalizedRecommendations: null,
        advancedWeakPoints: null
      }

      vi.mocked(mockApiClient.getBatchAnalysisData).mockResolvedValue(mockBatchData)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)

      render(<MockedAnalysis />)

      await waitFor(() => {
        expect(screen.getByText('🤖 AI予測分析')).toBeInTheDocument()
        expect(screen.getByText('92%')).toBeInTheDocument()
        expect(screen.getByText('合格予測確率')).toBeInTheDocument()
      })
    })

    it('should display personalized recommendations when available', async () => {
      const mockBatchData = {
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: null,
        personalizedRecommendations: {
          dailyStudyPlan: [{
            date: '2024-01-01',
            subjects: ['ネットワーク', 'データベース'],
            estimatedTime: 120,
            priority: 'high' as const,
            objectives: ['基礎固め', '過去問対策'],
            adaptiveAdjustments: {
              basedOnPerformance: true,
              basedOnTimeConstraints: false,
              basedOnMotivation: true
            }
          }],
          prioritySubjects: [],
          reviewSchedule: [],
          motivationalInsights: ['継続が重要です'],
          learningPathOptimization: {
            currentPath: 'basic',
            optimizedPath: 'advanced',
            expectedImprovement: 20
          }
        },
        advancedWeakPoints: null
      }

      vi.mocked(mockApiClient.getBatchAnalysisData).mockResolvedValue(mockBatchData)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)

      render(<MockedAnalysis />)

      await waitFor(() => {
        expect(screen.getByText('📋 パーソナライズ学習推奨')).toBeInTheDocument()
        expect(screen.getByText('ネットワーク、データベース')).toBeInTheDocument()
        expect(screen.getByText('120分')).toBeInTheDocument()
      })
    })

    it('should generate ML analysis when button is clicked', async () => {
      const mockBatchData = {
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: null,
        personalizedRecommendations: null,
        advancedWeakPoints: null
      }

      vi.mocked(mockApiClient.getBatchAnalysisData).mockResolvedValue(mockBatchData)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)
      vi.mocked(mockApiClient.generateMLAnalysis).mockResolvedValue({
        id: 1,
        userId: 1,
        analysisDate: '2024-01-01',
        overallScore: 85,
        studyPattern: {
          totalStudyTime: 100,
          averageStudyTime: 50,
          studyFrequency: 5,
          bestStudyTime: '18:00',
          consistencyScore: 8,
          preferredSubjects: ['Math'],
          learningVelocity: 1.2,
          concentrationSpan: 45
        },
        weaknessAnalysis: {
          weakSubjects: [],
          weakTopics: [],
          improvementAreas: [],
          rootCauses: []
        },
        studyRecommendation: {
          dailyStudyTime: 120,
          weeklyGoal: 840,
          focusSubjects: ['Math'],
          reviewSchedule: [],
          adaptivePacing: {
            currentPace: 'normal',
            recommendedPace: 'fast',
            reason: 'Good progress'
          }
        },
        learningEfficiencyScore: 85,
        predictions: {
          examPassProbability: 90,
          recommendedStudyHours: 3,
          riskFactors: [],
          successFactors: [],
          milestonesPrediction: []
        },
        personalizedRecommendations: []
      })

      // ML分析生成後のデータ取得をモック
      vi.mocked(mockApiClient.getPredictiveAnalysis).mockResolvedValue(null)
      vi.mocked(mockApiClient.getPersonalizedRecommendations).mockResolvedValue(null)
      vi.mocked(mockApiClient.getAdvancedWeakPoints).mockResolvedValue(null)

      render(<MockedAnalysis />)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ml分析を実行/i })).toBeInTheDocument()
      })

      fireEvent.click(screen.getByRole('button', { name: /ml分析を実行/i }))

      await waitFor(() => {
        expect(mockApiClient.generateMLAnalysis).toHaveBeenCalledWith(1)
      })
    })
  })

  describe('Error Handling', () => {
    it('should display error message when batch API fails and fallback also fails', async () => {
      vi.mocked(mockApiClient.getBatchAnalysisData).mockRejectedValue(new Error('Batch API error'))
      vi.mocked(mockApiClient.getStudyLogs).mockRejectedValue(new Error('Fallback error'))

      render(<MockedAnalysis />)

      await waitFor(() => {
        expect(screen.getByText(/データの取得に失敗しました/)).toBeInTheDocument()
      })
    })

    it('should display ML error message when ML data fails', async () => {
      const mockBatchData = {
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: null,
        personalizedRecommendations: null,
        advancedWeakPoints: null
      }

      vi.mocked(mockApiClient.getBatchAnalysisData).mockResolvedValue(mockBatchData)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)
      vi.mocked(mockApiClient.generateMLAnalysis).mockRejectedValue(new Error('ML generation failed'))

      render(<MockedAnalysis />)

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /ml分析を実行/i })
        fireEvent.click(generateButton)
      })

      await waitFor(() => {
        expect(screen.getByText(/ML分析の生成に失敗しました/)).toBeInTheDocument()
      })
    })
  })

  describe('Loading States', () => {
    it('should show loading state during batch API call', async () => {
      // バッチAPIを遅延させる
      let resolvePromise: (_value: any) => void
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve
      })
      
      vi.mocked(mockApiClient.getBatchAnalysisData).mockReturnValue(pendingPromise)

      render(<MockedAnalysis />)

      // ローディング状態を確認
      expect(screen.getByText(/データを読み込み中/)).toBeInTheDocument()

      // プロミスを解決
      resolvePromise!({
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: null,
        personalizedRecommendations: null,
        advancedWeakPoints: null
      })

      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)

      await waitFor(() => {
        expect(screen.queryByText(/データを読み込み中/)).not.toBeInTheDocument()
      })
    })

    it('should show ML generation loading state', async () => {
      const mockBatchData = {
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: null,
        personalizedRecommendations: null,
        advancedWeakPoints: null
      }

      vi.mocked(mockApiClient.getBatchAnalysisData).mockResolvedValue(mockBatchData)
      vi.mocked(mockApiClient.getLatestAnalysis).mockResolvedValue(null)

      // ML生成を遅延させる
      let resolveMlPromise: (_value: any) => void
      const pendingMlPromise = new Promise((resolve) => {
        resolveMlPromise = resolve
      })
      
      vi.mocked(mockApiClient.generateMLAnalysis).mockReturnValue(pendingMlPromise)

      render(<MockedAnalysis />)

      await waitFor(() => {
        const generateButton = screen.getByRole('button', { name: /ml分析を実行/i })
        fireEvent.click(generateButton)
      })

      // ML生成中の状態を確認
      expect(screen.getByText(/生成中.../)).toBeInTheDocument()

      // ML生成を完了
      resolveMlPromise!({} as any)

      await waitFor(() => {
        expect(screen.queryByText(/生成中.../)).not.toBeInTheDocument()
      })
    })
  })
})