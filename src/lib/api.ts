// API Client for backend communication

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

export interface StudyWeek {
  id: number;
  weekNumber: number;
  title: string;
  phase: string;
  goals: string[];
  days: StudyDay[];
  progressPercentage: number;
  totalStudyTime: number;
  averageUnderstanding: number;
}

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
  sessionType: "category" | "random" | "review" | "weak_points";
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
      "Content-Type": "application/json",
    };

    // ブラウザ環境でのみLocalStorageにアクセス
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ap-study-token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const startTime = performance.now();
    const method = options?.method || 'GET';
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
        ...options,
      });

      const duration = performance.now() - startTime;

      if (!response.ok) {
        const error = new Error(`HTTP error! status: ${response.status}`);
        
        // 監視システムにAPI エラーを記録
        if (typeof window !== 'undefined') {
          const { monitoring } = await import('./monitoring');
          monitoring.trackApiCall(endpoint, method, duration, response.status, error);
        }
        
        throw error;
      }

      const data = await response.json();

      if (!data.success) {
        const error = new Error(data.error || "API request failed");
        
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
    const url = userId ? `/api/study/plan?userId=${userId}` : "/api/study/plan";
    return this.request<StudyWeek[]>(url);
  }

  async getStudyWeek(weekNumber: number): Promise<StudyWeek> {
    return this.request<StudyWeek>(`/api/study/plan/${weekNumber}`);
  }

  async getCurrentWeek(): Promise<StudyWeek> {
    return this.request<StudyWeek>("/api/study/current-week");
  }

  async completeTask(weekNumber: number, dayIndex: number): Promise<void> {
    await this.request("/api/study/complete-task", {
      method: "POST",
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
    await this.request("/api/study/progress", {
      method: "PUT",
      body: JSON.stringify({
        weekNumber,
        dayIndex,
        ...data,
      }),
    });
  }

  // 学習記録API
  async getStudyLogs(): Promise<StudyLog[]> {
    return this.request<StudyLog[]>("/api/studylog");
  }

  async createStudyLog(
    studyLog: Omit<StudyLog, "id" | "efficiency">
  ): Promise<StudyLog> {
    return this.request<StudyLog>("/api/studylog", {
      method: "POST",
      body: JSON.stringify(studyLog),
    });
  }

  async updateStudyLog(
    id: number,
    studyLog: Partial<Omit<StudyLog, "id" | "efficiency">>
  ): Promise<StudyLog> {
    return this.request<StudyLog>(`/api/studylog/${id}`, {
      method: "PUT",
      body: JSON.stringify(studyLog),
    });
  }

  async deleteStudyLog(id: number): Promise<void> {
    await this.request(`/api/studylog/${id}`, {
      method: "DELETE",
    });
  }

  async getStudyLogsBySubject(subject: string): Promise<StudyLog[]> {
    return this.request<StudyLog[]>(
      `/api/studylog/subject/${encodeURIComponent(subject)}`
    );
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
    return this.request("/api/studylog/stats");
  }

  // 午前問題記録API
  async getMorningTests(): Promise<MorningTest[]> {
    return this.request<MorningTest[]>("/api/test/morning");
  }

  async createMorningTest(
    test: Omit<MorningTest, "id" | "accuracy">
  ): Promise<MorningTest> {
    return this.request<MorningTest>("/api/test/morning", {
      method: "POST",
      body: JSON.stringify(test),
    });
  }

  async deleteMorningTest(id: number): Promise<void> {
    await this.request(`/api/test/morning/${id}`, {
      method: "DELETE",
    });
  }

  async getMorningTestStats(): Promise<TestStats> {
    return this.request<TestStats>("/api/test/morning/stats");
  }

  // 午後問題記録API
  async getAfternoonTests(): Promise<AfternoonTest[]> {
    return this.request<AfternoonTest[]>("/api/test/afternoon");
  }

  async createAfternoonTest(
    test: Omit<AfternoonTest, "id">
  ): Promise<AfternoonTest> {
    return this.request<AfternoonTest>("/api/test/afternoon", {
      method: "POST",
      body: JSON.stringify(test),
    });
  }

  async deleteAfternoonTest(id: number): Promise<void> {
    await this.request(`/api/test/afternoon/${id}`, {
      method: "DELETE",
    });
  }

  async getAfternoonTestStats(): Promise<TestStats> {
    return this.request<TestStats>("/api/test/afternoon/stats");
  }

  // 期間指定テスト記録取得
  async getMorningTestsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<MorningTest[]> {
    return this.request<MorningTest[]>("/api/test/morning/date-range", {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  async getAfternoonTestsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<AfternoonTest[]> {
    return this.request<AfternoonTest[]>("/api/test/afternoon/date-range", {
      method: "POST",
      body: JSON.stringify({ startDate, endDate }),
    });
  }

  // 分析API
  async runAnalysis(userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return this.request(`/api/analysis/analyze${params}`, {
      method: "POST",
    });
  }

  async getLatestAnalysis(userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return this.request(`/api/analysis/latest${params}`);
  }

  async getAnalysisHistory(
    startDate: string,
    endDate: string,
    userId?: string
  ): Promise<any[]> {
    const params = new URLSearchParams({ startDate, endDate });
    if (userId) params.append("userId", userId);
    return this.request(`/api/analysis/history?${params.toString()}`);
  }

  // 予測API
  async runPrediction(examDate: string, userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return this.request(`/api/analysis/predict${params}`, {
      method: "POST",
      body: JSON.stringify({ examDate }),
    });
  }

  async getLatestPrediction(userId?: string): Promise<any> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return this.request(`/api/analysis/prediction/latest${params}`);
  }

  async getPredictionsByExamDate(
    examDate: string,
    userId?: string
  ): Promise<any[]> {
    const params = userId ? `?userId=${encodeURIComponent(userId)}` : "";
    return this.request(`/api/analysis/prediction/exam/${examDate}${params}`);
  }

  // Quiz API
  async getQuestions(options?: {
    category?: string;
    limit?: number;
    random?: boolean;
  }): Promise<Question[]> {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.random) params.append("random", "true");
    
    const query = params.toString();
    return this.request<Question[]>(`/api/quiz/questions${query ? `?${query}` : ""}`);
  }

  async getQuizCategories(): Promise<QuizCategory[]> {
    return this.request<QuizCategory[]>("/api/quiz/categories");
  }

  async startQuizSession(options: {
    sessionType: "category" | "random" | "review" | "weak_points";
    questionCount: number;
    category?: string;
  }): Promise<{
    sessionId: number;
    questions: Question[];
    totalQuestions: number;
    sessionType: string;
    category?: string;
  }> {
    return this.request("/api/quiz/start", {
      method: "POST",
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
    return this.request("/api/quiz/answer", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async completeQuizSession(sessionId: number): Promise<QuizSession> {
    return this.request("/api/quiz/complete", {
      method: "POST",
      body: JSON.stringify({ sessionId }),
    });
  }

  async getQuizSessions(limit?: number): Promise<QuizSession[]> {
    const params = limit ? `?limit=${limit}` : "";
    return this.request<QuizSession[]>(`/api/quiz/sessions${params}`);
  }

  async getQuizStats(): Promise<QuizStats> {
    return this.request<QuizStats>("/api/quiz/stats");
  }

  // 新しいQuiz API機能
  async getWeakPoints(limit?: number): Promise<any[]> {
    const params = limit ? `?limit=${limit}` : "";
    return this.request<any[]>(`/api/quiz/weak-points${params}`);
  }

  async getRecommendedQuestions(limit?: number): Promise<{
    reason: string;
    weakCategories?: string[];
    questions: Question[];
  }> {
    const params = limit ? `?limit=${limit}` : "";
    return this.request(`/api/quiz/recommendations${params}`);
  }

  async getQuestionById(id: string): Promise<Question & {
    answerHistory?: UserAnswer[];
    relatedQuestions?: Question[];
    difficultyAnalysis?: any;
  }> {
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
    return this.request("/api/quiz/progress");
  }

  async getDetailedAnalysis(options?: {
    category?: string;
    period?: number;
  }): Promise<{
    period: number;
    category?: string;
    efficiencyAnalysis: any[];
    errorPatterns: any[];
    timeAnalysis: any[];
    reviewEffectiveness: any[];
  }> {
    const params = new URLSearchParams();
    if (options?.category) params.append("category", options.category);
    if (options?.period) params.append("period", options.period.toString());
    
    const query = params.toString();
    return this.request(`/api/quiz/detailed-analysis${query ? `?${query}` : ""}`);
  }

  async getLearningTrends(days?: number): Promise<{
    period: number;
    dailyTrends: any[];
    cumulativeProgress: any[];
    categoryTrends: any[];
  }> {
    const params = days ? `?days=${days}` : "";
    return this.request(`/api/quiz/learning-trends${params}`);
  }

  async exportQuizData(options: {
    format?: "json" | "csv";
    period?: number;
    categories?: string[];
  }): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/api/quiz/export`, {
      method: "POST",
      headers: {
        ...this.getAuthHeaders(),
      },
      body: JSON.stringify(options),
    });

    if (options.format === "csv") {
      return response.blob();
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Export failed");
    }
    return data.data;
  }

  // 拡張された分析API
  async getPerformanceMetrics(period?: number): Promise<{
    period: number;
    studyConsistency: any;
    learningEfficiency: any;
    growthAnalysis: any[];
    categoryBalance: any[];
  }> {
    const params = period ? `?period=${period}` : "";
    return this.request(`/api/analysis/performance-metrics${params}`);
  }

  async evaluateExamReadiness(options: {
    examDate: string;
    targetScore?: number;
  }): Promise<{
    examDate: string;
    daysToExam: number;
    targetScore: number;
    currentAbility: any;
    categoryReadiness: any[];
    overallReadiness: string;
    studyRecommendations: any[];
    passProbability: number;
  }> {
    return this.request("/api/analysis/exam-readiness", {
      method: "POST",
      body: JSON.stringify(options),
    });
  }

  async getLearningPattern(): Promise<{
    timePattern: any[];
    frequencyPattern: any[];
    volumePerformanceCorrelation: any[];
    recommendations: {
      optimalTimeSlot: string;
      optimalDayOfWeek: string;
      recommendedDailyQuestions: number;
    };
  }> {
    return this.request("/api/analysis/learning-pattern");
  }

  // 復習システムAPI
  async generateReviewSchedule(): Promise<{ message: string; generated_count: number }> {
    return this.request("/api/analysis/review/generate", {
      method: "POST",
    });
  }

  async getTodayReviews(): Promise<any[]> {
    return this.request("/api/analysis/review/today");
  }

  async completeReview(reviewItemId: string, understanding: number): Promise<{ message: string }> {
    return this.request(`/api/analysis/review/complete/${reviewItemId}`, {
      method: "POST",
      body: JSON.stringify({
        understanding_after: understanding,
      }),
    });
  }

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
    return this.request("/api/learning-efficiency-analysis/generate", {
      method: "POST",
      body: JSON.stringify({
        userId: options.userId,
        timeRange: {
          startDate: options.timeRange.startDate.toISOString(),
          endDate: options.timeRange.endDate.toISOString(),
        },
      }),
    });
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
    return this.request<PredictiveAnalysis>(`/api/learning-efficiency-analysis/predict/${userId}`);
  }

  /**
   * パーソナライズド学習推奨を取得
   */
  async getPersonalizedRecommendations(userId: number): Promise<PersonalizedRecommendations> {
    return this.request<PersonalizedRecommendations>(`/api/learning-efficiency-analysis/recommendations/${userId}`);
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
      body: JSON.stringify({ userId })
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
  async getBatchStudyData(userId?: number): Promise<BatchStudyDataResponse> {
    const params = userId ? `?userId=${userId}` : '';
    return this.request<BatchStudyDataResponse>(`/api/batch/study-data${params}`);
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
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/api/batch/analysis-data${params}`);
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
    const params = userId ? `?userId=${userId}` : '';
    return this.request(`/api/batch/quiz-data${params}`);
  }

  /**
   * バッチ処理: ダッシュボード用ML分析データ取得 (2個のAPI統合)
   */
  async getBatchDashboardMLData(userId: number): Promise<{
    predictiveAnalysis: PredictiveAnalysis | null;
    personalizedRecommendations: PersonalizedRecommendations | null;
  }> {
    return this.request(`/api/batch/dashboard-ml-data/${userId}`);
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
