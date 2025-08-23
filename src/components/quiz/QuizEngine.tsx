'use client';

import { useState, useCallback } from 'react';
import { apiClient, Question, QuizSession } from '../../lib/api';

interface QuizEngineProps {
  onQuizComplete: (_result: QuizSession) => void;
  onError: (_error: string) => void;
  isLoading: boolean;
  setLoading: (_loading: boolean) => void;
}

interface QuizSessionState {
  sessionId: number;
  questions: Question[];
  currentIndex: number;
  answers: { [questionId: string]: string };
  startTime: number;
  questionStartTime: number;
}

export function QuizEngine({ onQuizComplete, onError, isLoading: _isLoading, setLoading }: QuizEngineProps) {
  const [session, setSession] = useState<QuizSessionState | null>(null);

  const startQuiz = useCallback(async (
    sessionType: 'category' | 'random' | 'review' | 'weak_points',
    questionCount: number,
    category?: string
  ) => {
    try {
      setLoading(true);
      onError('');

      const sessionData = await apiClient.startQuizSession({
        sessionType,
        questionCount,
        ...(category && { category }),
      });

      setSession({
        sessionId: sessionData.sessionId,
        questions: sessionData.questions,
        currentIndex: 0,
        answers: {},
        startTime: Date.now(),
        questionStartTime: Date.now(),
      });
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Quizの開始に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [onError, setLoading]);

  const selectAnswer = useCallback((answer: string) => {
    if (!session) return;

    setSession(prev => prev ? {
      ...prev,
      answers: {
        ...prev.answers,
        [prev.questions[prev.currentIndex]?.id || '']: answer,
      },
    } : null);
  }, [session]);

  const nextQuestion = useCallback(async () => {
    if (!session) return;

    const currentQuestion = session.questions[session.currentIndex];
    if (!currentQuestion) return;

    const userAnswer = session.answers[currentQuestion.id];
    const timeSpent = Math.round((Date.now() - session.questionStartTime) / 1000);

    if (!userAnswer) {
      onError('回答を選択してください');
      return;
    }

    try {
      setLoading(true);
      onError('');

      await apiClient.submitQuizAnswer({
        sessionId: session.sessionId,
        questionId: currentQuestion.id,
        userAnswer,
        timeSpent,
      });

      if (session.currentIndex < session.questions.length - 1) {
        setSession(prev => prev ? {
          ...prev,
          currentIndex: prev.currentIndex + 1,
          questionStartTime: Date.now(),
        } : null);
      } else {
        const result = await apiClient.completeQuizSession(session.sessionId);
        onQuizComplete(result);
        setSession(null);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : '回答の送信に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [session, onError, onQuizComplete, setLoading]);

  const endQuiz = useCallback(() => {
    setSession(null);
    onError('');
  }, [onError]);

  return {
    session,
    startQuiz,
    selectAnswer,
    nextQuestion,
    endQuiz,
  };
}