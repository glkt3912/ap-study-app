import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from '../api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('API Client', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Study Plan API', () => {
    it('fetches study plan successfully', async () => {
      const mockData = {
        success: true,
        data: [
          {
            id: 1,
            weekNumber: 1,
            title: 'Week 1',
            phase: 'Foundation',
            goals: ['Learn basics'],
            days: [],
            progressPercentage: 0,
            totalStudyTime: 0,
            averageUnderstanding: 0,
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await apiClient.getStudyPlan();

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/study/plan', {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      expect(result).toEqual(mockData.data);
    });

    it('handles API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      });

      await expect(apiClient.getStudyPlan()).rejects.toThrow('HTTP error! status: 404');
    });
  });

  describe('Study Log API', () => {
    it('creates study log successfully', async () => {
      const studyLog = {
        date: '2024-01-01',
        subject: 'Math',
        topics: ['Algebra'],
        studyTime: 60,
        understanding: 4,
        memo: 'Good session',
      };

      const mockResponse = {
        success: true,
        data: { id: 1, ...studyLog, efficiency: 0.8 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.createStudyLog(studyLog);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/studylog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(studyLog),
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Quiz API', () => {
    it('starts quiz session successfully', async () => {
      const sessionOptions = {
        sessionType: 'category' as const,
        questionCount: 10,
        category: 'プログラミング',
      };

      const mockResponse = {
        success: true,
        data: {
          sessionId: 1,
          questions: [],
          totalQuestions: 10,
          sessionType: 'category',
          category: 'プログラミング',
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await apiClient.startQuizSession(sessionOptions);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:8000/api/quiz/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionOptions),
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Network errors', () => {
    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(apiClient.getStudyPlan()).rejects.toThrow('Network error');
    });
  });
});
