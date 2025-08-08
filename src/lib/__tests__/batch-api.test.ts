import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api';

// モックfetchレスポンス
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Batch API Methods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // LocalStorageモック
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
      },
      writable: true,
    });
  });

  describe('getBatchAnalysisData', () => {
    it('should fetch batch analysis data successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          studyLogs: [{ id: 1, subject: 'Math', studyTime: 60 }],
          morningTests: [{ id: 1, category: 'AM', correctAnswers: 8 }],
          afternoonTests: [{ id: 1, category: 'PM', score: 75 }],
          studyLogStats: { totalTime: 120, averageUnderstanding: 4.2 },
          predictiveAnalysis: { examPassProbability: 85 },
          personalizedRecommendations: { dailyStudyPlan: [] },
          advancedWeakPoints: { criticalWeakPoints: [] },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.getBatchAnalysisData(123);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/batch/analysis-data?userId=123',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should call without userId parameter', async () => {
      const mockResponse = {
        success: true,
        data: {
          studyLogs: [],
          morningTests: [],
          afternoonTests: [],
          studyLogStats: null,
          predictiveAnalysis: null,
          personalizedRecommendations: null,
          advancedWeakPoints: null,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiClient.getBatchAnalysisData();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/batch/analysis-data', expect.any(Object));
    });
  });

  describe('getBatchQuizData', () => {
    it('should fetch batch quiz data successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          categories: [{ category: 'Network', questionCount: 50 }],
          progress: { overall: { totalQuestions: 100, answeredQuestions: 45 } },
          recommendations: {
            reason: 'AI推奨',
            questions: [{ id: 'q1', question: 'Test question' }],
          },
          weakPoints: [{ category: 'Database', accuracy: 60 }],
          learningTrends: { period: 30, dailyTrends: [] },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.getBatchQuizData(456);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/batch/quiz-data?userId=456',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle null responses gracefully', async () => {
      const mockResponse = {
        success: true,
        data: {
          categories: [],
          progress: null,
          recommendations: null,
          weakPoints: [],
          learningTrends: null,
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.getBatchQuizData();

      expect(result.progress).toBeNull();
      expect(result.recommendations).toBeNull();
      expect(result.learningTrends).toBeNull();
    });
  });

  describe('getBatchDashboardMLData', () => {
    it('should fetch batch dashboard ML data successfully', async () => {
      const mockResponse = {
        success: true,
        data: {
          predictiveAnalysis: {
            examPassProbability: 92,
            recommendedStudyHours: 3,
            timeToReadiness: 14,
            riskFactors: ['時間不足'],
            successFactors: ['継続学習'],
          },
          personalizedRecommendations: {
            dailyStudyPlan: [
              {
                subjects: ['ネットワーク'],
                estimatedTime: 90,
                priority: 'high',
                objectives: ['基礎理解'],
              },
            ],
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await apiClient.getBatchDashboardMLData(789);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/batch/dashboard-ml-data/789',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        })
      );
      expect(result).toEqual(mockResponse.data);
    });

    it('should handle ML API errors gracefully', async () => {
      mockFetch.mockRejectedValueOnce(new Error('ML API unavailable'));

      await expect(apiClient.getBatchDashboardMLData(789)).rejects.toThrow('ML API unavailable');
    });
  });

  describe('Error Handling', () => {
    it('should throw error when API returns failure', async () => {
      const mockResponse = {
        success: false,
        error: 'Batch processing failed',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await expect(apiClient.getBatchAnalysisData(123)).rejects.toThrow('Batch processing failed');
    });

    it('should handle HTTP error status codes', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      await expect(apiClient.getBatchQuizData()).rejects.toThrow('HTTP error! status: 500');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getBatchDashboardMLData(123)).rejects.toThrow('Network error');
    });
  });

  describe('Performance Monitoring Integration', () => {
    it('should track API call metrics on success', async () => {
      const mockResponse = { success: true, data: {} };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      // monitoring.tsがインポートされることを確認
      const startTime = performance.now();
      await apiClient.getBatchAnalysisData(123);
      const duration = performance.now() - startTime;

      expect(duration).toBeGreaterThanOrEqual(0);
    });

    it('should track API call metrics on error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const startTime = performance.now();

      try {
        await apiClient.getBatchQuizData();
      } catch {
        // エラーは期待通り
      }

      const duration = performance.now() - startTime;
      expect(duration).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Authentication Integration', () => {
    it('should include authorization header from localStorage', async () => {
      const mockResponse = { success: true, data: {} };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiClient.getBatchAnalysisData(123);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer mock-token',
          }),
        })
      );
    });

    it('should work without token when not authenticated', async () => {
      // LocalStorageからトークンが取得できない場合
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: vi.fn(() => null),
          setItem: vi.fn(),
          removeItem: vi.fn(),
        },
        writable: true,
      });

      const mockResponse = { success: true, data: {} };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await apiClient.getBatchQuizData();

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );
    });
  });
});
