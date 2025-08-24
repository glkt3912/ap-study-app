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
  // システム状態・監視 (未実装のため代替実装)
  async getSystemInfo(): Promise<SystemInfo> {
    // TODO: バックエンドに /api/system/info エンドポイント実装後に有効化
    console.warn('getSystemInfo: API not implemented, returning mock data');
    return {
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: Date.now(),
      memoryUsage: 0,
      cpuUsage: 0,
      databaseConnections: 1
    };
  }

  async getHealthCheck(): Promise<HealthCheck> {
    // monitoring APIのヘルスチェックを利用
    try {
      return await this.request<HealthCheck>('/api/monitoring/health');
    } catch (error) {
      console.warn('getHealthCheck: Failed to get health status', error);
      return {
        status: 'unknown' as any,
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: 0,
        services: { database: 'down', redis: 'down', ml: 'down' },
        metrics: { responseTime: 0, memoryUsage: 0, cpuUsage: 0 }
      };
    }
  }

  async getSystemMetrics(): Promise<SystemMetrics> {
    // TODO: バックエンドに /api/system/metrics エンドポイント実装後に有効化
    console.warn('getSystemMetrics: API not implemented, returning mock data');
    return {
      performance: { averageResponseTime: 0, requestCount: 0, errorRate: 0, successRate: 100 },
      usage: { activeUsers: 0, totalSessions: 0, avgSessionDuration: 0, peakConcurrentUsers: 0 },
      ml: { modelVersion: '1.0', predictionAccuracy: 0, recommendationClickRate: 0, analysisGenerationTime: 0 }
    };
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

  // 学習計画テンプレート (未実装のため代替実装)
  async getStudyPlanTemplates(): Promise<StudyPlanTemplate[]> {
    // TODO: バックエンドに /api/study-plan-templates エンドポイント実装後に有効化
    console.warn('getStudyPlanTemplates: API not implemented, returning empty array');
    return [];
  }

  async getStudyPlanTemplate(templateId: number): Promise<StudyPlanTemplate> {
    // TODO: バックエンドに /api/study-plan-templates エンドポイント実装後に有効化
    console.warn('getStudyPlanTemplate: API not implemented, returning mock data');
    return {
      id: templateId,
      name: 'Basic Study Plan',
      description: 'A basic study plan template',
      defaultPeriodDays: 90,
      defaultWeeklyHours: 20,
      targetAudience: 'beginners',
      difficulty: 'beginner',
      features: [],
      isPopular: false
    };
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
