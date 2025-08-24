import { BaseClient } from './BaseClient';

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

export interface StudyPlan {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isActive: boolean;
  startDate: string;
  targetExamDate?: string;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
  templateName?: string;
  studyWeeksData?: unknown;
  settings: Record<string, unknown>;
  weeks?: unknown[];
}

export interface StudyPlanProgress {
  planId: number;
  totalDays: number;
  completedDays: number;
  totalHours: number;
  completedHours: number;
  averageScore: number;
  streakDays: number;
  lastStudyDate?: string;
  upcomingMilestones: StudyMilestone[];
}

export interface StudyMilestone {
  id: number;
  title: string;
  targetDate: string;
  isCompleted: boolean;
  completedDate?: string;
  description?: string;
}

export interface CreateStudyPlanRequest {
  name: string;
  description?: string;
  templateId?: string;
  templateName?: string;
  studyWeeksData?: unknown[];
  targetExamDate?: string;
  startDate?: string;
  settings?: Record<string, unknown>;
}

export interface UpdateStudyPlanRequest {
  name?: string;
  description?: string;
  totalWeeks?: number;
  weeklyHours?: number;
  dailyHours?: number;
  targetExamDate?: string;
  isActive?: boolean;
  settings?: Record<string, unknown>;
}

export interface StudyRecommendation {
  id: number;
  userId: number;
  type: 'topic_focus' | 'time_adjustment' | 'difficulty_change' | 'review_schedule';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  actionable: boolean;
  estimatedImpact: string;
  createdAt: string;
}

export class StudyClient extends BaseClient {
  // 学習計画関連
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

  async updateTaskProgress(weekNumber: number, dayIndex: number, understanding: number): Promise<void> {
    await this.request('/api/study/update-progress', {
      method: 'POST',
      body: JSON.stringify({ weekNumber, dayIndex, understanding }),
    });
  }

  // 学習記録関連
  async createStudyLog(log: Omit<StudyLog, 'id' | 'efficiency'>): Promise<StudyLog> {
    return this.request<StudyLog>('/api/study/logs', {
      method: 'POST',
      body: JSON.stringify(log),
    });
  }

  async getStudyLogs(): Promise<StudyLog[]> {
    return this.request<StudyLog[]>('/api/study/logs');
  }

  async updateStudyLog(id: number, log: Partial<StudyLog>): Promise<StudyLog> {
    return this.request<StudyLog>(`/api/study/logs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(log),
    });
  }

  async deleteStudyLog(id: number): Promise<void> {
    await this.request(`/api/study/logs/${id}`, {
      method: 'DELETE',
    });
  }

  // 学習計画管理
  async getAllStudyPlans(userId?: number): Promise<StudyPlan[]> {
    const url = userId ? `/api/study-plans?userId=${userId}` : '/api/study-plans';
    return this.request<StudyPlan[]>(url);
  }

  async getStudyPlanById(planId: number): Promise<StudyPlan> {
    return this.request<StudyPlan>(`/api/study-plans/${planId}`);
  }

  async createStudyPlan(plan: CreateStudyPlanRequest): Promise<StudyPlan> {
    return this.request<StudyPlan>('/api/study-plans', {
      method: 'POST',
      body: JSON.stringify(plan),
    });
  }

  async updateStudyPlan(planId: number, updates: UpdateStudyPlanRequest): Promise<StudyPlan> {
    return this.request<StudyPlan>(`/api/study-plans/${planId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteStudyPlan(planId: number): Promise<void> {
    await this.request(`/api/study-plans/${planId}`, {
      method: 'DELETE',
    });
  }

  // 進捗関連
  async getStudyProgress(userId?: number): Promise<StudyPlanProgress> {
    const url = userId ? `/api/study/progress?userId=${userId}` : '/api/study/progress';
    return this.request<StudyPlanProgress>(url);
  }

  async getStudyStatistics(userId?: number): Promise<{
    totalHours: number;
    completedTasks: number;
    averageUnderstanding: number;
    streak: number;
    weeklyProgress: { week: number; progress: number }[];
  }> {
    const url = userId ? `/api/study/statistics?userId=${userId}` : '/api/study/statistics';
    return this.request(url);
  }

  // 学習推奨関連
  async getStudyRecommendations(userId?: number): Promise<StudyRecommendation[]> {
    const url = userId ? `/api/study/recommendations?userId=${userId}` : '/api/study/recommendations';
    return this.request<StudyRecommendation[]>(url);
  }

  async markRecommendationAsRead(recommendationId: number): Promise<void> {
    await this.request(`/api/study/recommendations/${recommendationId}/read`, {
      method: 'POST',
    });
  }

  // 学習効率分析
  async getStudyEfficiency(userId?: number): Promise<{
    overallEfficiency: number;
    subjectEfficiency: { subject: string; efficiency: number }[];
    timeOfDayEfficiency: { hour: number; efficiency: number }[];
    studyPatterns: { pattern: string; frequency: number }[];
  }> {
    const url = userId ? `/api/study/efficiency?userId=${userId}` : '/api/study/efficiency';
    return this.request(url);
  }

  // トピック提案
  async getTopicSuggestions(options: { 
    subject?: string; 
    difficulty?: string; 
    count?: number 
  }): Promise<{ suggestions: string[] }> {
    const params = new URLSearchParams();
    if (options.subject) params.append('subject', options.subject);
    if (options.difficulty) params.append('difficulty', options.difficulty);
    if (options.count) params.append('count', options.count.toString());
    
    return this.request<{ suggestions: string[] }>(`/api/study/topic-suggestions?${params.toString()}`);
  }
}

// シングルトンインスタンス
export const studyClient = new StudyClient();