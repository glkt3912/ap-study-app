import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoRefresh } from '../useAutoRefresh';
import * as AuthContext from '../../contexts/AuthContext';

// Mock fetch
global.fetch = vi.fn();

// Mock AuthContext
const mockAuthContext = {
  token: 'mock-token',
  isAuthenticated: true,
  logout: vi.fn(),
  user: null,
  userId: 1,
  login: vi.fn(),
  signup: vi.fn(),
  updateUser: vi.fn(),
  isLoading: false,
  error: null,
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('useAutoRefresh Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (AuthContext.useAuth as any).mockReturnValue(mockAuthContext);
    
    // Mock successful refresh response
    (fetch as any).mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        success: true,
        data: {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          expiresIn: '2h'
        }
      })
    });
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Token Refresh Scheduling', () => {
    it('should schedule token refresh when authenticated', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Assert - should schedule refresh
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AutoRefresh] Scheduled token refresh in')
      );

      consoleSpy.mockRestore();
    });

    it('should not schedule refresh when not authenticated', () => {
      // Arrange
      (AuthContext.useAuth as any).mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: false,
        token: null,
      });
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Assert - should not schedule refresh
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[AutoRefresh] Scheduled token refresh in')
      );

      consoleSpy.mockRestore();
    });

    it('should refresh token after 90 minutes (75% of 2 hours)', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Fast forward to just before refresh time
      vi.advanceTimersByTime(5400000 - 1000); // 90 minutes - 1 second
      expect(fetch).not.toHaveBeenCalled();

      // Fast forward to refresh time
      vi.advanceTimersByTime(1000);
      await vi.runAllTimersAsync();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[AutoRefresh] Attempting to refresh token...');
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/refresh',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        })
      );

      consoleSpy.mockRestore();
    });

    it('should reschedule refresh after successful token refresh', async () => {
      // Arrange
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Fast forward to refresh time
      vi.advanceTimersByTime(5400000);
      await vi.runAllTimersAsync();

      // Assert - should log successful refresh and reschedule
      expect(consoleSpy).toHaveBeenCalledWith('[AutoRefresh] Token refreshed successfully');
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[AutoRefresh] Scheduled token refresh in')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Token Refresh API Integration', () => {
    it('should call refresh API with correct parameters', async () => {
      // Act
      const { result } = renderHook(() => useAutoRefresh());
      
      await act(async () => {
        await result.current.refreshToken();
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/refresh',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({}),
        }
      );
    });

    it('should return true on successful refresh', async () => {
      // Act
      const { result } = renderHook(() => useAutoRefresh());
      
      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      // Assert
      expect(refreshResult!).toBe(true);
    });

    it('should return false on failed refresh', async () => {
      // Arrange
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
      });

      // Act
      const { result } = renderHook(() => useAutoRefresh());
      
      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      // Assert
      expect(refreshResult!).toBe(false);
    });

    it('should handle network errors gracefully', async () => {
      // Arrange
      (fetch as any).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      const { result } = renderHook(() => useAutoRefresh());
      
      let refreshResult: boolean;
      await act(async () => {
        refreshResult = await result.current.refreshToken();
      });

      // Assert
      expect(refreshResult!).toBe(false);
      expect(consoleSpy).toHaveBeenCalledWith('[AutoRefresh] Token refresh error:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Logout on Refresh Failure', () => {
    it('should call logout when token refresh fails', async () => {
      // Arrange
      (fetch as any).mockResolvedValue({
        ok: false,
        status: 401,
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Fast forward to refresh time
      vi.advanceTimersByTime(5400000);
      await vi.runAllTimersAsync();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[AutoRefresh] Failed to refresh token, logging out...');
      expect(mockAuthContext.logout).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should call logout when refresh throws an error', async () => {
      // Arrange
      (fetch as any).mockRejectedValue(new Error('Network error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Fast forward to refresh time
      vi.advanceTimersByTime(5400000);
      await vi.runAllTimersAsync();

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[AutoRefresh] Failed to refresh token, logging out...');
      expect(mockAuthContext.logout).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Timer Management', () => {
    it('should clear existing timer when rescheduling', async () => {
      // Act
      const { result } = renderHook(() => useAutoRefresh());

      // Schedule first refresh
      act(() => {
        result.current.scheduleRefresh();
      });

      // Schedule second refresh (should clear first)
      act(() => {
        result.current.scheduleRefresh();
      });

      // Fast forward to first refresh time
      vi.advanceTimersByTime(5400000);
      await vi.runAllTimersAsync();

      // Assert - should only have one refresh call
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('should clear timer when component unmounts', () => {
      // Act
      const { unmount } = renderHook(() => useAutoRefresh());

      // Unmount component
      unmount();

      // Fast forward past refresh time
      vi.advanceTimersByTime(5400000);

      // Assert - should not call refresh after unmount
      expect(fetch).not.toHaveBeenCalled();
    });

    it('should clear timer when authentication state changes to false', () => {
      // Arrange
      const { rerender } = renderHook(() => useAutoRefresh());

      // Change auth state to false
      (AuthContext.useAuth as any).mockReturnValue({
        ...mockAuthContext,
        isAuthenticated: false,
        token: null,
      });

      // Rerender hook
      rerender();

      // Fast forward past refresh time
      vi.advanceTimersByTime(5400000);

      // Assert - should not call refresh when not authenticated
      expect(fetch).not.toHaveBeenCalled();
    });
  });

  describe('Development Mode Logging', () => {
    it('should log refresh timing in development mode', () => {
      // Arrange
      process.env.NODE_ENV = 'development';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Assert
      expect(consoleSpy).toHaveBeenCalledWith('[AutoRefresh] Scheduled token refresh in 90 minutes');

      consoleSpy.mockRestore();
    });

    it('should not log refresh timing in production mode', () => {
      // Arrange
      process.env.NODE_ENV = 'production';
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      // Act
      renderHook(() => useAutoRefresh());

      // Assert - should still log some messages but not the timing one
      expect(consoleSpy).not.toHaveBeenCalledWith('[AutoRefresh] Scheduled token refresh in 90 minutes');

      consoleSpy.mockRestore();
    });
  });

  describe('Cookie-based Authentication', () => {
    it('should use credentials: include for cookie support', async () => {
      // Act
      const { result } = renderHook(() => useAutoRefresh());
      
      await act(async () => {
        await result.current.refreshToken();
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should send empty JSON body for refresh request', async () => {
      // Act
      const { result } = renderHook(() => useAutoRefresh());
      
      await act(async () => {
        await result.current.refreshToken();
      });

      // Assert
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({}),
        })
      );
    });
  });
});