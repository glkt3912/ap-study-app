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
  StudyLog,
  CreateStudyLogRequest,
  StudyDay,
  StudyWeek,
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
  // 学習記録作成（エラーハンドリング強化版）
  async createStudyLog(log: any): Promise<any> {
    try {
      return await studyClient.createStudyLog(log);
    } catch (error) {
      console.error('StudyClient.createStudyLog failed:', error);
      // より詳細なエラー情報を提供
      throw new Error(`学習記録の作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  // 学習記録取得（エラーハンドリング強化版）
  async getStudyLogs(): Promise<any[]> {
    try {
      return await studyClient.getStudyLogs();
    } catch (error) {
      console.warn('StudyClient.getStudyLogs failed, returning empty array:', error);
      // APIが利用できない場合は空の配列を返す
      return [];
    }
  }
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
  getStudyPlanProgress = studyClient.getStudyProgress.bind(studyClient);
  getWeeklyPlanTemplate = systemClient.getStudyPlanTemplate.bind(systemClient);
  updateStudyProgress = studyClient.updateTaskProgress.bind(studyClient);
  async saveWeeklyPlanTemplate(userId: string | number, planData: any): Promise<any> {
    // Use unified API endpoint for study plan management
    return authClient.request(`/api/study-plans`, {
      method: 'POST',
      body: JSON.stringify({
        userId: userId,
        name: planData.templateName || 'Weekly Plan Template',
        description: `Study plan created from template: ${planData.templateName}`,
        templateId: planData.templateId,
        targetExamDate: planData.targetExamDate,
        studyWeeksData: planData.studyWeeksData,
        estimatedHours: planData.estimatedHours
      })
    });
  }

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
  getQuizCategories = quizClient.getCategories.bind(quizClient);
  getQuizProgress = quizClient.getQuizStats.bind(quizClient);

  // Topic Suggestions (PR #27 style)
  async getTopicSuggestions(options?: { subject?: string; query?: string }): Promise<string[]> {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const params = new URLSearchParams();
      
      if (options?.subject) {
        params.append('subject', options.subject);
      }
      if (options?.query) {
        params.append('query', options.query);
      }
      
      const endpoint = `${backendUrl}/api/topic-suggestions${params.toString() ? '?' + params.toString() : ''}`;
      console.log('Making topic suggestions request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Topic suggestions response:', data);
      
      return data.data || data;
    } catch (error) {
      console.error('Topic suggestions fetch error:', error);
      throw error;
    }
  }

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
  exportQuizData = systemClient.exportUserData.bind(systemClient);
}

// Backward compatibility
export const apiClient = new LegacyApiClient();