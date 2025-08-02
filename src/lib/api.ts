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
  userId?: string;
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
  userId?: string;
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
  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "API request failed");
      }

      return data.data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // 学習計画API
  async getStudyPlan(): Promise<StudyWeek[]> {
    return this.request<StudyWeek[]>("/api/study/plan");
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
      headers: {
        "X-User-ID": "test-user", // TODO: 実際のユーザーID取得
      },
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
      headers: {
        "X-User-ID": "test-user", // TODO: 実際のユーザーID取得
      },
      body: JSON.stringify(options),
    });
  }

  async completeQuizSession(sessionId: number): Promise<QuizSession> {
    return this.request("/api/quiz/complete", {
      method: "POST",
      headers: {
        "X-User-ID": "test-user", // TODO: 実際のユーザーID取得
      },
      body: JSON.stringify({ sessionId }),
    });
  }

  async getQuizSessions(limit?: number): Promise<QuizSession[]> {
    const params = limit ? `?limit=${limit}` : "";
    return this.request<QuizSession[]>(`/api/quiz/sessions${params}`, {
      headers: {
        "X-User-ID": "test-user", // TODO: 実際のユーザーID取得
      },
    });
  }

  async getQuizStats(): Promise<QuizStats> {
    return this.request<QuizStats>("/api/quiz/stats", {
      headers: {
        "X-User-ID": "test-user", // TODO: 実際のユーザーID取得
      },
    });
  }
}

export const apiClient = new ApiClient();
