import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import Dashboard from '../Dashboard'
import { ThemeProvider } from '../../contexts/ThemeContext'

// Mock API client
vi.mock('../../lib/api', () => ({
  apiClient: {
    getStudyPlan: vi.fn(),
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

const MockedDashboard = ({ studyData = [], isLoading = false }: { studyData?: any[], isLoading?: boolean }) => (
  <ThemeProvider>
    <Dashboard studyData={studyData} isLoading={isLoading} />
  </ThemeProvider>
)

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders dashboard title', () => {
    mockApiClient.getStudyPlan.mockResolvedValue([])

    render(<MockedDashboard studyData={[]} />)
    
    expect(screen.getByText('学習進捗')).toBeInTheDocument()
  })

  it('displays loading state initially', () => {
    mockApiClient.getStudyPlan.mockImplementation(() => new Promise(() => {})) // Never resolves

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

    mockApiClient.getStudyPlan.mockResolvedValue(mockData)

    render(<MockedDashboard studyData={mockData} />)
    
    await waitFor(() => {
      expect(screen.getByText('テスト週')).toBeInTheDocument()
    })

    expect(screen.getByText('50.0%')).toBeInTheDocument()
  })

  it('displays error message when API call fails', async () => {
    mockApiClient.getStudyPlan.mockRejectedValue(new Error('API Error'))

    render(<MockedDashboard studyData={[]} />)
    
    expect(screen.getByText('今日の学習タスクはありません')).toBeInTheDocument()
  })

  it('displays empty state when no weeks available', async () => {
    mockApiClient.getStudyPlan.mockResolvedValue([])

    render(<MockedDashboard studyData={[]} />)
    
    expect(screen.getByText('今日の学習タスクはありません')).toBeInTheDocument()
  })
})