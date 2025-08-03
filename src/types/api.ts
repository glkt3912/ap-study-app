// Auto-generated from OpenAPI specification
// Manual type definitions based on API structure

// Common API response structure
export type ApiResponse<T> = {
  success: true
  data: T
} | {
  success: false
  error: string
}

// Study Plan Types
export interface StudyDay {
  id?: number
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

// Study Log Types
export interface StudyLog {
  id?: number
  date: string
  subject: string
  topics: string[]
  studyTime: number
  understanding: number
  memo?: string
  efficiency?: number
}

export type CreateStudyLogRequest = Omit<StudyLog, 'id' | 'efficiency'>

// Test Record Types
export interface MorningTest {
  id?: number
  date: string
  category: string
  totalQuestions: number
  correctAnswers: number
  accuracy?: number
  timeSpent: number
  memo?: string
}

export interface AfternoonTest {
  id?: number
  date: string
  category: string
  score: number
  timeSpent: number
  memo?: string
}

export type CreateMorningTestRequest = Omit<MorningTest, 'id' | 'accuracy'>
export type CreateAfternoonTestRequest = Omit<AfternoonTest, 'id'>

// Quiz Types
export interface Question {
  id: string
  year: number
  season: string
  section: string
  number: number
  category: string
  subcategory?: string
  difficulty: number
  question: string
  choices: string[]
  tags?: string[]
}

export interface QuizSession {
  id: number
  userId?: string
  sessionType: 'category' | 'random' | 'review' | 'weak_points'
  category?: string
  totalQuestions: number
  correctAnswers: number
  totalTime: number
  avgTimePerQ: number
  score: number
  startedAt: string
  completedAt?: string
  isCompleted: boolean
}

export interface StartQuizSessionRequest {
  sessionType: 'category' | 'random' | 'review' | 'weak_points'
  questionCount: number
  category?: string
}

export interface SubmitAnswerRequest {
  sessionId: number
  questionId: string
  userAnswer: string
  timeSpent?: number
}

export interface SubmitAnswerResponse {
  answerId: number
  isCorrect: boolean
  correctAnswer: string
}

// API Response Types
export type GetStudyPlanResponse = ApiResponse<StudyWeek[]>
export type GetStudyWeekResponse = ApiResponse<StudyWeek>
export type GetStudyLogResponse = ApiResponse<StudyLog[]>
export type CreateStudyLogResponse = ApiResponse<StudyLog>
export type UpdateProgressResponse = ApiResponse<{ message: string }>

export type GetMorningTestsResponse = ApiResponse<MorningTest[]>
export type CreateMorningTestResponse = ApiResponse<MorningTest>
export type GetAfternoonTestsResponse = ApiResponse<AfternoonTest[]>
export type CreateAfternoonTestResponse = ApiResponse<AfternoonTest>

export type GetQuizQuestionsResponse = ApiResponse<Question[]>
export type GetQuizCategoriesResponse = ApiResponse<{ category: string; questionCount: number }[]>
export type StartQuizSessionResponse = ApiResponse<{
  sessionId: number
  questions: Question[]
  totalQuestions: number
  sessionType: string
  category?: string
}>
export type SubmitQuizAnswerResponse = ApiResponse<SubmitAnswerResponse>
export type CompleteQuizSessionResponse = ApiResponse<QuizSession>
export type GetQuizSessionsResponse = ApiResponse<QuizSession[]>

// Analysis Types
export interface AnalysisResult {
  totalStudyTime: number
  averageStudyTime: number
  studyFrequency: number
  consistencyScore: number
  weakSubjects: string[]
  strongSubjects: string[]
  recommendedStudyTime: number
  createdAt: string
}

export interface PredictionResult {
  examDate: string
  passProbability: number
  expectedMorningScore: number
  expectedAfternoonScore: number
  readinessLevel: 'excellent' | 'good' | 'needs_improvement' | 'insufficient'
  requiredStudyHours: number
  createdAt: string
}

export type GetAnalysisResponse = ApiResponse<AnalysisResult>
export type GetPredictionResponse = ApiResponse<PredictionResult>

// Error Types
export interface ApiError {
  success: false
  error: string
}

// API Client Types
export interface ApiClientConfig {
  baseURL: string
  headers?: Record<string, string>
}

// Path and operation types for type-safe API calls
export interface ApiPaths {
  '/api/study/plan': {
    get: {
      response: GetStudyPlanResponse
    }
  }
  '/api/study/plan/{weekNumber}': {
    get: {
      params: { weekNumber: number }
      response: GetStudyWeekResponse
    }
  }
  '/api/study/progress': {
    put: {
      body: {
        weekNumber: number
        dayIndex: number
        actualTime?: number
        understanding?: number
        memo?: string
        completed?: boolean
      }
      response: UpdateProgressResponse
    }
  }
  '/api/studylog': {
    get: {
      response: GetStudyLogResponse
    }
    post: {
      body: CreateStudyLogRequest
      response: CreateStudyLogResponse
    }
  }
  '/api/quiz/start': {
    post: {
      body: StartQuizSessionRequest
      response: StartQuizSessionResponse
    }
  }
  '/api/quiz/answer': {
    post: {
      body: SubmitAnswerRequest
      response: SubmitQuizAnswerResponse
    }
  }
}

// Utility types for extracting request/response types
export type RequestBody<T extends keyof ApiPaths> = ApiPaths[T] extends { 
  post: { body: infer B } 
} ? B : ApiPaths[T] extends { 
  put: { body: infer B } 
} ? B : never

export type ResponseType<T extends keyof ApiPaths, M extends keyof ApiPaths[T]> = 
  ApiPaths[T][M] extends { response: infer R } ? R : never

export type PathParams<T extends keyof ApiPaths> = ApiPaths[T] extends {
  get: { params: infer P }
} ? P : never