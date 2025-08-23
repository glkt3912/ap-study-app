'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiClient, PredictiveAnalysis, PersonalizedRecommendations } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

interface AIAnalysisContextType {
  predictiveAnalysis: PredictiveAnalysis | null;
  personalizedRecommendations: PersonalizedRecommendations | null;
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
  clearError: () => void;
}

const AIAnalysisContext = createContext<AIAnalysisContextType | undefined>(undefined);

interface AIAnalysisProviderProps {
  children: ReactNode;
}

export function AIAnalysisProvider({ children }: AIAnalysisProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const [predictiveAnalysis, setPredictiveAnalysis] = useState<PredictiveAnalysis | null>(null);
  const [personalizedRecommendations, setPersonalizedRecommendations] = useState<
    PersonalizedRecommendations | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUserAuthenticated = isAuthenticated && user?.id && user.id > 0;

  const fetchAIDataFallback = useCallback(async () => {
    if (!isUserAuthenticated) return;

    try {
      const [predictions, recommendations] = await Promise.all([
        apiClient.getPredictiveAnalysis(user.id).catch(() => null),
        apiClient.getPersonalizedRecommendations(user.id).catch(() => null),
      ]);

      setPredictiveAnalysis(predictions);
      setPersonalizedRecommendations(recommendations);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.warn('AI データ取得失敗（非表示）:', error);
      }
      setPredictiveAnalysis(null);
      setPersonalizedRecommendations(null);
    }
  }, [isUserAuthenticated, user?.id]);

  const fetchBatchDashboardMLData = useCallback(async () => {
    if (!isUserAuthenticated) return;

    try {
      setIsLoading(true);
      setError(null);
      const batchData = await apiClient.getBatchDashboardMLData(user.id);

      setPredictiveAnalysis(batchData.predictiveAnalysis);
      setPersonalizedRecommendations(batchData.personalizedRecommendations);
    } catch (error) {
      try {
        await fetchAIDataFallback();
      } catch (fallbackError) {
        if (process.env.NODE_ENV === 'development') {
          // eslint-disable-next-line no-console
          console.warn('AI機能全体が利用不可（非表示）:', { error, fallbackError });
        }
        setPredictiveAnalysis(null);
        setPersonalizedRecommendations(null);
        setError('AI分析データの取得に失敗しました');
      }
    } finally {
      setIsLoading(false);
    }
  }, [isUserAuthenticated, user?.id, fetchAIDataFallback]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const contextValue: AIAnalysisContextType = {
    predictiveAnalysis,
    personalizedRecommendations,
    isLoading,
    error,
    fetchData: fetchBatchDashboardMLData,
    clearError,
  };

  return (
    <AIAnalysisContext.Provider value={contextValue}>
      {children}
    </AIAnalysisContext.Provider>
  );
}

export function useAIAnalysis(): AIAnalysisContextType {
  const context = useContext(AIAnalysisContext);
  if (context === undefined) {
    throw new Error('useAIAnalysis must be used within an AIAnalysisProvider');
  }
  return context;
}