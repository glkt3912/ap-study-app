'use client';

import { useState, useEffect } from 'react';
import { StudyRecommendation } from '../types/api';

interface StudyRecommendationsProps {
  userId: number;
  planId?: number;
  compact?: boolean;
  limit?: number;
}

export default function StudyRecommendations({ 
  userId, 
  planId, 
  compact = false, 
  limit 
}: StudyRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, [userId, planId]); // loadRecommendations is stable

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock API call - replace with actual API call
      // const url = planId 
      //   ? `/api/study-plan/${planId}/recommendations`
      //   : `/api/study-plan/${userId}/recommendations`;
      // const response = await fetch(url);
      // const result = await response.json();
      
      // Mock recommendations data for demonstration
      const mockRecommendations: StudyRecommendation[] = [
        {
          id: 1,
          userId,
          type: 'topic_focus',
          title: 'データベース分野の強化を推奨',
          description: 'データベース関連の問題の正答率が60%と低めです。基礎的なSQL文やデータベース設計について重点的に学習することをお勧めします。',
          priority: 'high',
          actionable: true,
          estimatedImpact: '正答率を15-20%向上させる見込み',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 2,
          userId,
          type: 'time_adjustment',
          title: '学習時間の調整を検討',
          description: '現在の学習ペースでは目標達成が困難な可能性があります。1日の学習時間を30分増やすか、より効率的な学習方法を検討してください。',
          priority: 'medium',
          actionable: true,
          estimatedImpact: '計画達成率を25%向上',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          userId,
          type: 'difficulty_change',
          title: '問題難易度の調整',
          description: '基礎問題での正答率が高いため、より発展的な問題に挑戦することで実力向上が期待できます。',
          priority: 'low',
          actionable: true,
          estimatedImpact: '総合理解度を10-15%向上',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 4,
          userId,
          type: 'review_schedule',
          title: '復習スケジュールの最適化',
          description: '間違えた問題の復習間隔を調整することで、長期記憶の定着を図ることができます。',
          priority: 'medium',
          actionable: true,
          estimatedImpact: '記憶定着率を20%向上',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      let filteredRecommendations = mockRecommendations;
      if (limit) {
        filteredRecommendations = mockRecommendations.slice(0, limit);
      }

      setRecommendations(filteredRecommendations);
    } catch (err) {
      setError('推奨事項の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 dark:border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'border-blue-200 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default:
        return 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '重要';
      case 'medium':
        return '中程度';
      case 'low':
        return '低';
      default:
        return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'topic_focus':
        return '📚';
      case 'time_adjustment':
        return '⏰';
      case 'difficulty_change':
        return '🎯';
      case 'review_schedule':
        return '🔄';
      default:
        return '💡';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'topic_focus':
        return '学習分野';
      case 'time_adjustment':
        return '時間調整';
      case 'difficulty_change':
        return '難易度調整';
      case 'review_schedule':
        return '復習スケジュール';
      default:
        return '一般';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays}日前`;
    } else if (diffHours > 0) {
      return `${diffHours}時間前`;
    } else {
      return '1時間以内';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-sm">読み込み中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500 rounded-lg">
        <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
        <button
          onClick={loadRecommendations}
          className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
        >
          再試行
        </button>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="p-4 text-gray-500 dark:text-gray-400 text-sm text-center">
        現在、推奨事項はありません
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`p-3 rounded-lg border ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <span className="text-lg">{getTypeIcon(recommendation.type)}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {recommendation.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                    {recommendation.description}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs rounded ${
                recommendation.priority === 'high' 
                  ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                  : recommendation.priority === 'medium'
                  ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
              }`}>
                {getPriorityLabel(recommendation.priority)}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">学習推奨事項</h3>
        <button
          onClick={loadRecommendations}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          更新
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className={`p-6 rounded-lg border ${getPriorityColor(recommendation.priority)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getTypeIcon(recommendation.type)}</span>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {recommendation.title}
                  </h4>
                  <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <span>{getTypeLabel(recommendation.type)}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(recommendation.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1 text-sm rounded-full ${
                  recommendation.priority === 'high' 
                    ? 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                    : recommendation.priority === 'medium'
                    ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200'
                    : 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
                }`}>
                  {getPriorityLabel(recommendation.priority)}
                </span>
                {recommendation.actionable && (
                  <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200 rounded">
                    実行可能
                  </span>
                )}
              </div>
            </div>

            <p className="text-gray-700 dark:text-gray-300 mb-4">
              {recommendation.description}
            </p>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">予想される効果:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                    {recommendation.estimatedImpact}
                  </span>
                </div>
                {recommendation.actionable && (
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    詳細を見る
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border dark:border-gray-600">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <div className="flex justify-between items-center">
            <span>推奨事項: {recommendations.length}件</span>
            <span>
              実行可能: {recommendations.filter(r => r.actionable).length}件
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-red-600 dark:text-red-400">
              重要: {recommendations.filter(r => r.priority === 'high').length}件
            </span>
            <span className="text-yellow-600 dark:text-yellow-400">
              中程度: {recommendations.filter(r => r.priority === 'medium').length}件
            </span>
            <span className="text-blue-600 dark:text-blue-400">
              低: {recommendations.filter(r => r.priority === 'low').length}件
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}