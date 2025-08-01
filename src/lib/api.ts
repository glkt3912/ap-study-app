// API Client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export interface StudyDay {
  id: number
  day: string
  subject: string
  topics: string[]
  estimatedTime: number
  actualTime: number
  completed: boolean
  understanding: number
  memo?: string
}

export interface StudyWeek {
  id: number
  weekNumber: number
  title: string
  phase: string
  goals: string[]
  days: StudyDay[]
  progressPercentage: number
  totalStudyTime: number
  averageUnderstanding: number
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  error?: string
}

class ApiClient {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'API request failed')
      }

      return data.data
    } catch (error) {
      console.error('API request failed:', error)
      throw error
    }
  }

  // 学習計画API
  async getStudyPlan(): Promise<StudyWeek[]> {
    return this.request<StudyWeek[]>('/api/study/plan')
  }

  async getStudyWeek(weekNumber: number): Promise<StudyWeek> {
    return this.request<StudyWeek>(`/api/study/plan/${weekNumber}`)
  }

  async getCurrentWeek(): Promise<StudyWeek> {
    return this.request<StudyWeek>('/api/study/current-week')
  }

  async completeTask(weekNumber: number, dayIndex: number): Promise<void> {
    await this.request('/api/study/complete-task', {
      method: 'POST',
      body: JSON.stringify({ weekNumber, dayIndex }),
    })
  }

  async updateStudyProgress(
    weekNumber: number,
    dayIndex: number,
    data: {
      actualTime?: number
      understanding?: number
      memo?: string
      completed?: boolean
    }
  ): Promise<void> {
    await this.request('/api/study/progress', {
      method: 'PUT',
      body: JSON.stringify({
        weekNumber,
        dayIndex,
        ...data
      }),
    })
  }
}

export const apiClient = new ApiClient()