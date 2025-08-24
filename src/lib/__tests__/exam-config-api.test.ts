import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient as api } from '../api';
import type { ExamConfig, CreateExamConfigRequest, UpdateExamConfigRequest } from '@/types/api';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Exam Config API Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
  });

  describe('getExamConfig', () => {
    it('should fetch exam config successfully', async () => {
      const mockConfig: ExamConfig = {
        id: 1,
        userId: 1,
        examDate: '2024-12-01T00:00:00Z',
        targetScore: 80,
        remainingDays: 30,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockConfig,
        }),
      });

      const result = await api.getExamConfig('1');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exam-config?userId=1',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toEqual(mockConfig);
    });

    it('should handle user ID encoding', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {},
        }),
      });

      await api.getExamConfig('user@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exam-config?userId=user@example.com',
        expect.any(Object)
      );
    });

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Server error'),
      });

      await expect(api.getExamConfig('999')).rejects.toThrow('Server error');
    });
  });

  describe('createExamConfig', () => {
    it('should create new exam config', async () => {
      const requestData: CreateExamConfigRequest = {
        examDate: '2024-12-01T00:00:00Z',
        targetScore: 85,
      };

      const mockResponse: ExamConfig = {
        id: 1,
        userId: 1,
        examDate: requestData.examDate,
        targetScore: requestData.targetScore!,
        remainingDays: 30,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockResponse,
        }),
      });

      const result = await api.createExamConfig(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exam-config',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle optional target score', async () => {
      const requestData: CreateExamConfigRequest = {
        examDate: '2024-12-01T00:00:00Z',
      };

      const mockResponse = {
        id: 1,
        userId: 1,
        examDate: requestData.examDate,
        remainingDays: 30,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      } as ExamConfig;

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockResponse,
        }),
      });

      const result = await api.createExamConfig(requestData);

      expect(result.targetScore).toBeUndefined();
    });

    it('should handle validation errors', async () => {
      const requestData: CreateExamConfigRequest = {
        examDate: 'invalid-date',
        targetScore: 85,
      };

      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({
          error: 'Validation error',
          details: [{ message: 'Invalid date format' }]
        }),
      });

      await expect(api.createExamConfig(requestData)).rejects.toThrow();
    });
  });

  describe('updateExamConfig', () => {
    it('should update existing exam config', async () => {
      const requestData: UpdateExamConfigRequest = {
        examDate: '2024-12-15T00:00:00Z',
        targetScore: 90,
      };

      const mockResponse: ExamConfig = {
        id: 1,
        userId: 1,
        examDate: requestData.examDate!,
        targetScore: requestData.targetScore!,
        remainingDays: 25,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-08-10T12:00:00Z',
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockResponse,
        }),
      });

      const result = await api.updateExamConfig(1, requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exam-config/1',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(requestData),
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle partial updates', async () => {
      const requestData: UpdateExamConfigRequest = {
        targetScore: 95,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {
            id: 1,
            userId: 1,
            examDate: '2024-12-01T00:00:00Z',
            targetScore: 95,
            remainingDays: 30,
            createdAt: '2024-01-01T00:00:00Z',
            updatedAt: '2024-08-10T12:00:00Z',
          },
        }),
      });

      await api.updateExamConfig(1, requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({ targetScore: 95 }),
        })
      );
    });
  });

  describe('deleteExamConfig', () => {
    it('should delete exam config successfully', async () => {
      const mockResponse = { message: 'Exam configuration deleted successfully' };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: mockResponse,
        }),
      });

      const result = await api.deleteExamConfig(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exam-config/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      );
      expect(result).toBeUndefined();
    });

    it('should handle delete errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ error: 'Configuration not found' }),
      });

      await expect(api.deleteExamConfig(999)).rejects.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      await expect(api.getExamConfig('1')).rejects.toThrow('Network error');
    });

    it('should handle response parsing errors', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(api.getExamConfig('1')).rejects.toThrow('Invalid JSON');
    });

    it('should handle server errors with proper status codes', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: 'Internal server error' }),
      });

      await expect(api.getExamConfig('1')).rejects.toThrow();
    });
  });

  describe('Authentication', () => {
    it('should include authentication headers when available', async () => {
      // Mock auth token
      const originalLocalStorage = global.localStorage;
      global.localStorage = {
        getItem: vi.fn().mockReturnValue('mock-token'),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        length: 0,
        key: vi.fn(),
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {},
        }),
      });

      await api.getExamConfig('1');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );

      global.localStorage = originalLocalStorage;
    });
  });

  describe('Request formatting', () => {
    it('should properly format dates in requests', async () => {
      const requestData: CreateExamConfigRequest = {
        examDate: '2024-12-01',
        targetScore: 80,
      };

      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {},
        }),
      });

      await api.createExamConfig(requestData);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            examDate: '2024-12-01',
            targetScore: 80,
          }),
        })
      );
    });

    it('should handle special characters in user IDs', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({
          success: true,
          data: {},
        }),
      });

      await api.getExamConfig('user+test@example.com');

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/exam-config?userId=user+test@example.com',
        expect.any(Object)
      );
    });
  });
});