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
}

export const apiClient = new ApiClient();
