/**
 * Unified API Client - Phase 2 統一API対応
 * 
 * 新しい統一されたAPIエンドポイントに対応したクライアント
 * 一貫性のあるレスポンス形式と予測可能なエンドポイント名を提供
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 統一レスポンス形式
export interface UnifiedApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
    version?: string;
    timestamp?: string;
  };
}

// 統一API用の型定義
export interface UnifiedStudyPlan {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  targetExamDate?: string;
  templateId?: string;
  weeks: Array<{
    id: number;
    weekNumber: number;
    title: string;
    phase: string;
    days: Array<{
      id: number;
      day: string;
      subject: string;
      estimatedTime: number;
      actualTime: number;
      completed: boolean;
      understanding: number;
      memo?: string;
    }>;
  }>;
}

export interface UnifiedTestSession {
  id: number;
  type: 'morning' | 'afternoon' | 'quiz';
  category?: string;
  totalQuestions?: number;
  correctAnswers?: number;
  score: number;
  timeSpent: number;
  date?: string;
  startedAt?: string;
  completedAt?: string;
  isCompleted?: boolean;
  memo?: string;
}

export interface UnifiedUserAnalysis {
  id: number;
  type: 'learning_efficiency' | 'prediction';
  date: string;
  overallScore?: number;
  passProbability?: any;
  examDate?: string;
  examReadiness?: any;
  studyPattern?: any;
  weaknessAnalysis?: any;
  studyRecommendation?: any;
  studyTimeRequired?: any;
}

export interface UnifiedReviewEntry {
  id: number;
  userId: number;
  subject: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  lastStudyDate?: string;
  nextReviewDate: string;
  reviewCount: number;
  intervalDays: number;
  understanding: number;
  isCompleted: boolean;
}

class UnifiedApiClient {
  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ブラウザ環境でのみLocalStorageにアクセス
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('ap-study-token');
      
      if (process.env.NODE_ENV === 'development') {
        // 開発環境: 設定に応じた柔軟な認証
        if (token && token !== 'cookie-authenticated') {
          headers['Authorization'] = `Bearer ${token}`;
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
      credentials: 'include' as const,
      ...options,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('=== Unified API Request ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Headers:', requestConfig.headers);
      if (options?.body) {
        console.log('Body:', options.body);
      }
    }

    try {
      const response = await fetch(url, requestConfig);
      const duration = performance.now() - startTime;

      if (process.env.NODE_ENV === 'development') {
        console.log('=== Unified API Response ===');
        console.log('Status:', response.status);
        console.log('Duration:', `${duration.toFixed(2)}ms`);
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        let errorDetails = null;

        try {
          const errorBody = await response.text();
          if (errorBody) {
            try {
              errorDetails = JSON.parse(errorBody);
              errorMessage = errorDetails.error?.message || errorDetails.message || errorMessage;
            } catch {
              errorMessage = errorBody.length > 0 ? errorBody : errorMessage;
            }
          }
        } catch {
          // エラーボディの読み取りに失敗した場合はデフォルトメッセージを使用
        }

        const error = new Error(errorMessage);
        
        if (process.env.NODE_ENV === 'development') {
          console.error('=== Unified API Error ===');
          console.error('Status:', response.status, response.statusText);
          console.error('URL:', url);
          console.error('Error Body:', errorDetails || errorMessage);
        }

        throw error;
      }

      const data: UnifiedApiResponse<T> = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('Response Data:', data);
      }

      if (!data.success) {
        const error = new Error(data.error?.message || 'API request failed');
        throw error;
      }

      return data.data as T;
    } catch (error) {
      throw error;
    }
  }

  // ===== STUDY PLANS API =====

  /**
   * 学習計画を取得
   */
  async getStudyPlan(userId: number): Promise<UnifiedStudyPlan> {
    return this.request<UnifiedStudyPlan>(`/api/study-plans/${userId}`);
  }

  /**
   * 学習計画を作成
   */
  async createStudyPlan(userId: number, planData: {
    name: string;
    description?: string;
    targetExamDate?: string;
    weeklyHours?: number;
    studyDaysPerWeek?: number;
  }): Promise<UnifiedStudyPlan> {
    return this.request<UnifiedStudyPlan>(`/api/study-plans/${userId}`, {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  }

  /**
   * 学習日を更新
   */
  async updateStudyDay(userId: number, dayId: number, updateData: {
    actualTime?: number;
    actualHours?: number;
    isCompleted?: boolean;
    understanding?: number;
    notes?: string;
  }): Promise<any> {
    return this.request(`/api/study-plans/${userId}/days/${dayId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // ===== TEST SESSIONS API =====

  /**
   * テストセッション一覧を取得
   */
  async getTestSessions(userId: number, limit = 10, offset = 0): Promise<UnifiedTestSession[]> {
    return this.request<UnifiedTestSession[]>(`/api/test-sessions/${userId}?limit=${limit}&offset=${offset}`);
  }

  /**
   * テストセッションを作成
   */
  async createTestSession(userId: number, sessionData: {
    sessionType: 'morning' | 'afternoon' | 'quiz';
    category: string;
    totalQuestions?: number;
    correctAnswers?: number;
    timeSpentMinutes?: number;
    score?: number;
    isCompleted?: boolean;
    startedAt?: Date;
    completedAt?: Date;
    notes?: string;
  }): Promise<UnifiedTestSession> {
    return this.request<UnifiedTestSession>(`/api/test-sessions/${userId}`, {
      method: 'POST',
      body: JSON.stringify(sessionData),
    });
  }

  // ===== USER ANALYSIS API =====

  /**
   * 分析結果一覧を取得
   */
  async getUserAnalysis(userId: number, analysisType?: string): Promise<UnifiedUserAnalysis[]> {
    const url = analysisType 
      ? `/api/user-analysis/${userId}?type=${analysisType}`
      : `/api/user-analysis/${userId}`;
    return this.request<UnifiedUserAnalysis[]>(url);
  }

  /**
   * 新規分析を作成
   */
  async createUserAnalysis(userId: number, analysisData: {
    analysisType: 'learning_efficiency' | 'prediction';
    overallScore?: number;
    passProbability?: number;
    weakAreasRating?: number;
    strongSubjects?: string;
    weakSubjects?: string;
    recommendations?: string;
    targetExamDate?: string;
    estimatedReadiness?: string;
    studyTimeRequired?: any;
  }): Promise<UnifiedUserAnalysis> {
    return this.request<UnifiedUserAnalysis>(`/api/user-analysis/${userId}`, {
      method: 'POST',
      body: JSON.stringify(analysisData),
    });
  }

  // ===== REVIEW ENTRIES API =====

  /**
   * 復習項目一覧を取得
   */
  async getReviewEntries(userId: number, activeOnly = true): Promise<UnifiedReviewEntry[]> {
    const url = activeOnly 
      ? `/api/review-entries/${userId}?active=true`
      : `/api/review-entries/${userId}`;
    return this.request<UnifiedReviewEntry[]>(url);
  }

  /**
   * 今日の復習項目を取得
   */
  async getTodayReviews(userId: number): Promise<UnifiedReviewEntry[]> {
    return this.request<UnifiedReviewEntry[]>(`/api/review-entries/${userId}/today`);
  }

  /**
   * 復習を完了
   */
  async completeReview(userId: number, entryId: number, understanding: number): Promise<UnifiedReviewEntry> {
    return this.request<UnifiedReviewEntry>(`/api/review-entries/${userId}/${entryId}`, {
      method: 'PUT',
      body: JSON.stringify({ understanding }),
    });
  }

  // ===== LEGACY API互換性メソッド =====

  /**
   * 既存のgetStudyPlan()との互換性を保つ
   */
  async getStudyPlanLegacy(userId?: string): Promise<any[]> {
    try {
      if (!userId) {
        // userIdが指定されない場合は、デフォルトユーザー(1)を使用
        const studyPlan = await this.getStudyPlan(1);
        return studyPlan.weeks || [];
      }
      
      const studyPlan = await this.getStudyPlan(parseInt(userId));
      return studyPlan.weeks || [];
    } catch (error) {
      console.warn('統一API fallback: 既存APIへフォールバック', error);
      return [];
    }
  }

  /**
   * 既存のgetMorningTests()との互換性を保つ
   */
  async getMorningTestsLegacy(): Promise<any[]> {
    try {
      const sessions = await this.getTestSessions(1, 50, 0);
      return sessions.filter(session => session.type === 'morning');
    } catch (error) {
      console.warn('統一API fallback: 既存APIへフォールバック', error);
      return [];
    }
  }

  /**
   * 既存のgetAfternoonTests()との互換性を保つ
   */
  async getAfternoonTestsLegacy(): Promise<any[]> {
    try {
      const sessions = await this.getTestSessions(1, 50, 0);
      return sessions.filter(session => session.type === 'afternoon');
    } catch (error) {
      console.warn('統一API fallback: 既存APIへフォールバック', error);
      return [];
    }
  }

  /**
   * 既存のgetLatestAnalysis()との互換性を保つ
   */
  async getLatestAnalysisLegacy(userId?: string): Promise<any> {
    try {
      const userIdNum = userId ? parseInt(userId) : 1;
      const analyses = await this.getUserAnalysis(userIdNum);
      return analyses[0] || null;
    } catch (error) {
      console.warn('統一API fallback: 既存APIへフォールバック', error);
      return null;
    }
  }

  /**
   * 既存のgetTodayReviews()との互換性を保つ
   */
  async getTodayReviewsLegacy(): Promise<any[]> {
    try {
      return await this.getTodayReviews(1);
    } catch (error) {
      console.warn('統一API fallback: 既存APIへフォールバック', error);
      return [];
    }
  }
}

export const unifiedApiClient = new UnifiedApiClient();

// レガシーAPI互換性のためのエクスポート
export const legacyCompatApiClient = {
  getStudyPlan: (userId?: string) => unifiedApiClient.getStudyPlanLegacy(userId),
  getMorningTests: () => unifiedApiClient.getMorningTestsLegacy(),
  getAfternoonTests: () => unifiedApiClient.getAfternoonTestsLegacy(),
  getLatestAnalysis: (userId?: string) => unifiedApiClient.getLatestAnalysisLegacy(userId),
  getTodayReviews: () => unifiedApiClient.getTodayReviewsLegacy(),
  
  // 新しい統一API経由の更新メソッド
  updateStudyProgress: async (_weekNumber: number, _dayIndex: number, _data: any) => {
    // 学習日IDの取得とマッピングが必要（実装の詳細は既存コードに依存）
    console.warn('updateStudyProgress: 統一APIへの移行が必要');
    return;
  },
  
  createMorningTest: async (test: any) => {
    return unifiedApiClient.createTestSession(1, {
      sessionType: 'morning',
      category: test.category,
      totalQuestions: test.totalQuestions,
      correctAnswers: test.correctAnswers,
      timeSpentMinutes: Math.round(test.timeSpent / 60),
      notes: test.memo || undefined,
      startedAt: new Date(test.date),
      isCompleted: true,
    });
  },
  
  createAfternoonTest: async (test: any) => {
    return unifiedApiClient.createTestSession(1, {
      sessionType: 'afternoon',
      category: test.category,
      score: test.score,
      timeSpentMinutes: Math.round(test.timeSpent / 60),
      notes: test.memo || undefined,
      startedAt: new Date(test.date),
      isCompleted: true,
    });
  },
};