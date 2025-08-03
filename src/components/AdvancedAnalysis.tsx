"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { apiClient } from "../lib/api";

const PieChart = lazy(() => import('recharts').then(module => ({ default: module.PieChart })));
const Pie = lazy(() => import('recharts').then(module => ({ default: module.Pie })));
const Cell = lazy(() => import('recharts').then(module => ({ default: module.Cell })));
const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));
const Legend = lazy(() => import('recharts').then(module => ({ default: module.Legend })));

interface PerformanceMetrics {
  period: number;
  studyConsistency: {
    study_days: number;
    total_sessions: number;
    avg_session_duration: number;
    consistency_rate: number;
  };
  learningEfficiency: {
    avg_score: number;
    avg_time_per_question: number;
    total_questions_attempted: number;
    avg_total_time: number;
  };
  growthAnalysis: Array<{
    week_start: string;
    avg_score: number;
    sessions_count: number;
    prev_week_score: number;
    score_change: number;
  }>;
  categoryBalance: Array<{
    category: string;
    questions_attempted: number;
    accuracy_rate: number;
    proportion: number;
  }>;
}

interface ExamReadiness {
  examDate: string;
  daysToExam: number;
  targetScore: number;
  currentAbility: {
    current_avg_score: number;
    total_sessions: number;
    target_achievement_rate: number;
  };
  categoryReadiness: Array<{
    category: string;
    questions_attempted: number;
    accuracy_rate: number;
    readiness_level: "excellent" | "good" | "needs_improvement" | "critical";
  }>;
  overallReadiness: string;
  studyRecommendations: Array<{
    type: string;
    recommendation: string;
    priority: string;
  }>;
  passProbability: number;
}

interface LearningPattern {
  timePattern: Array<{
    study_hour: number;
    session_count: number;
    avg_score: number;
    avg_duration: number;
  }>;
  frequencyPattern: Array<{
    day_of_week: number;
    session_count: number;
    avg_score: number;
  }>;
  volumePerformanceCorrelation: Array<{
    daily_sessions: number;
    daily_questions: number;
    avg_score_for_volume: number;
    frequency: number;
  }>;
  recommendations: {
    optimalTimeSlot: string;
    optimalDayOfWeek: string;
    recommendedDailyQuestions: number;
  };
}

export function AdvancedAnalysis() {
  const [activeTab, setActiveTab] = useState<"performance" | "readiness" | "pattern">("performance");
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [examReadiness, setExamReadiness] = useState<ExamReadiness | null>(null);
  const [learningPattern, setLearningPattern] = useState<LearningPattern | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 試験日設定用
  const [examDate, setExamDate] = useState("");
  const [targetScore, setTargetScore] = useState(60);

  useEffect(() => {
    if (activeTab === "performance") {
      loadPerformanceMetrics();
    } else if (activeTab === "pattern") {
      loadLearningPattern();
    }
  }, [activeTab]);

  const loadPerformanceMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getPerformanceMetrics(30);
      setPerformanceMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "パフォーマンス指標の取得に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const loadExamReadiness = async () => {
    if (!examDate) {
      setError("試験日を設定してください");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.evaluateExamReadiness({
        examDate,
        targetScore,
      });
      setExamReadiness(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "試験準備度評価に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const loadLearningPattern = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient.getLearningPattern();
      setLearningPattern(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "学習パターン分析に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const getReadinessColor = (level: string) => {
    switch (level) {
      case "excellent": return "text-green-600 bg-green-100";
      case "good": return "text-blue-600 bg-blue-100";
      case "needs_improvement": return "text-yellow-600 bg-yellow-100";
      case "critical": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const dayNames = ["日", "月", "火", "水", "木", "金", "土"];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">高度な学習分析</h2>

      {/* タブナビゲーション */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
        {[
          { key: "performance", label: "パフォーマンス指標", shortLabel: "指標" },
          { key: "readiness", label: "試験準備度", shortLabel: "準備度" },
          { key: "pattern", label: "学習パターン", shortLabel: "パターン" }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-shrink-0 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      )}

      {/* パフォーマンス指標タブ */}
      {activeTab === "performance" && performanceMetrics && !loading && (
        <div className="space-y-6">
          {/* 学習継続性 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">学習継続性</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {performanceMetrics.studyConsistency.study_days}
                </div>
                <div className="text-sm text-gray-600">学習日数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(performanceMetrics.studyConsistency.consistency_rate)}%
                </div>
                <div className="text-sm text-gray-600">継続率</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.studyConsistency.total_sessions}
                </div>
                <div className="text-sm text-gray-600">総セッション数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(performanceMetrics.studyConsistency.avg_session_duration || 0)}分
                </div>
                <div className="text-sm text-gray-600">平均学習時間</div>
              </div>
            </div>
          </div>

          {/* 学習効率 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">学習効率</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(performanceMetrics.learningEfficiency.avg_score || 0)}点
                </div>
                <div className="text-sm text-gray-600">平均スコア</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(performanceMetrics.learningEfficiency.avg_time_per_question || 0)}秒
                </div>
                <div className="text-sm text-gray-600">問題あたり平均時間</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {performanceMetrics.learningEfficiency.total_questions_attempted || 0}
                </div>
                <div className="text-sm text-gray-600">総回答問題数</div>
              </div>
            </div>
          </div>

          {/* カテゴリバランス */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">カテゴリ別学習バランス</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* 円グラフ */}
              <div>
                <h4 className="font-medium mb-3">問題数の分布</h4>
                <Suspense fallback={<div className="h-48 flex items-center justify-center">グラフを読み込み中...</div>}>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={performanceMetrics.categoryBalance}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="questions_attempted"
                        label={({ category, proportion }) => `${category}: ${Math.round(proportion)}%`}
                        labelLine={false}
                      >
                        {performanceMetrics.categoryBalance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [`${value}問`, 'カテゴリ']} />
                    </PieChart>
                  </ResponsiveContainer>
                </Suspense>
              </div>

              {/* バー表示 */}
              <div className="space-y-2">
                {performanceMetrics.categoryBalance.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.category}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(category.proportion, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12">
                        {Math.round(category.proportion)}%
                      </span>
                      <span className="text-sm text-green-600 w-12">
                        {Math.round(category.accuracy_rate * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 成長分析グラフ */}
          {performanceMetrics.growthAnalysis.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-3">週次成長分析</h3>
              <Suspense fallback={<div className="h-64 flex items-center justify-center">グラフを読み込み中...</div>}>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceMetrics.growthAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="week_start" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => `週開始: ${new Date(value).toLocaleDateString('ja-JP')}`}
                      formatter={(value: any, name: any) => [
                        name === 'avg_score' ? `${Number(value).toFixed(1)}点` : 
                        name === 'score_change' ? `${Number(value) > 0 ? '+' : ''}${Number(value).toFixed(1)}点` :
                        `${value}回`,
                        name === 'avg_score' ? '平均スコア' : 
                        name === 'score_change' ? 'スコア変化' :
                        'セッション数'
                      ]}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="avg_score" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="avg_score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score_change" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="score_change"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Suspense>
            </div>
          )}
        </div>
      )}

      {/* 試験準備度タブ */}
      {activeTab === "readiness" && (
        <div className="space-y-6">
          {/* 試験設定 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">試験設定</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  試験日
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  目標点数
                </label>
                <input
                  type="number"
                  value={targetScore}
                  onChange={(e) => setTargetScore(parseInt(e.target.value))}
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={loadExamReadiness}
              disabled={!examDate || loading}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              準備度を評価
            </button>
          </div>

          {/* 試験準備度結果 */}
          {examReadiness && !loading && (
            <div className="space-y-4">
              {/* 総合評価 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">総合評価</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {examReadiness.daysToExam}日
                    </div>
                    <div className="text-sm text-gray-600">試験まで</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {Math.round(examReadiness.passProbability)}%
                    </div>
                    <div className="text-sm text-gray-600">合格予測</div>
                  </div>
                  <div className="text-center">
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      examReadiness.overallReadiness === "excellent" ? "bg-green-100 text-green-800" :
                      examReadiness.overallReadiness === "good" ? "bg-blue-100 text-blue-800" :
                      examReadiness.overallReadiness === "needs_improvement" ? "bg-yellow-100 text-yellow-800" :
                      "bg-red-100 text-red-800"
                    }`}>
                      {examReadiness.overallReadiness}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">総合準備度</div>
                  </div>
                </div>
              </div>

              {/* カテゴリ別準備度 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">カテゴリ別準備度</h3>
                <div className="space-y-2">
                  {examReadiness.categoryReadiness.map((category, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.category}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {Math.round(category.accuracy_rate * 100)}%
                        </span>
                        <span className={`px-2 py-1 rounded text-xs ${getReadinessColor(category.readiness_level)}`}>
                          {category.readiness_level}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 学習推奨 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-3">学習推奨</h3>
                <div className="space-y-2">
                  {examReadiness.studyRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                        rec.priority === "high" ? "bg-red-500" : "bg-yellow-500"
                      }`}></span>
                      <span className="text-sm">{rec.recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 学習パターンタブ */}
      {activeTab === "pattern" && learningPattern && !loading && (
        <div className="space-y-6">
          {/* 推奨学習条件 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">推奨学習条件</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">
                  {learningPattern.recommendations.optimalTimeSlot}
                </div>
                <div className="text-sm text-gray-600">最適学習時間帯</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {learningPattern.recommendations.optimalDayOfWeek}
                </div>
                <div className="text-sm text-gray-600">最適学習曜日</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-purple-600">
                  {learningPattern.recommendations.recommendedDailyQuestions}問
                </div>
                <div className="text-sm text-gray-600">推奨日次問題数</div>
              </div>
            </div>
          </div>

          {/* 時間帯別パフォーマンス */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">時間帯別パフォーマンス</h3>
            <div className="space-y-2">
              {learningPattern.timePattern.map((time, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{time.study_hour}時台</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {time.session_count}セッション
                    </span>
                    <span className="text-sm text-green-600">
                      {Math.round(time.avg_score)}点
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${(time.avg_score / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 曜日別パフォーマンス */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-lg mb-3">曜日別パフォーマンス</h3>
            <div className="space-y-2">
              {learningPattern.frequencyPattern.map((day, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{dayNames[day.day_of_week]}曜日</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {day.session_count}セッション
                    </span>
                    <span className="text-sm text-green-600">
                      {Math.round(day.avg_score)}点
                    </span>
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${(day.avg_score / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}