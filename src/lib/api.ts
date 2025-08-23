// Legacy API Client - DEPRECATED
// Use individual clients from @/lib/clients instead

export * from './clients';

// Re-export for backward compatibility
export { apiClient } from './clients';

// Legacy type re-exports for compatibility
export type {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  UpdateUserRequest,
  StudyDay,
  StudyWeek,
  StudyLog,
  StudyPlan,
  StudyPlanProgress,
  StudyMilestone,
  CreateStudyPlanRequest,
  UpdateStudyPlanRequest,
  StudyRecommendation,
  Question,
  QuizSession,
  StartQuizSessionRequest,
  StartQuizSessionResponse,
  SubmitAnswerRequest,
  MorningTest,
  AfternoonTest,
  TestStats,
  QuizStats,
  WeakPoint,
  PredictiveAnalysis,
  PersonalizedRecommendations,
  MLAnalysisResult,
  BatchDashboardMLData,
  SystemMetrics,
  StudyPatternML,
  LearningTrend,
  PerformanceInsight,
  SystemInfo,
  ExamConfig,
  CreateExamConfigRequest,
  UpdateExamConfigRequest,
  HealthCheck,
  StudyPlanTemplate,
  StudyPlanPreferences,
} from './clients';