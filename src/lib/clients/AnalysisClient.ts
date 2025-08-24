import { BaseClient } from './BaseClient';

export interface PredictiveAnalysis {
  examPassProbability: number;
  recommendedStudyHours: number;
  timeToReadiness: number;
  riskFactors: string[];
  successFactors: string[];
  confidenceLevel: number;
  lastUpdated: string;
}

export interface PersonalizedRecommendations {
  studyPlan?: {
    adjustments: string[];
    focusAreas: string[];
    timeAllocation: { subject: string; hours: number }[];
  };
  // 新しい構造をサポート: dailyStudyPlan
  dailyStudyPlan?: {
    date: string;
    subjects: string[];
    estimatedTime: number;
    priority: 'high' | 'medium' | 'low';
    objectives: string[];
    adaptiveAdjustments?: {
      basedOnPerformance: boolean;
      basedOnTimeConstraints: boolean;
      basedOnMotivation: boolean;
    };
  }[];
  prioritySubjects?: string[];
  reviewSchedule?: any[];
  motivationalInsights?: string[];
  learningPathOptimization?: {
    currentPath: string;
    optimizedPath: string;
    expectedImprovement: number;
  };
  practiceStrategy?: {
    recommendedQuestionTypes: string[];
    weaknessesToAddress: string[];
    strengthsToMaintain: string[];
  };
  examStrategy?: {
    timeManagement: string[];
    answerTechniques: string[];
    mentalPreparation: string[];
  };
  priority?: 'high' | 'medium' | 'low';
  validUntil?: string;
}

export interface MLAnalysisResult {
  category: string;
  prediction: {
    passProbability: number;
    recommendedStudyTime: number;
    difficultyAdjustment: string;
  };
  insights: {
    learningPattern: string;
    effectiveStudyMethods: string[];
    improvementAreas: string[];
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
    resources: string[];
  };
}

export interface BatchDashboardMLData {
  predictiveAnalysis: PredictiveAnalysis;
  personalizedRecommendations: PersonalizedRecommendations;
  mlAnalysisResults: MLAnalysisResult[];
  studyPatternAnalysis: StudyPatternML;
  performanceMetrics: {
    currentStreak: number;
    weeklyGoalProgress: number;
    overallProgress: number;
    efficiency: number;
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

export interface LearningTrend {
  date: string;
  daily_questions: number;
  avg_score: number;
  study_time: number;
  category: string;
  week: number;
}

export interface PerformanceInsight {
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  category: string;
  title: string;
  description: string;
  actionable: boolean;
  priority: 'high' | 'medium' | 'low';
  metrics: {
    current: number;
    target: number;
    trend: 'improving' | 'stable' | 'declining';
  };
}

export class AnalysisClient extends BaseClient {
  // AI予測分析
  async getPredictiveAnalysis(userId: number): Promise<PredictiveAnalysis> {
    return this.request<PredictiveAnalysis>(`/api/analysis/predictive/${userId}`);
  }

  async updatePredictiveAnalysis(userId: number): Promise<PredictiveAnalysis> {
    return this.request<PredictiveAnalysis>(`/api/analysis/predictive/${userId}/update`, {
      method: 'POST',
    });
  }

  // パーソナライズされた推奨事項
  async getPersonalizedRecommendations(userId: number): Promise<PersonalizedRecommendations> {
    return this.request<PersonalizedRecommendations>(`/api/analysis/recommendations/${userId}`);
  }

  async generatePersonalizedRecommendations(userId: number): Promise<PersonalizedRecommendations> {
    return this.request<PersonalizedRecommendations>(`/api/analysis/recommendations/${userId}/generate`, {
      method: 'POST',
    });
  }

  // バッチML分析
  async getBatchDashboardMLData(userId: number): Promise<BatchDashboardMLData> {
    return this.request<BatchDashboardMLData>(`/api/analysis/batch-dashboard/${userId}`);
  }

  async refreshBatchDashboardMLData(userId: number): Promise<BatchDashboardMLData> {
    return this.request<BatchDashboardMLData>(`/api/analysis/batch-dashboard/${userId}/refresh`, {
      method: 'POST',
    });
  }

  // ML分析結果
  async getMLAnalysisResults(userId: number): Promise<MLAnalysisResult[]> {
    return this.request<MLAnalysisResult[]>(`/api/analysis/ml-results/${userId}`);
  }

  async generateMLAnalysis(userId: number, categories?: string[]): Promise<MLAnalysisResult[]> {
    return this.request<MLAnalysisResult[]>(`/api/analysis/ml-results/${userId}/generate`, {
      method: 'POST',
      body: JSON.stringify({ categories }),
    });
  }

  // 学習パターン分析
  async getStudyPatternAnalysis(userId: number): Promise<StudyPatternML> {
    return this.request<StudyPatternML>(`/api/analysis/study-patterns/${userId}`);
  }

  // 学習トレンド
  async getLearningTrends(userId: number, days?: number): Promise<LearningTrend[]> {
    const url = days 
      ? `/api/analysis/learning-trends/${userId}?days=${days}`
      : `/api/analysis/learning-trends/${userId}`;
    return this.request<LearningTrend[]>(url);
  }

  // パフォーマンス洞察
  async getPerformanceInsights(userId: number): Promise<PerformanceInsight[]> {
    return this.request<PerformanceInsight[]>(`/api/analysis/performance-insights/${userId}`);
  }

  async generatePerformanceInsights(userId: number): Promise<PerformanceInsight[]> {
    return this.request<PerformanceInsight[]>(`/api/analysis/performance-insights/${userId}/generate`, {
      method: 'POST',
    });
  }

  // 比較分析
  async getComparisonAnalysis(userId: number, compareWith?: 'average' | 'top10' | 'similar'): Promise<{
    userMetrics: Record<string, number>;
    comparisonMetrics: Record<string, number>;
    percentileRanking: Record<string, number>;
    insights: string[];
  }> {
    const url = compareWith 
      ? `/api/analysis/comparison/${userId}?compareWith=${compareWith}`
      : `/api/analysis/comparison/${userId}`;
    return this.request(url);
  }

  // 予測モデル詳細
  async getModelMetadata(): Promise<{
    version: string;
    accuracy: number;
    lastTrained: string;
    features: string[];
    performance: Record<string, number>;
  }> {
    return this.request('/api/analysis/model/metadata');
  }

  async validatePrediction(userId: number, predictionId: string, actualOutcome: boolean): Promise<void> {
    await this.request(`/api/analysis/predictions/${predictionId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ userId, actualOutcome }),
    });
  }

  // キャッシュ管理
  async clearAnalysisCache(userId: number): Promise<void> {
    await this.request(`/api/analysis/cache/${userId}`, {
      method: 'DELETE',
    });
  }

  async getAnalysisCacheStatus(userId: number): Promise<{
    predictiveAnalysis: 'fresh' | 'stale' | 'expired';
    recommendations: 'fresh' | 'stale' | 'expired';
    mlResults: 'fresh' | 'stale' | 'expired';
    lastUpdated: string;
  }> {
    return this.request(`/api/analysis/cache/${userId}/status`);
  }
}

// シングルトンインスタンス
export const analysisClient = new AnalysisClient();