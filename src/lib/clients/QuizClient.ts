import { BaseClient } from './BaseClient';

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
  sessionId?: number;
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
  questions?: Question[];
}

export interface StartQuizSessionRequest {
  sessionType: 'category' | 'random' | 'review' | 'weak_points';
  questionCount: number;
  category?: string;
}

export interface StartQuizSessionResponse {
  sessionId: number;
  questions: Question[];
}

export interface SubmitAnswerRequest {
  sessionId: number;
  questionId: string;
  userAnswer: string;
  timeSpent?: number;
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

export interface QuizStats {
  totalSessions: number;
  averageScore: number;
  categoryStats: {
    category: string;
    sessionCount: number;
    averageScore: number;
  }[];
}

export interface WeakPoint {
  category: string;
  accuracy_rate: number;
  total_answers: number;
}

export class QuizClient extends BaseClient {
  // クイズセッション関連
  async startQuizSession(request: StartQuizSessionRequest): Promise<StartQuizSessionResponse> {
    return this.request<StartQuizSessionResponse>('/api/quiz/start', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async submitQuizAnswer(answer: SubmitAnswerRequest): Promise<void> {
    await this.request('/api/quiz/answer', {
      method: 'POST',
      body: JSON.stringify(answer),
    });
  }

  async completeQuizSession(sessionId: number): Promise<QuizSession> {
    return this.request<QuizSession>(`/api/quiz/complete/${sessionId}`, {
      method: 'POST',
    });
  }

  async getQuizSession(sessionId: number): Promise<QuizSession> {
    return this.request<QuizSession>(`/api/quiz/sessions/${sessionId}`);
  }

  // クイズ履歴・統計
  async getQuizSessions(userId?: number): Promise<QuizSession[]> {
    const url = userId ? `/api/quiz/sessions?userId=${userId}` : '/api/quiz/sessions';
    return this.request<QuizSession[]>(url);
  }

  async getQuizStats(userId?: number): Promise<QuizStats> {
    const url = userId ? `/api/quiz/stats?userId=${userId}` : '/api/quiz/stats';
    return this.request<QuizStats>(url);
  }

  async getWeakPoints(userId?: number): Promise<WeakPoint[]> {
    const url = userId ? `/api/quiz/weak-points?userId=${userId}` : '/api/quiz/weak-points';
    return this.request<WeakPoint[]>(url);
  }

  // 問題関連
  async getQuestions(category?: string, difficulty?: number, limit?: number): Promise<Question[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty.toString());
    if (limit) params.append('limit', limit.toString());
    
    const url = `/api/questions${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Question[]>(url);
  }

  async getQuestion(questionId: string): Promise<Question> {
    return this.request<Question>(`/api/questions/${questionId}`);
  }

  async getCategories(): Promise<string[]> {
    return this.request<string[]>('/api/questions/categories');
  }

  async getQuestionsByCategory(category: string, limit?: number): Promise<Question[]> {
    const url = limit ? `/api/questions/category/${category}?limit=${limit}` : `/api/questions/category/${category}`;
    return this.request<Question[]>(url);
  }

  // 模試記録関連
  async createMorningTest(test: Omit<MorningTest, 'id' | 'accuracy'>): Promise<MorningTest> {
    return this.request<MorningTest>('/api/tests/morning', {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async createAfternoonTest(test: Omit<AfternoonTest, 'id'>): Promise<AfternoonTest> {
    return this.request<AfternoonTest>('/api/tests/afternoon', {
      method: 'POST',
      body: JSON.stringify(test),
    });
  }

  async getMorningTests(): Promise<MorningTest[]> {
    return this.request<MorningTest[]>('/api/tests/morning');
  }

  async getAfternoonTests(): Promise<AfternoonTest[]> {
    return this.request<AfternoonTest[]>('/api/tests/afternoon');
  }

  async updateMorningTest(id: number, updates: Partial<MorningTest>): Promise<MorningTest> {
    return this.request<MorningTest>(`/api/tests/morning/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateAfternoonTest(id: number, updates: Partial<AfternoonTest>): Promise<AfternoonTest> {
    return this.request<AfternoonTest>(`/api/tests/afternoon/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteMorningTest(id: number): Promise<void> {
    await this.request(`/api/tests/morning/${id}`, {
      method: 'DELETE',
    });
  }

  async deleteAfternoonTest(id: number): Promise<void> {
    await this.request(`/api/tests/afternoon/${id}`, {
      method: 'DELETE',
    });
  }

  // 統計・分析
  async getMorningTestStats(): Promise<TestStats> {
    return this.request<TestStats>('/api/tests/morning/stats');
  }

  async getAfternoonTestStats(): Promise<TestStats> {
    return this.request<TestStats>('/api/tests/afternoon/stats');
  }

  // 復習支援
  async getReviewQuestions(userId?: number, limit?: number): Promise<Question[]> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId.toString());
    if (limit) params.append('limit', limit.toString());
    
    const url = `/api/quiz/review${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request<Question[]>(url);
  }

  async markQuestionForReview(questionId: string, needsReview: boolean): Promise<void> {
    await this.request(`/api/quiz/questions/${questionId}/review`, {
      method: 'POST',
      body: JSON.stringify({ needsReview }),
    });
  }
}

// シングルトンインスタンス
export const quizClient = new QuizClient();