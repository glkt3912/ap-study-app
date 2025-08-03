"use client";

import React, { useState, useEffect, lazy, Suspense } from "react";
import { apiClient, Question, QuizCategory, QuizSession } from "../lib/api";

const LineChart = lazy(() => import('recharts').then(module => ({ default: module.LineChart })));
const Line = lazy(() => import('recharts').then(module => ({ default: module.Line })));
const XAxis = lazy(() => import('recharts').then(module => ({ default: module.XAxis })));
const YAxis = lazy(() => import('recharts').then(module => ({ default: module.YAxis })));
const CartesianGrid = lazy(() => import('recharts').then(module => ({ default: module.CartesianGrid })));
const Tooltip = lazy(() => import('recharts').then(module => ({ default: module.Tooltip })));
const ResponsiveContainer = lazy(() => import('recharts').then(module => ({ default: module.ResponsiveContainer })));

interface QuizState {
  session: null | {
    sessionId: number;
    questions: Question[];
    currentIndex: number;
    answers: { [questionId: string]: string };
    startTime: number;
    questionStartTime: number;
  };
  categories: QuizCategory[];
  loading: boolean;
  error: string | null;
  result: QuizSession | null;
  recommendations: {
    reason: string;
    weakCategories?: string[];
    questions: Question[];
  } | null;
  progress: {
    overall: {
      totalQuestions: number;
      answeredQuestions: number;
      progressRate: number;
    };
    categoryProgress: any[];
    recentActivity: QuizSession[];
  } | null;
  weakPoints: any[];
  learningTrends: {
    period: number;
    dailyTrends: any[];
    cumulativeProgress: any[];
    categoryTrends: any[];
  } | null;
}

export default function Quiz() {
  const [state, setState] = useState<QuizState>({
    session: null,
    categories: [],
    loading: false,
    error: null,
    result: null,
    recommendations: null,
    progress: null,
    weakPoints: [],
    learningTrends: null,
  });
  
  const [activeTab, setActiveTab] = useState<"quiz" | "progress" | "recommendations" | "trends">("quiz");

  // 初期データ取得
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        
        const [categories, progress, recommendations, weakPoints, learningTrends] = await Promise.all([
          apiClient.getQuizCategories(),
          apiClient.getQuizProgress().catch(() => null),
          apiClient.getRecommendedQuestions(10).catch(() => null),
          apiClient.getWeakPoints(5).catch(() => []),
          apiClient.getLearningTrends(30).catch(() => null),
        ]);
        
        setState(prev => ({ 
          ...prev, 
          categories, 
          progress,
          recommendations,
          weakPoints,
          learningTrends,
          loading: false 
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "データの取得に失敗しました",
          loading: false,
        }));
      }
    };

    loadInitialData();
  }, []);

  // Quiz開始
  const startQuiz = async (
    sessionType: "category" | "random" | "review" | "weak_points",
    questionCount: number,
    category?: string
  ) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const sessionData = await apiClient.startQuizSession({
        sessionType,
        questionCount,
        category,
      });

      setState(prev => ({
        ...prev,
        session: {
          sessionId: sessionData.sessionId,
          questions: sessionData.questions,
          currentIndex: 0,
          answers: {},
          startTime: Date.now(),
          questionStartTime: Date.now(),
        },
        loading: false,
        result: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Quizの開始に失敗しました",
        loading: false,
      }));
    }
  };

  // 回答選択
  const selectAnswer = (answer: string) => {
    if (!state.session) return;

    setState(prev => ({
      ...prev,
      session: prev.session ? {
        ...prev.session,
        answers: {
          ...prev.session.answers,
          [prev.session.questions[prev.session.currentIndex].id]: answer,
        },
      } : null,
    }));
  };

  // 次の問題へ
  const nextQuestion = async () => {
    if (!state.session) return;

    const currentQuestion = state.session.questions[state.session.currentIndex];
    const userAnswer = state.session.answers[currentQuestion.id];
    const timeSpent = Math.round((Date.now() - state.session.questionStartTime) / 1000);

    if (!userAnswer) {
      setState(prev => ({ ...prev, error: "回答を選択してください" }));
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // 回答を送信
      await apiClient.submitQuizAnswer({
        sessionId: state.session.sessionId,
        questionId: currentQuestion.id,
        userAnswer,
        timeSpent,
      });

      // 次の問題へ進む、または結果表示
      if (state.session.currentIndex < state.session.questions.length - 1) {
        setState(prev => ({
          ...prev,
          session: prev.session ? {
            ...prev.session,
            currentIndex: prev.session.currentIndex + 1,
            questionStartTime: Date.now(),
          } : null,
          loading: false,
        }));
      } else {
        // Quiz完了
        const result = await apiClient.completeQuizSession(state.session.sessionId);
        setState(prev => ({
          ...prev,
          session: null,
          result,
          loading: false,
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "回答の送信に失敗しました",
        loading: false,
      }));
    }
  };

  // Quiz終了
  const endQuiz = () => {
    setState(prev => ({
      ...prev,
      session: null,
      result: null,
      error: null,
    }));
  };

  // ローディング中
  if (state.loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">読み込み中...</p>
          </div>
        </div>
      </div>
    );
  }

  // エラー表示
  if (state.error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <div className="text-red-500 text-lg font-semibold mb-4">エラー</div>
            <p className="text-gray-600 mb-6">{state.error}</p>
            <button
              onClick={() => setState(prev => ({ ...prev, error: null }))}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 結果表示
  if (state.result) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Quiz結果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{state.result.score}%</div>
                <div className="text-sm text-gray-600">正答率</div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {state.result.correctAnswers}/{state.result.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">正解数</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{state.result.avgTimePerQ}秒</div>
                <div className="text-sm text-gray-600">平均解答時間</div>
              </div>
            </div>

            {state.result.category && (
              <div className="mb-6">
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                  カテゴリ: {state.result.category}
                </span>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={endQuiz}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                新しいQuizを開始
              </button>
              <button
                onClick={() => window.location.reload()}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                ダッシュボードに戻る
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz進行中
  if (state.session) {
    const currentQuestion = state.session.questions[state.session.currentIndex];
    const userAnswer = state.session.answers[currentQuestion.id];
    const progress = ((state.session.currentIndex + 1) / state.session.questions.length) * 100;

    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* プログレスバー */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>
                問題 {state.session.currentIndex + 1} / {state.session.questions.length}
              </span>
              <span>{Math.round(progress)}% 完了</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 問題情報 */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                {currentQuestion.category}
              </span>
              {currentQuestion.subcategory && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm">
                  {currentQuestion.subcategory}
                </span>
              )}
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                難易度 {currentQuestion.difficulty}
              </span>
            </div>
          </div>

          {/* 問題文 */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              問題 {currentQuestion.number}
            </h3>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {currentQuestion.question}
            </p>
          </div>

          {/* 選択肢 */}
          <div className="space-y-3 mb-8">
            {currentQuestion.choices.map((choice, index) => {
              const optionLabel = String.fromCharCode(65 + index); // A, B, C, D
              const isSelected = userAnswer === optionLabel;
              
              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(optionLabel)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-semibold mr-3">{optionLabel}.</span>
                  {choice}
                </button>
              );
            })}
          </div>

          {/* 次へボタン */}
          <div className="text-center">
            <button
              onClick={nextQuestion}
              disabled={!userAnswer || state.loading}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                userAnswer && !state.loading
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {state.session.currentIndex < state.session.questions.length - 1
                ? "次の問題"
                : "結果を見る"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz開始画面
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">
          応用情報技術者試験 過去問Quiz
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ランダム問題 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">ランダム問題</h3>
            <p className="text-gray-600 mb-6 text-sm">
              全カテゴリからランダムに問題を出題します
            </p>
            <div className="space-y-3">
              <button
                onClick={() => startQuiz("random", 5)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                5問チャレンジ
              </button>
              <button
                onClick={() => startQuiz("random", 10)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                10問チャレンジ
              </button>
            </div>
          </div>

          {/* カテゴリ別問題 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-green-400 transition-colors">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">カテゴリ別問題</h3>
            <p className="text-gray-600 mb-6 text-sm">
              特定の分野に集中して学習できます
            </p>
            <div className="space-y-2">
              {state.categories.map((category) => (
                <button
                  key={category.category}
                  onClick={() => startQuiz("category", Math.min(category.questionCount, 10), category.category)}
                  className="w-full text-left bg-gray-50 hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{category.category}</span>
                    <span className="text-xs text-gray-500">{category.questionCount}問</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 追加情報 */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">📚 学習のポイント</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• IPA公式過去問から出題</li>
            <li>• 回答時間が記録され、効率的な学習をサポート</li>
            <li>• 正答率や苦手分野を分析して学習計画を最適化</li>
          </ul>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex overflow-x-auto border-b border-gray-200 mb-6 scrollbar-hide">
        {[
          { key: "quiz", label: "問題演習", shortLabel: "演習" },
          { key: "progress", label: "学習進捗", shortLabel: "進捗" },
          { key: "recommendations", label: "おすすめ問題", shortLabel: "推奨" },
          { key: "trends", label: "学習トレンド", shortLabel: "トレンド" }
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

      {/* 進捗タブ */}
      {activeTab === "progress" && state.progress && (
        <div className="space-y-6">
          {/* 全体進捗 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">全体進捗</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {state.progress.overall.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">総問題数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {state.progress.overall.answeredQuestions}
                </div>
                <div className="text-sm text-gray-600">回答済み問題数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {state.progress.overall.progressRate}%
                </div>
                <div className="text-sm text-gray-600">進捗率</div>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${state.progress.overall.progressRate}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* 最近の活動 */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">最近の学習活動</h3>
            <div className="space-y-3">
              {state.progress.recentActivity.slice(0, 5).map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <div className="font-medium">{session.category || "ランダム問題"}</div>
                    <div className="text-sm text-gray-600">
                      {new Date(session.completedAt || session.startedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg text-green-600">{session.score}点</div>
                    <div className="text-sm text-gray-600">
                      {session.correctAnswers}/{session.totalQuestions}問正解
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 推奨問題タブ */}
      {activeTab === "recommendations" && (
        <div className="space-y-6">
          {/* 苦手分野 */}
          {state.weakPoints.length > 0 && (
            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-800">苦手分野</h3>
              <div className="space-y-2">
                {state.weakPoints.map((weak: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <span className="font-medium">{weak.category}</span>
                    <div className="text-right">
                      <div className="text-sm text-red-600">
                        正答率: {Math.round(weak.accuracy_rate)}%
                      </div>
                      <div className="text-xs text-gray-600">
                        {weak.total_answers}問回答
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 推奨問題 */}
          {state.recommendations && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-800">おすすめ問題</h3>
              <div className="mb-4 p-3 bg-white rounded-lg">
                <div className="text-sm font-medium text-green-700">
                  推奨理由: {state.recommendations.reason === "weak_category_focus" ? "苦手分野の強化" : "一般的な学習"}
                </div>
                {state.recommendations.weakCategories && (
                  <div className="text-xs text-gray-600 mt-1">
                    重点カテゴリ: {state.recommendations.weakCategories.join(", ")}
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (state.recommendations) {
                    startQuiz("weak_points", Math.min(state.recommendations.questions.length, 10));
                  }
                }}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                推奨問題で学習開始 ({Math.min(state.recommendations.questions.length, 10)}問)
              </button>
            </div>
          )}
        </div>
      )}

      {/* 学習トレンドタブ */}
      {activeTab === "trends" && (
        <div className="space-y-6">
          {state.learningTrends ? (
            <>
              {/* 日別学習トレンド */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">日別学習トレンド (過去30日)</h3>
                <Suspense fallback={<div className="h-64 flex items-center justify-center">グラフを読み込み中...</div>}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={state.learningTrends.dailyTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="study_date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                        formatter={(value: number, name: string) => [
                          name === 'daily_questions' ? `${value}問` : 
                          name === 'avg_score' ? `${value.toFixed(1)}点` : 
                          `${value}分`,
                          name === 'daily_questions' ? '問題数' : 
                          name === 'avg_score' ? '平均スコア' : 
                          '学習時間'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="daily_questions" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        name="daily_questions"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="avg_score" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="avg_score"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              </div>

              {/* 累積進捗 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">累積学習進捗</h3>
                <Suspense fallback={<div className="h-64 flex items-center justify-center">グラフを読み込み中...</div>}>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={state.learningTrends.cumulativeProgress}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="study_date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString('ja-JP')}
                        formatter={(value: number, name: string) => [
                          `${value}問`,
                          '累積問題数'
                        ]}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="cumulative_questions" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        name="cumulative_questions"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Suspense>
              </div>

              {/* カテゴリ別トレンド */}
              {state.learningTrends.categoryTrends.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-4">カテゴリ別学習状況</h3>
                  <div className="space-y-3">
                    {state.learningTrends.categoryTrends.map((category: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <span className="font-medium">{category.category}</span>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-600">
                            {category.questions_attempted}問
                          </div>
                          <div className="text-sm text-green-600">
                            正答率: {Math.round(category.accuracy_rate * 100)}%
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(category.accuracy_rate * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-gray-50 rounded-lg p-6 text-center">
              <p className="text-gray-600">学習データが不足しています。問題演習を行うとトレンドが表示されます。</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}