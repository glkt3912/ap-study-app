"use client";

import React, { useState, useEffect } from "react";
import { apiClient, Question, QuizCategory, QuizSession } from "../lib/api";

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
}

export default function Quiz() {
  const [state, setState] = useState<QuizState>({
    session: null,
    categories: [],
    loading: false,
    error: null,
    result: null,
  });

  // カテゴリ一覧取得
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setState(prev => ({ ...prev, loading: true }));
        const categories = await apiClient.getQuizCategories();
        setState(prev => ({ ...prev, categories, loading: false }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : "カテゴリの取得に失敗しました",
          loading: false,
        }));
      }
    };

    loadCategories();
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
    </div>
  );
}