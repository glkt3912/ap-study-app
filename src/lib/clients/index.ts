// Base client
export { BaseClient } from './BaseClient';

// Auth client
export { AuthClient, authClient } from './AuthClient';
export type {
  User,
  LoginRequest,
  SignupRequest,
  AuthResponse,
  UpdateUserRequest,
} from './AuthClient';

// Study client
export { StudyClient, studyClient } from './StudyClient';
export type {
  StudyDay,
  StudyWeek,
  StudyLog,
  StudyPlan,
  StudyPlanProgress,
  StudyMilestone,
  CreateStudyPlanRequest,
  UpdateStudyPlanRequest,
  StudyRecommendation,
} from './StudyClient';

// Quiz client
export { QuizClient, quizClient } from './QuizClient';
export type {
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
} from './QuizClient';

// Analysis client
export { AnalysisClient, analysisClient } from './AnalysisClient';
export type {
  PredictiveAnalysis,
  PersonalizedRecommendations,
  MLAnalysisResult,
  BatchDashboardMLData,
  SystemMetrics,
  StudyPatternML,
  LearningTrend,
  PerformanceInsight,
} from './AnalysisClient';

// System client
export { SystemClient, systemClient } from './SystemClient';
export type {
  SystemInfo,
  ExamConfig,
  CreateExamConfigRequest,
  UpdateExamConfigRequest,
  HealthCheck,
  StudyPlanTemplate,
  StudyPlanPreferences,
} from './SystemClient';

// Legacy compatibility - 既存のapiClientインスタンス
import { authClient } from './AuthClient';
import { studyClient } from './StudyClient';
import { quizClient } from './QuizClient';
import { analysisClient } from './AnalysisClient';
import { systemClient } from './SystemClient';

class LegacyApiClient {
  // Auth methods - delegate to authClient
  verifyAuth = authClient.verifyAuth.bind(authClient);
  getUser = authClient.getUser.bind(authClient);
  verifyCookieAuth = authClient.verifyCookieAuth.bind(authClient);
  login = authClient.login.bind(authClient);
  signup = authClient.signup.bind(authClient);
  logout = authClient.logout.bind(authClient);
  refreshToken = authClient.refreshToken.bind(authClient);
  updateUser = authClient.updateUser.bind(authClient);
  requestPasswordReset = authClient.requestPasswordReset.bind(authClient);
  resetPassword = authClient.resetPassword.bind(authClient);
  // Study methods
  getStudyPlan = studyClient.getStudyPlan.bind(studyClient);
  getStudyWeek = studyClient.getStudyWeek.bind(studyClient);
  getCurrentWeek = studyClient.getCurrentWeek.bind(studyClient);
  completeTask = studyClient.completeTask.bind(studyClient);
  updateTaskProgress = studyClient.updateTaskProgress.bind(studyClient);
  createStudyLog = studyClient.createStudyLog.bind(studyClient);
  getStudyLogs = studyClient.getStudyLogs.bind(studyClient);
  updateStudyLog = studyClient.updateStudyLog.bind(studyClient);
  deleteStudyLog = studyClient.deleteStudyLog.bind(studyClient);
  getAllStudyPlans = studyClient.getAllStudyPlans.bind(studyClient);
  getStudyPlanById = studyClient.getStudyPlanById.bind(studyClient);
  createStudyPlan = studyClient.createStudyPlan.bind(studyClient);
  updateStudyPlan = studyClient.updateStudyPlan.bind(studyClient);
  deleteStudyPlan = studyClient.deleteStudyPlan.bind(studyClient);
  getStudyProgress = studyClient.getStudyProgress.bind(studyClient);
  getStudyStatistics = studyClient.getStudyStatistics.bind(studyClient);
  getStudyRecommendations = studyClient.getStudyRecommendations.bind(studyClient);
  markRecommendationAsRead = studyClient.markRecommendationAsRead.bind(studyClient);
  getStudyEfficiency = studyClient.getStudyEfficiency.bind(studyClient);

  // Quiz methods
  startQuizSession = quizClient.startQuizSession.bind(quizClient);
  submitQuizAnswer = quizClient.submitQuizAnswer.bind(quizClient);
  completeQuizSession = quizClient.completeQuizSession.bind(quizClient);
  getQuizSession = quizClient.getQuizSession.bind(quizClient);
  getQuizSessions = quizClient.getQuizSessions.bind(quizClient);
  getQuizStats = quizClient.getQuizStats.bind(quizClient);
  getWeakPoints = quizClient.getWeakPoints.bind(quizClient);
  getQuestions = quizClient.getQuestions.bind(quizClient);
  getQuestion = quizClient.getQuestion.bind(quizClient);
  getCategories = quizClient.getCategories.bind(quizClient);
  getQuestionsByCategory = quizClient.getQuestionsByCategory.bind(quizClient);
  createMorningTest = quizClient.createMorningTest.bind(quizClient);
  createAfternoonTest = quizClient.createAfternoonTest.bind(quizClient);
  getMorningTests = quizClient.getMorningTests.bind(quizClient);
  getAfternoonTests = quizClient.getAfternoonTests.bind(quizClient);
  updateMorningTest = quizClient.updateMorningTest.bind(quizClient);
  updateAfternoonTest = quizClient.updateAfternoonTest.bind(quizClient);
  deleteMorningTest = quizClient.deleteMorningTest.bind(quizClient);
  deleteAfternoonTest = quizClient.deleteAfternoonTest.bind(quizClient);
  getMorningTestStats = quizClient.getMorningTestStats.bind(quizClient);
  getAfternoonTestStats = quizClient.getAfternoonTestStats.bind(quizClient);
  getReviewQuestions = quizClient.getReviewQuestions.bind(quizClient);
  markQuestionForReview = quizClient.markQuestionForReview.bind(quizClient);

  // Analysis methods
  getPredictiveAnalysis = analysisClient.getPredictiveAnalysis.bind(analysisClient);
  updatePredictiveAnalysis = analysisClient.updatePredictiveAnalysis.bind(analysisClient);
  getPersonalizedRecommendations = analysisClient.getPersonalizedRecommendations.bind(analysisClient);
  generatePersonalizedRecommendations = analysisClient.generatePersonalizedRecommendations.bind(analysisClient);
  getBatchDashboardMLData = analysisClient.getBatchDashboardMLData.bind(analysisClient);
  refreshBatchDashboardMLData = analysisClient.refreshBatchDashboardMLData.bind(analysisClient);
  getMLAnalysisResults = analysisClient.getMLAnalysisResults.bind(analysisClient);
  generateMLAnalysis = analysisClient.generateMLAnalysis.bind(analysisClient);
  getStudyPatternAnalysis = analysisClient.getStudyPatternAnalysis.bind(analysisClient);
  getLearningTrends = analysisClient.getLearningTrends.bind(analysisClient);
  getPerformanceInsights = analysisClient.getPerformanceInsights.bind(analysisClient);
  generatePerformanceInsights = analysisClient.generatePerformanceInsights.bind(analysisClient);
  getComparisonAnalysis = analysisClient.getComparisonAnalysis.bind(analysisClient);
  getModelMetadata = analysisClient.getModelMetadata.bind(analysisClient);
  validatePrediction = analysisClient.validatePrediction.bind(analysisClient);
  clearAnalysisCache = analysisClient.clearAnalysisCache.bind(analysisClient);
  getAnalysisCacheStatus = analysisClient.getAnalysisCacheStatus.bind(analysisClient);

  // System methods
  getSystemInfo = systemClient.getSystemInfo.bind(systemClient);
  getHealthCheck = systemClient.getHealthCheck.bind(systemClient);
  getSystemMetrics = systemClient.getSystemMetrics.bind(systemClient);
  getExamConfig = systemClient.getExamConfig.bind(systemClient);
  createExamConfig = systemClient.createExamConfig.bind(systemClient);
  updateExamConfig = systemClient.updateExamConfig.bind(systemClient);
  deleteExamConfig = systemClient.deleteExamConfig.bind(systemClient);
  getStudyPlanTemplates = systemClient.getStudyPlanTemplates.bind(systemClient);
  getStudyPlanTemplate = systemClient.getStudyPlanTemplate.bind(systemClient);
  getStudyPlanPreferences = systemClient.getStudyPlanPreferences.bind(systemClient);
  updateStudyPlanPreferences = systemClient.updateStudyPlanPreferences.bind(systemClient);
  exportUserData = systemClient.exportUserData.bind(systemClient);
  importUserData = systemClient.importUserData.bind(systemClient);
  getSystemLogs = systemClient.getSystemLogs.bind(systemClient);
  clearSystemLogs = systemClient.clearSystemLogs.bind(systemClient);
  getPerformanceMetrics = systemClient.getPerformanceMetrics.bind(systemClient);
  clearAllCaches = systemClient.clearAllCaches.bind(systemClient);
  getCacheStatistics = systemClient.getCacheStatistics.bind(systemClient);
  getDatabaseStatus = systemClient.getDatabaseStatus.bind(systemClient);
  optimizeDatabase = systemClient.optimizeDatabase.bind(systemClient);
}

// Backward compatibility
export const apiClient = new LegacyApiClient();