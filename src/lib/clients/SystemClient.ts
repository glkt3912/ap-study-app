import { BaseClient } from './BaseClient';

export interface SystemInfo {
  version: string;
  environment: string;
  uptime: number;
  memoryUsage: number;
  cpuUsage: number;
  databaseConnections: number;
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

export interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    ml: 'up' | 'down';
  };
  metrics: {
    responseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export interface StudyPlanTemplate {
  id: number;
  name: string;
  description: string;
  defaultPeriodDays: number;
  defaultWeeklyHours: number;
  targetAudience: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  features: string[];
  isPopular: boolean;
}

export interface StudyPlanPreferences {
  planId: number;
  reminderEnabled: boolean;
  reminderTime?: string;
  weekendStudy: boolean;
  intensiveMode: boolean;
  adaptiveDifficulty: boolean;
  notificationPreferences: {
    email: boolean;
    push: boolean;
    daily: boolean;
    weekly: boolean;
  };
}

export class SystemClient extends BaseClient {
  // システム状態・監視
  async getSystemInfo(): Promise<SystemInfo> {
    return this.request<SystemInfo>('/api/system/info');
  }

  async getHealthCheck(): Promise<HealthCheck> {
    return this.request<HealthCheck>('/api/health');
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    return this.request<SystemMetrics>('/api/system/metrics');
  }

  // 設定管理
  async getExamConfig(userId?: number | string): Promise<ExamConfig | null> {
    const url = userId ? `/api/exam-config?userId=${userId}` : '/api/exam-config';
    try {
      return await this.request<ExamConfig>(url);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  async createExamConfig(config: CreateExamConfigRequest): Promise<ExamConfig> {
    return this.request<ExamConfig>('/api/exam-config', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateExamConfig(configId: number, updates: UpdateExamConfigRequest): Promise<ExamConfig> {
    return this.request<ExamConfig>(`/api/exam-config/${configId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteExamConfig(configId: number): Promise<void> {
    await this.request(`/api/exam-config/${configId}`, {
      method: 'DELETE',
    });
  }

  // 学習計画テンプレート
  async getStudyPlanTemplates(): Promise<StudyPlanTemplate[]> {
    return this.request<StudyPlanTemplate[]>('/api/study-plan-templates');
  }

  async getStudyPlanTemplate(templateId: number): Promise<StudyPlanTemplate> {
    return this.request<StudyPlanTemplate>(`/api/study-plan-templates/${templateId}`);
  }

  // 学習設定・環境設定
  async getStudyPlanPreferences(planId: number): Promise<StudyPlanPreferences> {
    return this.request<StudyPlanPreferences>(`/api/study-plans/${planId}/preferences`);
  }

  async updateStudyPlanPreferences(
    planId: number,
    preferences: Partial<StudyPlanPreferences>
  ): Promise<StudyPlanPreferences> {
    return this.request<StudyPlanPreferences>(`/api/study-plans/${planId}/preferences`, {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  }

  // データエクスポート・インポート
  async exportUserData(
    userId: number,
    format: 'json' | 'csv' = 'json'
  ): Promise<{
    data: unknown;
    filename: string;
    size: number;
  }> {
    return this.request(`/api/users/${userId}/export?format=${format}`);
  }

  async importUserData(
    userId: number,
    data: File
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const formData = new FormData();
    formData.append('data', data);

    return this.request(`/api/users/${userId}/import`, {
      method: 'POST',
      body: formData,
      headers: {
        // Content-Typeを削除してブラウザに自動設定させる
        ...this.getAuthHeaders(),
        'Content-Type': undefined as unknown as string,
      },
    });
  }

  // システム管理（管理者用）
  async getSystemLogs(
    level?: 'error' | 'warn' | 'info' | 'debug',
    limit?: number
  ): Promise<{
    logs: Array<{
      timestamp: string;
      level: string;
      message: string;
      meta?: unknown;
    }>;
    total: number;
  }> {
    const params = new URLSearchParams();
    if (level) params.append('level', level);
    if (limit) params.append('limit', limit.toString());

    const url = `/api/system/logs${params.toString() ? `?${params.toString()}` : ''}`;
    return this.request(url);
  }

  async clearSystemLogs(olderThan?: string): Promise<{ deleted: number }> {
    const options: RequestInit = {
      method: 'DELETE',
    };
    
    if (olderThan) {
      options.body = JSON.stringify({ olderThan });
    }
    
    return this.request('/api/system/logs/clear', options);
  }

  // パフォーマンス監視
  async getPerformanceMetrics(timeRange?: '1h' | '24h' | '7d' | '30d'): Promise<{
    apiResponseTimes: Array<{ timestamp: string; averageTime: number }>;
    requestCounts: Array<{ timestamp: string; count: number }>;
    errorRates: Array<{ timestamp: string; rate: number }>;
    userActivities: Array<{ timestamp: string; activeUsers: number }>;
  }> {
    const url = timeRange ? `/api/system/performance?range=${timeRange}` : '/api/system/performance';
    return this.request(url);
  }

  // キャッシュ管理
  async clearAllCaches(): Promise<{ cleared: string[] }> {
    return this.request('/api/system/cache/clear', {
      method: 'DELETE',
    });
  }

  async getCacheStatistics(): Promise<{
    keys: number;
    memory: number;
    hitRate: number;
    missRate: number;
  }> {
    return this.request('/api/system/cache/stats');
  }

  // データベース管理
  async getDatabaseStatus(): Promise<{
    connected: boolean;
    version: string;
    connectionCount: number;
    queryStats: {
      total: number;
      averageTime: number;
      slowQueries: number;
    };
  }> {
    return this.request('/api/system/database/status');
  }

  async optimizeDatabase(): Promise<{ optimized: string[]; duration: number }> {
    return this.request('/api/system/database/optimize', {
      method: 'POST',
    });
  }
}

// シングルトンインスタンス
export const systemClient = new SystemClient();
