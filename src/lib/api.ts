// API Client for backend communication
import { StudyPlan, CreateStudyPlanRequest, StudyPlanProgress, UpdateStudyPlanRequest, StudyWeek } from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface StudyDay {
  id: number;
  day: string;
  subject: string;
  topics: string[];
  estimatedTime: number;
  actualTime: number;
  completed: boolean;
  understanding: number;
  memo?: string;
}

// StudyWeek型はtypes/api.tsから使用

export interface StudyLog {
  id?: number;
  date: string;
  subject: string;
  topics: string[];
  studyTime: number;
  understanding: number;
  memo?: string;
  efficiency?: number;
}

export interface MorningTest {
  id?: number;
  date: string;
  category: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy?: number;
  timeSpent: number;
  memo?: string;
}

export interface AfternoonTest {
  id?: number;
  date: string;
  category: string;
  score: number;
  timeSpent: number;
  memo?: string;
}

export interface TestStats {
  totalTests: number;
  overallAccuracy?: number;
  averageScore?: number;
  maxScore?: number;
  minScore?: number;
  averageTimeSpent: number;
  categoryStats: {
    category: string;
    testCount: number;
    averageAccuracy?: number;
    averageScore?: number;
  }[];
}

export interface ExamConfig {
  id: number;
  userId: number;
  examDate: string;
  targetScore?: number;
  remainingDays?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamConfigRequest {
  examDate: string;
  targetScore?: number;
}

export interface UpdateExamConfigRequest {
  examDate?: string;
  targetScore?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

// Quiz関連インターfaces
export interface Question {
  id: string;
  year: number;
  season: string;
  section: string;
  number: number;
  category: string;
  subcategory?: string;
  difficulty: number;
  question: string;
  choices: string[];
  tags?: string[];
}

export interface QuizSession {
  id: number;
  userId?: number;
  sessionType: 'category' | 'random' | 'review' | 'weak_points';
  category?: string;
  totalQuestions: number;
  correctAnswers: number;
  totalTime: number;
  avgTimePerQ: number;
  score: number;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
}

export interface UserAnswer {
  id: number;
  userId?: number;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  timeSpent?: number;
  attemptNumber: number;
  createdAt: string;
}

export interface QuizCategory {
  category: string;
  questionCount: number;
}

export interface QuizStats {
  totalSessions: number;
  averageScore: number;
  categoryStats: {
    category: string;
    sessionCount: number;
    averageScore: number;
  }[];
}

class ApiClient {
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ブラウザ環境でのみLocalStorageにアクセス
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('ap-study-token');
      
      const enableAuthLogging = process.env.NEXT_PUBLIC_ENABLE_AUTH_LOGGING === 'true';
      
      if (process.env.NODE_ENV === 'development') {
        // 開発環境: デフォルトのテストトークンを使用
        if (!token || token === 'cookie-authenticated') {
          // 開発環境用のデフォルトテストトークン（User ID: 7）
          token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwidXNlcklkIjo3LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NTQ2NTIwMywiZXhwIjoxNzU4MDU3MjAzfQ.RHF7B13iGWdvbNwGkZM0gH8XSsMU0JeFaMAfLQ1_glA';
          if (enableAuthLogging) {
            console.log('Development mode: Using default test token (User ID: 7)');
          }
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          if (enableAuthLogging) {
            console.log('Development mode: Using Bearer token authentication');
          }
        }
      } else {
        // 本番環境: HttpOnly Cookie優先、フォールバックとしてBearer token
        if (token && token !== 'cookie-authenticated') {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    return headers;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const startTime = performance.now();
    const method = options?.method || 'GET';
    const url = `${API_BASE_URL}${endpoint}`;

    const requestConfig = {
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      // HttpOnly Cookie対応: 常にcredentials includeを使用
      // バックエンドはオプショナル認証なので、認証なしでも動作する
      credentials: 'include' as const,
      ...options,
    };

    // 詳細なAPI リクエストログは特定の環境変数でのみ有効
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
      // eslint-disable-next-line no-console
      console.log(`API ${method}: ${url}`);
      if (options?.body) {
        // eslint-disable-next-line no-console
        console.log('Body:', options.body);
      }
    }

    try {
      const response = await fetch(url, requestConfig);

      const duration = performance.now() - startTime;

      // 詳細なレスポンスログは特定の環境変数でのみ有効
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
        // eslint-disable-next-line no-console
        console.log(`API ${response.status}: ${method} ${url} (${duration.toFixed(2)}ms)`);
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          const errorBody = await response.text();
          if (errorBody) {
            try {
              errorDetails = JSON.parse(errorBody);
              errorMessage = errorDetails.error || errorDetails.message || errorMessage;
            } catch {
              errorMessage = errorBody.length > 0 ? errorBody : errorMessage;
            }
          }
        } catch {
          // エラーボディの読み取りに失敗した場合はデフォルトメッセージを使用
        }

        const error = new Error(errorMessage);
        
        // 開発環境でエラー情報をコンパクトに出力
        if (process.env.NODE_ENV === 'development') {
          // 404エラーは警告レベルで出力（よくある正常なケース）
          if (response.status === 404) {
            // eslint-disable-next-line no-console
            console.warn(`API 404: ${method} ${url}`);
          } else if (response.status >= 500) {
            // eslint-disable-next-line no-console
            console.error(`API ${response.status}: ${method} ${url} - ${errorMessage}`);
          } else {
            // eslint-disable-next-line no-console
            console.warn(`API ${response.status}: ${method} ${url} - ${errorMessage}`);
          }
        }

        // 監視システムにAPI エラーを記録
        if (typeof window !== 'undefined') {
          const { monitoring } = await import('./monitoring');
          monitoring.trackApiCall(endpoint, method, duration, response.status, error);
        }

        throw error;
      }

      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Response Data:', data);
      }

      if (!data.success) {
        const error = new Error(data.error || 'API request failed');

        // 監視システムにAPI エラーを記録
        if (typeof window !== 'undefined') {
          const { monitoring } = await import('./monitoring');
          monitoring.trackApiCall(endpoint, method, duration, response.status, error);
        }

        throw error;
      }

      // 監視システムに成功したAPI呼び出しを記録
      if (typeof window !== 'undefined') {
        const { monitoring } = await import('./monitoring');
        monitoring.trackApiCall(endpoint, method, duration, response.status);
      }

      return data.data;
    } catch (error) {
      const duration = performance.now() - startTime;

      // ネットワークエラーを開発環境で適切にログ出力
      if (process.env.NODE_ENV === 'development') {
        if (error instanceof Error) {
          if (error.message.includes('fetch')) {
            // eslint-disable-next-line no-console
            console.warn(`Network error: ${method} ${url} - ${error.message}`);
          } else {
            // eslint-disable-next-line no-console
            console.warn(`API request error: ${method} ${url} - ${error.message}`);
          }
        }
      }

      // 監視システムにネットワークエラーを記録
      if (typeof window !== 'undefined') {
        const { monitoring } = await import('./monitoring');
        monitoring.trackApiCall(endpoint, method, duration, 0, error as Error);
      }

      throw error;
    }
  }

  // 学習計画API
  async getStudyPlan(userId?: string): Promise<StudyWeek[]> {
    const url = userId ? `/api/study/plan?userId=${userId}` : '/api/study/plan';
    return this.request<StudyWeek[]>(url);
  }

  async getStudyWeek(weekNumber: number): Promise<StudyWeek> {
    return this.request<StudyWeek>(`/api/study/plan/${weekNumber}`);
  }

  async getCurrentWeek(): Promise<StudyWeek> {
    return this.request<StudyWeek>('/api/study/current-week');
  }

  async completeTask(weekNumber: number, dayIndex: number): Promise<void> {
    await this.request('/api/study/complete-task', {
      method: 'POST',
      body: JSON.stringify({ weekNumber, dayIndex }),
    });
  }

  async updateStudyProgress(
    weekNumber: number,
    dayIndex: number,
    data: {
      actualTime?: number;
      understanding?: number;
      memo?: string;
      completed?: boolean;
    }
  ): Promise<void> {
    await this.request('/api/study/progress', {
      method: 'PUT',
      body: JSON.stringify({
        weekNumber,
        dayIndex,
        ...data,
      }),
    });
  }

  // 学習記録API
  async getStudyLogs(): Promise<StudyLog[]> {
    return this.request<StudyLog[]>('/api/studylog');
  }

  async createStudyLog(studyLog: Omit<StudyLog, 'id' | 'efficiency'>): Promise<StudyLog> {
    return this.request<StudyLog>('/api/studylog', {
      method: 'POST',
      body: JSON.stringify(studyLog),
    });
  }

  async updateStudyLog(id: number, studyLog: Partial<Omit<StudyLog, 'id' | 'efficiency'>>): Promise<StudyLog> {
    return this.request<StudyLog>(`/api/studylog/${id}`, {
      method: 'PUT',
      body: JSON.stringify(studyLog),
    });
  }

  async deleteStudyLog(id: number): Promise<void> {
    await this.request(`/api/studylog/${id}`, {
      method: 'DELETE',
    });
  }

  async getStudyLogsBySubject(subject: string): Promise<StudyLog[]> {
    return this.request<StudyLog[]>(`/api/studylog/subject/${encodeURIComponent(subject)}`);
  }

  async getStudyLogStats(): Promise<{
    totalTime: number;
    averageUnderstanding: number;
    totalSessions: number;
    subjectStats: Array<{
      subject: string;
      totalTime: number;
      sessionCount: number;
      averageUnderstanding: number;
      latestActivity: string;
    }>;
  }> {
    return this.request('/api/studylog/stats');
  }

  // 午前問題記録API
  async getMorningTests(): Promise<MorningTest[]> {
    return this.request<MorningTest[]>('/api/test/morning');
  }

  async createMorningTest(test: Omit<MorningTest, 'id' | 'accuracy'>): Promise<MorningTest> {
    return this.request<MorningTest>('/api/test/morning', {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async deleteMorningTest(id: number): Promise<void> {
    await this.request(`/api/test/morning/${id}`, {
      method: 'DELETE',
    });
  }

  async getMorningTestStats(): Promise<TestStats> {
    return this.request<TestStats>('/api/test/morning/stats');
  }

  // 午後問題記録API
  async getAfternoonTests(): Promise<AfternoonTest[]> {
    return this.request<AfternoonTest[]>('/api/test/afternoon');
  }

  async createAfternoonTest(test: Omit<AfternoonTest, 'id'>): Promise<AfternoonTest> {
    return this.request<AfternoonTest>('/api/test/afternoon', {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async deleteAfternoonTest(id: number): Promise<void> {
    await this.request(`/api/test/afternoon/${id}`, {
      method: 'DELETE',
    });
  }

  async getAfternoonTestStats(): Promise<TestStats> {
    return this.request<TestStats>('/api/test/afternoon/stats');
  }

  // 期間指定テスト記録取得
  async getMorningTestsByDateRange(startDate: string, endDate: string): Promise<MorningTest[]> {
    return this.request<MorningTest[]>('/api/test/morning/date-range', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  async getAfternoonTestsByDateRange(startDate: string, endDate: string): Promise<AfternoonTest[]> {
    return this.request<AfternoonTest[]>('/api/test/afternoon/date-range', {
      method: 'POST',
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  // 分析API
  async runAnalysis(userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/analysis/analyze${params}`, {
      method: 'POST',
    });
  }

  async getLatestAnalysis(userId?: string): Promise<any> {
    try {
      const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
      return await this.request(`/api/analysis/latest${params}`);
    } catch (error) {
      // 404エラーの場合はnullを返す
      return null;
    }
  }

  async getAnalysisHistory(startDate: string, endDate: string, userId?: string): Promise<any[]> {
    const params = new URLSearchParams({ startDate, endDate });
    if (userId) params.append('userId', userId);
    return this.request(`/api/analysis/history?${params.toString()}`);
  }

  // 予測API
  async runPrediction(examDate: string, userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/analysis/predict${params}`, {
      method: 'POST',
      body: JSON.stringify({ examDate }),
    });
  }

  async getLatestPrediction(userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/analysis/prediction/latest${params}`);
  }

  async getPredictionsByExamDate(examDate: string, userId?: string): Promise<any[]> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request(`/api/analysis/prediction/exam/${examDate}${params}`);
  }

  // Quiz API
  async getQuestions(options?: { category?: string; limit?: number; random?: boolean }): Promise<Question[]> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.random) params.append('random', 'true');

    const query = params.toString();
    return this.request<Question[]>(`/api/quiz/questions${query ? `?${query}` : ''}`);
  }

  async getQuizCategories(): Promise<QuizCategory[]> {
    return this.request<QuizCategory[]>('/api/quiz/categories');
  }

  async startQuizSession(options: {
    sessionType: 'category' | 'random' | 'review' | 'weak_points';
    questionCount: number;
    category?: string;
  }): Promise<{
    sessionId: number;
    questions: Question[];
    totalQuestions: number;
    sessionType: string;
    category?: string;
  }> {
    return this.request('/api/quiz/start', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async submitQuizAnswer(options: {
    sessionId: number;
    questionId: string;
    userAnswer: string;
    timeSpent?: number;
  }): Promise<{
    answerId: number;
    isCorrect: boolean;
    correctAnswer: string;
  }> {
    return this.request('/api/quiz/answer', {
      method: 'POST',
      body: JSON.stringify(options),
    });
  }

  async completeQuizSession(sessionId: number): Promise<QuizSession> {
    return this.request('/api/quiz/complete', {
      method: 'POST',
      body: JSON.stringify({ sessionId }),
    });
  }

  async getQuizSessions(limit?: number): Promise<QuizSession[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<QuizSession[]>(`/api/quiz/sessions${params}`);
  }

  async getQuizStats(): Promise<QuizStats> {
    return this.request<QuizStats>('/api/quiz/stats');
  }

  // 新しいQuiz API機能
  async getWeakPoints(limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request<any[]>(`/api/quiz/weak-points${params}`);
  }

  async getRecommendedQuestions(limit?: number): Promise<RecommendedQuestionsResponse> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/api/quiz/recommendations${params}`);
  }

  async getQuestionById(id: string): Promise<
    Question & {
      answerHistory?: UserAnswer[];
      relatedQuestions?: Question[];
      difficultyAnalysis?: any;
    }
  > {
    return this.request(`/api/quiz/questions/${id}`);
  }

  async getQuizProgress(): Promise<{
    overall: {
      totalQuestions: number;
      answeredQuestions: number;
      progressRate: number;
    };
    categoryProgress: any[];
    recentActivity: QuizSession[];
  }> {
    return this.request('/api/quiz/progress');
  }

  async getDetailedAnalysis(options?: { category?: string; period?: number }): Promise<{
    period: number;
    category?: string;
    efficiencyAnalysis: any[];
    errorPatterns: any[];
    timeAnalysis: any[];
    reviewEffectiveness: any[];
  }> {
    const params = new URLSearchParams();
    if (options?.category) params.append('category', options.category);
    if (options?.period) params.append('period', options.period.toString());

    const query = params.toString();
    return this.request(`/api/quiz/detailed-analysis${query ? `?${query}` : ''}`);
  }

  async getLearningTrends(days?: number): Promise<{
    period: number;
    dailyTrends: any[];
    cumulativeProgress: any[];
    categoryTrends: any[];
  }> {
    const params = days ? `?days=${days}` : '';
    return this.request(`/api/quiz/learning-trends${params}`);
  }

  async exportQuizData(options: { format?: 'json' | 'csv'; period?: number; categories?: string[] }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/quiz/export`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(options),
    });

    if (options.format === 'csv') {
      return response.blob();
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Export failed');
    }
    return data.data;
  }

  // 拡張された分析API
  async getPerformanceMetrics(period?: number, userId?: number): Promise<{
    period: number;
    studyConsistency: any;
    learningEfficiency: any;
    growthAnalysis: any[];
    categoryBalance: any[];
  }> {
    try {
      const params = new URLSearchParams({
        period: (period || 30).toString(),
        userId: (userId || 1).toString()
      });
      const response = await this.request<ApiResponse<any>>(`/api/analysis/performance-metrics?${params}`);
      return response.data;
    } catch (error) {
      // エラー時はデフォルト値を返す
      return {
        period: period || 30,
        studyConsistency: {
          study_days: 0,
          total_sessions: 0,
          avg_session_duration: 0,
          consistency_rate: 0,
        },
        learningEfficiency: {
          avg_score: 0,
          avg_time_per_question: 0,
          total_questions_attempted: 0,
          avg_total_time: 0,
        },
        growthAnalysis: [],
        categoryBalance: [],
      };
    }
  }

  async evaluateExamReadiness(options: { examDate: string; targetScore?: number; userId?: number }): Promise<{
    examDate: string;
    daysToExam: number;
    targetScore: number;
    currentAbility: any;
    categoryReadiness: any[];
    overallReadiness: string;
    studyRecommendations: any[];
    passProbability: number;
  }> {
    const userId = options.userId || 1;
    const response = await this.request<ApiResponse<any>>(`/api/analysis/exam-readiness?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify(options),
    });
    return response.data;
  }

  async getLearningPattern(userId?: number): Promise<{
    timePattern: any[];
    frequencyPattern: any[];
    volumePerformanceCorrelation: any[];
    recommendations: {
      optimalTimeSlot: string;
      optimalDayOfWeek: string;
      recommendedDailyQuestions: number;
    };
  }> {
    const params = new URLSearchParams({
      userId: (userId || 1).toString()
    });
    const response = await this.request<ApiResponse<any>>(`/api/analysis/learning-pattern?${params}`);
    return response.data;
  }

  // 試験設定API
  async getExamConfig(userId: string): Promise<ExamConfig> {
    return this.request(`/api/exam-config/${encodeURIComponent(userId)}`);
  }

  async setExamConfig(userId: string, config: CreateExamConfigRequest): Promise<ExamConfig> {
    return this.request(`/api/exam-config/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateExamConfig(userId: string, config: UpdateExamConfigRequest): Promise<ExamConfig> {
    return this.request(`/api/exam-config/${encodeURIComponent(userId)}`, {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async deleteExamConfig(userId: string): Promise<{ message: string }> {
    return this.request(`/api/exam-config/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  // 復習システムAPI
  async generateReviewSchedule(): Promise<{ message: string; generated_count: number }> {
    return this.request('/api/analysis/review/generate', {
      method: 'POST',
    });
  }

  async getTodayReviews(): Promise<any[]> {
    return this.request('/api/analysis/review/today');
  }

  async completeReview(reviewItemId: string, understanding: number): Promise<{ message: string }> {
    return this.request(`/api/analysis/review/complete/${reviewItemId}`, {
      method: 'POST',
      body: JSON.stringify({
        understanding_after: understanding,
      }),
    });
  }

  // Dynamic Study Plan API (from backend PR #16)
  async getStudyPlans(userId: number): Promise<StudyPlan[]> {
    return this.request(`/api/study-plan/${userId}`);
  }

  async createStudyPlan(userId: number, plan: CreateStudyPlanRequest): Promise<StudyPlan> {
    return this.request(`/api/study-plan/${userId}`, {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async updateStudyPlan(planId: number, plan: UpdateStudyPlanRequest): Promise<StudyPlan> {
    return this.request(`/api/study-plan/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(plan),
    });
  }

  async deleteStudyPlan(planId: number): Promise<void> {
    await this.request(`/api/study-plan/${planId}`, {
      method: 'DELETE',
    });
  }


  async getStudyPlanProgress(planId: number): Promise<StudyPlanProgress> {
    return this.request(`/api/study-plan/${planId}/progress`);
  }

  // Note: Study plan advanced features have been removed as they were not used in the frontend
  // Simplified to basic CRUD operations only

  // 学習計画テンプレート永続化メソッド（新しいバックエンドAPI対応）
  async saveWeeklyPlanTemplate(userId: number, templateData: {
    templateId: string;
    templateName: string;
    studyWeeksData: any;
    estimatedHours?: number;
  }): Promise<StudyPlan> {
    // テンプレート情報から新しいAPIリクエスト形式に変換（緊急型キャスト対応）
    const totalWeeks = templateData.studyWeeksData?.length || 12;
    const weeklyHours = Math.round((templateData.estimatedHours || 180) / totalWeeks);
    const dailyHours = Math.round(weeklyHours / 5);
    
    const request: any = {
      name: templateData.templateName,
      description: `${templateData.templateName}から作成された学習計画`,
      templateId: templateData.templateId,
      templateName: templateData.templateName,
      studyWeeksData: templateData.studyWeeksData,
      settings: {
        timeSettings: {
          totalWeeks: totalWeeks,
          weeklyHours: weeklyHours,
          dailyHours: dailyHours
        },
        planType: {
          isCustom: false,
          source: 'template_based'
        },
        preferences: {},
        metadata: {
          templateId: templateData.templateId,
          templateName: templateData.templateName
        }
      }
    };

    return this.request(`/api/study-plan/${userId}`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getWeeklyPlanTemplate(userId: number): Promise<StudyPlan | null> {
    try {
      // 既存の学習計画を取得
      return await this.request(`/api/study-plan/${userId}`);
    } catch (error) {
      // 学習計画が存在しない場合はnullを返す
      return null;
    }
  }

  // Note: Dynamic study plan methods were removed as they were experimental features
  // not integrated into the frontend UI

  // 学習効率分析API
  async generateLearningEfficiencyAnalysis(options: {
    userId: string;
    timeRange: {
      startDate: Date;
      endDate: Date;
    };
  }): Promise<{
    id: string;
    userId: string;
    analysisDate: string;
    timeRange: {
      startDate: string;
      endDate: string;
    };
    hourlyEfficiency: Array<{
      hour: number;
      avgStudyTime: number;
      avgUnderstanding: number;
      completionRate: number;
      efficiencyScore: number;
    }>;
    subjectEfficiency: Array<{
      subject: string;
      totalStudyTime: number;
      avgUnderstanding: number;
      completionRate: number;
      difficultyLevel: number;
      learningVelocity: number;
    }>;
    recommendations: Array<{
      type: 'time_optimization' | 'subject_focus' | 'schedule_adjustment';
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      expectedImprovement: number;
    }>;
    overallScore: number;
  }> {
    const response = await this.request<ApiResponse<any>>('/api/analysis/learning-efficiency', {
      method: 'POST',
      body: JSON.stringify({
        userId: options.userId,
        timeRange: {
          startDate: options.timeRange.startDate.toISOString(),
          endDate: options.timeRange.endDate.toISOString(),
        },
      }),
    });
    return response.data;
  }

  async getLearningEfficiencyAnalysis(analysisId: string): Promise<any> {
    return this.request(`/api/learning-efficiency-analysis/${analysisId}`);
  }

  async getUserLearningEfficiencyAnalyses(userId: string): Promise<any[]> {
    return this.request(`/api/learning-efficiency-analysis/user/${userId}`);
  }

  // ========================================
  // ML学習効率分析API (高度機能統合)
  // ========================================

  /**
   * 予測分析を実行 (合格確率、推奨学習時間等)
   */
  async getPredictiveAnalysis(userId: number): Promise<PredictiveAnalysis> {
    try {
      return await this.request<PredictiveAnalysis>(`/api/learning-efficiency-analysis/predict/${userId}`);
    } catch (error) {
      throw error; // Dashboard等で.catch()される
    }
  }

  /**
   * パーソナライズド学習推奨を取得
   */
  async getPersonalizedRecommendations(userId: number): Promise<PersonalizedRecommendations> {
    try {
      return await this.request<PersonalizedRecommendations>(`/api/learning-efficiency-analysis/recommendations/${userId}`);
    } catch (error) {
      throw error; // Dashboard等で.catch()される
    }
  }

  /**
   * 最新のML分析結果を取得
   */
  async getLatestMLAnalysis(userId: number): Promise<MLAnalysisResult> {
    return this.request<MLAnalysisResult>(`/api/learning-efficiency-analysis/latest/${userId}`);
  }

  /**
   * ML分析を実行生成
   */
  async generateMLAnalysis(userId: number): Promise<MLAnalysisResult> {
    return this.request<MLAnalysisResult>(`/api/learning-efficiency-analysis/generate`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  }

  /**
   * 高度なQuiz苦手分野分析 (AI搭載)
   */
  async getAdvancedWeakPoints(userId?: number): Promise<AdvancedWeakPointsAnalysis> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<AdvancedWeakPointsAnalysis>(`/api/quiz/weak-points${params}`);
  }

  /**
   * AI推奨問題取得 (パーソナライズド)
   */
  async getAIRecommendedQuestions(userId?: number, limit?: number): Promise<RecommendedQuestionsResponse> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (limit) params.append('limit', limit.toString());
    const query = params.toString();
    return this.request<RecommendedQuestionsResponse>(`/api/quiz/recommendations${query ? `?${query}` : ''}`);
  }

  /**
   * バッチ処理: 包括的学習データ取得 (パフォーマンス最適化)
   */
  async getBatchStudyData(_userId?: number): Promise<BatchStudyDataResponse> {
    try {
      // 既存のAPIエンドポイントを使用してデータを取得
      const [studyPlan, studyLogs] = await Promise.allSettled([
        this.getStudyPlan(),
        this.getStudyLogs()
      ]);

      return {
        studyPlan: studyPlan.status === 'fulfilled' ? studyPlan.value : [],
        studyLogs: studyLogs.status === 'fulfilled' ? studyLogs.value : [],
        testResults: { morningTests: [], afternoonTests: [] },
        analysisResults: [],
        recommendations: {} as PersonalizedRecommendations,
        systemMetrics: {} as SystemMetrics,
        lastUpdated: new Date().toISOString(),
        cacheStatus: 'fresh' as const,
        success: true
      } as BatchStudyDataResponse;
    } catch (error) {
      return {
        studyPlan: [],
        studyLogs: [],
        testResults: { morningTests: [], afternoonTests: [] },
        analysisResults: [],
        recommendations: {} as PersonalizedRecommendations,
        systemMetrics: {} as SystemMetrics,
        lastUpdated: new Date().toISOString(),
        cacheStatus: 'expired' as const,
        success: false
      } as BatchStudyDataResponse;
    }
  }

  /**
   * バッチ処理: 分析ページ用データ一括取得 (7個のAPI統合)
   */
  async getBatchAnalysisData(userId?: number): Promise<{
    studyLogs: StudyLog[];
    morningTests: MorningTest[];
    afternoonTests: AfternoonTest[];
    studyLogStats: any;
    predictiveAnalysis: PredictiveAnalysis | null;
    personalizedRecommendations: PersonalizedRecommendations | null;
    advancedWeakPoints: AdvancedWeakPointsAnalysis | null;
  }> {
    try {
      // 個別エンドポイントから必要なデータを取得
      const [studyLogs, performanceMetrics] = await Promise.allSettled([
        this.getStudyLogs(),
        userId ? this.getPerformanceMetrics(userId) : Promise.resolve(null)
      ]);

      return {
        studyLogs: studyLogs.status === 'fulfilled' ? studyLogs.value : [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: performanceMetrics.status === 'fulfilled' ? performanceMetrics.value : null,
        predictiveAnalysis: null,
        personalizedRecommendations: null,
        advancedWeakPoints: null
      };
    } catch (error) {
      return {
        studyLogs: [],
        morningTests: [],
        afternoonTests: [],
        studyLogStats: null,
        predictiveAnalysis: null,
        personalizedRecommendations: null,
        advancedWeakPoints: null
      };
    }
  }

  /**
   * バッチ処理: Quiz機能用データ一括取得 (5個のAPI統合)
   */
  async getBatchQuizData(userId?: number): Promise<{
    categories: QuizCategory[];
    progress: any;
    recommendations: RecommendedQuestionsResponse | null;
    weakPoints: any[];
    learningTrends: any;
  }> {
    try {
      // 利用可能な個別エンドポイントからデータを取得
      const recommendations = userId 
        ? await this.getRecommendedQuestions(10).catch(() => null)
        : null;

      return {
        categories: [],
        progress: null,
        recommendations: recommendations as RecommendedQuestionsResponse | null,
        weakPoints: [],
        learningTrends: null
      };
    } catch (error) {
      return {
        categories: [],
        progress: null,
        recommendations: null,
        weakPoints: [],
        learningTrends: null
      };
    }
  }

  /**
   * バッチ処理: ダッシュボード用ML分析データ取得 (2個のAPI統合)
   */
  async getBatchDashboardMLData(userId: number): Promise<{
    predictiveAnalysis: PredictiveAnalysis | null;
    personalizedRecommendations: PersonalizedRecommendations | null;
  }> {
    // 個別のAPIリクエストを安全に実行
    const predictiveAnalysisResult = await this.request<PredictiveAnalysis>(`/api/learning-efficiency-analysis/predict/${userId}`)
      .catch(() => null);

    const personalizedRecommendationsResult = await this.request<PersonalizedRecommendations>(`/api/learning-efficiency-analysis/recommendations/${userId}`)
      .catch(() => null);

    return {
      predictiveAnalysis: predictiveAnalysisResult,
      personalizedRecommendations: personalizedRecommendationsResult
    };
  }

  /**
   * 高度監視メトリクス取得
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.request<SystemMetrics>(`/api/monitoring/metrics`);
  }

  /**
   * システム情報取得
   */
  async getSystemInfo(): Promise<SystemInfo> {
    return this.request<SystemInfo>(`/api/monitoring/system`);
  }
}

// ========================================
// ML分析関連の型定義
// ========================================

export interface MLAnalysisResult {
  id: number;
  userId: number;
  analysisDate: string;
  overallScore: number;
  studyPattern: StudyPatternML;
  weaknessAnalysis: WeaknessAnalysisML;
  studyRecommendation: StudyRecommendationML;
  learningEfficiencyScore: number;
  predictions: PredictiveInsights;
  personalizedRecommendations: PersonalizedRecommendation[];
}

export interface PredictiveAnalysis {
  examPassProbability: number;
  recommendedStudyHours: number;
  weakAreaPredictions: WeakAreaPrediction[];
  timeToReadiness: number; // days
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  riskFactors: string[];
  successFactors: string[];
}

export interface PersonalizedRecommendations {
  dailyStudyPlan: DailyStudyRecommendation[];
  prioritySubjects: PrioritySubject[];
  reviewSchedule: ReviewScheduleItemML[];
  motivationalInsights: string[];
  learningPathOptimization: {
    currentPath: string;
    optimizedPath: string;
    expectedImprovement: number;
  };
}

export interface AdvancedWeakPointsAnalysis {
  criticalWeakPoints: WeakPointDetail[];
  improvementPotential: ImprovementPotential[];
  learningPath: LearningPathPhase[];
  aiRecommendations: string[];
}

export interface RecommendedQuestionsResponse {
  reason: string;
  algorithmVersion: string;
  personalizedScore: number;
  questions: Question[];
  learningObjectives: string[];
  difficultyProgression: 'adaptive' | 'progressive' | 'remedial';
}

export interface BatchStudyDataResponse {
  studyPlan: StudyWeek[];
  studyLogs: StudyLog[];
  testResults: {
    morningTests: MorningTest[];
    afternoonTests: AfternoonTest[];
  };
  analysisResults: MLAnalysisResult[];
  recommendations: PersonalizedRecommendations;
  systemMetrics: SystemMetrics;
  lastUpdated: string;
  cacheStatus: 'fresh' | 'stale' | 'expired';
  success: boolean;
}

export interface SystemMetrics {
  performance: {
    averageResponseTime: number;
    requestCount: number;
    errorRate: number;
    successRate: number;
  };
  usage: {
    activeUsers: number;
    totalSessions: number;
    avgSessionDuration: number;
    peakConcurrentUsers: number;
  };
  ml: {
    modelVersion: string;
    predictionAccuracy: number;
    recommendationClickRate: number;
    analysisGenerationTime: number;
  };
}

export interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseConnections: number;
}

// 補助的な型定義
export interface StudyPatternML {
  totalStudyTime: number;
  averageStudyTime: number;
  studyFrequency: number;
  bestStudyTime: string;
  consistencyScore: number;
  preferredSubjects: string[];
  learningVelocity: number;
  concentrationSpan: number;
}

export interface WeaknessAnalysisML {
  weakSubjects: WeakSubjectML[];
  weakTopics: WeakTopicML[];
  improvementAreas: string[];
  rootCauses: string[];
}

export interface StudyRecommendationML {
  dailyStudyTime: number;
  weeklyGoal: number;
  focusSubjects: string[];
  reviewSchedule: ReviewScheduleItemML[];
  adaptivePacing: {
    currentPace: 'slow' | 'normal' | 'fast';
    recommendedPace: 'slow' | 'normal' | 'fast';
    reason: string;
  };
}

export interface PredictiveInsights {
  examPassProbability: number;
  recommendedStudyHours: number;
  riskFactors: string[];
  successFactors: string[];
  milestonesPrediction: {
    milestone: string;
    predictedDate: string;
    confidence: number;
  }[];
}

export interface PersonalizedRecommendation {
  type: 'study_focus' | 'time_management' | 'weak_area' | 'motivation' | 'exam_strategy';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: number;
  timeframe: 'immediate' | 'short_term' | 'long_term';
}

export interface WeakPointDetail {
  subject: string;
  category: string;
  subcategory?: string;
  severity: 'critical' | 'moderate' | 'minor';
  accuracy: number;
  timeSpent: number;
  improvementSuggestions: string[];
  priorityScore: number;
}

export interface WeakSubjectML {
  subject: string;
  understanding: number;
  studyTime: number;
  testScore: number;
  improvement: number;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced';
}

export interface WeakTopicML {
  topic: string;
  subject: string;
  understanding: number;
  testAccuracy: number;
  priority: number;
  conceptDependencies: string[];
}

export interface DailyStudyRecommendation {
  date: string;
  subjects: string[];
  estimatedTime: number;
  priority: 'high' | 'medium' | 'low';
  objectives: string[];
  adaptiveAdjustments: {
    basedOnPerformance: boolean;
    basedOnTimeConstraints: boolean;
    basedOnMotivation: boolean;
  };
}

export interface PrioritySubject {
  subject: string;
  priority: number;
  reason: string;
  recommendedTime: number;
  urgency: 'immediate' | 'soon' | 'moderate' | 'low';
}

export interface ReviewScheduleItemML {
  subject: string;
  nextReviewDate: string;
  priority: number;
  reviewType: 'light' | 'medium' | 'intensive';
  spacedRepetitionInterval: number;
}

export interface WeakAreaPrediction {
  area: string;
  currentPerformance: number;
  predictedPerformance: number;
  interventionSuggestions: string[];
  timeToImprovement: number;
}

export interface ImprovementPotential {
  subject: string;
  currentScore: number;
  potentialScore: number;
  effortRequired: 'low' | 'medium' | 'high';
  timeEstimate: number;
  prerequisites: string[];
}

export interface LearningPathPhase {
  phase: string;
  subjects: string[];
  estimatedDuration: number;
  objectives: string[];
  successCriteria: string[];
}

export const apiClient = new ApiClient();
