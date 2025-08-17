import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock fetch
global.fetch = vi.fn();

// Mock useAutoRefresh hook
vi.mock('../../hooks/useAutoRefresh', () => ({
  useAutoRefresh: vi.fn().mockReturnValue({
    refreshToken: vi.fn(),
    scheduleRefresh: vi.fn(),
  }),
}));

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

describe('AuthContext', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'user' as const,
    createdAt: new Date('2023-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mocks
    (window.localStorage.getItem as any).mockReturnValue(null);
    (window.localStorage.setItem as any).mockClear();
    (window.localStorage.removeItem as any).mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuthProvider = (children: React.ReactNode) => {
    return render(<AuthProvider>{children}</AuthProvider>);
  };

  const createTestComponent = () => {
    return function TestComponent() {
      const auth = useAuth();
      return (
        <div>
          <div data-testid="user-id">{auth.userId}</div>
          <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
          <div data-testid="is-loading">{auth.isLoading.toString()}</div>
          <div data-testid="error">{auth.error || 'none'}</div>
          <div data-testid="token">{auth.token || 'none'}</div>
          <div data-testid="user-email">{auth.user?.email || 'none'}</div>
        </div>
      );
    };
  };

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const TestComponent = createTestComponent();
      renderWithAuthProvider(<TestComponent />);

      expect(screen.getByTestId('user-id')).toHaveTextContent('0');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('none');
      expect(screen.getByTestId('token')).toHaveTextContent('none');
      expect(screen.getByTestId('user-email')).toHaveTextContent('none');
    });

    it('should attempt cookie-based authentication first', async () => {
      // Mock successful cookie authentication
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            user: mockUser,
          },
        }),
      });

      const TestComponent = createTestComponent();
      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/me',
        expect.objectContaining({
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('token')).toHaveTextContent('cookie-authenticated');
      expect(screen.getByTestId('user-email')).toHaveTextContent('test@example.com');
    });

    it('should fallback to localStorage token when cookie fails', async () => {
      const storedToken = 'stored-jwt-token';
      
      // Mock cookie auth failure
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      
      // Mock localStorage token exists
      (window.localStorage.getItem as any).mockReturnValue(storedToken);
      
      // Mock successful token verification
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            user: mockUser,
          },
        }),
      });

      const TestComponent = createTestComponent();
      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/me',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        })
      );

      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      expect(screen.getByTestId('token')).toHaveTextContent(storedToken);
    });

    it('should remove invalid localStorage token', async () => {
      const invalidToken = 'invalid-jwt-token';
      
      // Mock cookie auth failure
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });
      
      // Mock localStorage token exists
      (window.localStorage.getItem as any).mockReturnValue(invalidToken);
      
      // Mock token verification failure
      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      const TestComponent = createTestComponent();
      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(window.localStorage.removeItem).toHaveBeenCalledWith('ap-study-token');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const token = 'new-jwt-token';

      (fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial cookie check fails
        .mockResolvedValueOnce({ // Login success
          ok: true,
          json: vi.fn().mockResolvedValue({
            success: true,
            data: {
              token,
              user: mockUser,
            },
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login(email, password);
      });

      expect(loginResult!).toBe(true);
      
      // 認証状態チェックとログインの両方が呼ばれることを確認
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/me',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/login',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ emailOrUsername: email, password }),
        }
      );

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('cookie-authenticated');
      expect(result.current.user?.email).toBe(email);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('ap-study-token', token);
    });

    it('should handle login failure', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      (fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial cookie check fails
        .mockResolvedValueOnce({ // Login failure
          ok: false,
          status: 401,
          json: vi.fn().mockResolvedValue({
            success: false,
            message: 'Invalid credentials',
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login(email, password);
      });

      expect(loginResult!).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.error).toBe('Invalid credentials');
    });

    it('should handle network errors during login', async () => {
      (fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial cookie check fails
        .mockRejectedValueOnce(new Error('Network error')); // Login network error

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let loginResult: boolean;
      await act(async () => {
        loginResult = await result.current.login('test@example.com', 'password123');
      });

      expect(loginResult!).toBe(false);
      expect(result.current.error).toBe('ネットワークエラーが発生しました');
    });
  });

  describe('Signup Functionality', () => {
    it('should signup successfully with valid data', async () => {
      const email = 'newuser@example.com';
      const password = 'password123';
      const name = 'New User';
      const token = 'new-jwt-token';

      (fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial cookie check fails
        .mockResolvedValueOnce({ // Signup success
          ok: true,
          json: vi.fn().mockResolvedValue({
            success: true,
            data: {
              token,
              user: { ...mockUser, email, name },
            },
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: boolean;
      await act(async () => {
        signupResult = await result.current.signup(email, password, name);
      });

      expect(signupResult!).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password, name }),
        }
      );

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.token).toBe('cookie-authenticated');
      expect(result.current.user?.email).toBe(email);
      expect(window.localStorage.setItem).toHaveBeenCalledWith('ap-study-token', token);
    });

    it('should handle signup failure', async () => {
      (fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial cookie check fails
        .mockResolvedValueOnce({ // Signup failure
          ok: false,
          status: 409,
          json: vi.fn().mockResolvedValue({
            success: false,
            error: 'Email already exists',
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      let signupResult: boolean;
      await act(async () => {
        signupResult = await result.current.signup('existing@example.com', 'password123', 'User');
      });

      expect(signupResult!).toBe(false);
      expect(result.current.error).toBe('Email already exists');
    });
  });

  describe('Logout Functionality', () => {
    it('should logout successfully and clear state', async () => {
      // Setup authenticated user first
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout API call
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          message: 'Logged out successfully',
        }),
      });

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/logout',
        {
          method: 'POST',
          credentials: 'include',
        }
      );

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);
      expect(result.current.error).toBe(null);
      expect(window.localStorage.removeItem).toHaveBeenCalledWith('ap-study-token');
    });

    it('should clear client state even if server logout fails', async () => {
      // Setup authenticated user first
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      // Mock logout API failure
      (fetch as any).mockRejectedValueOnce(new Error('Network error'));

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Perform logout
      await act(async () => {
        await result.current.logout();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Server logout failed:', expect.any(Error));
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.token).toBe(null);

      consoleSpy.mockRestore();
    });
  });

  describe('User Update', () => {
    it('should update user information', async () => {
      // Setup authenticated user first
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { user: mockUser },
        }),
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      const updates = { name: 'Updated Name' };

      act(() => {
        result.current.updateUser(updates);
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.email).toBe('test@example.com'); // Other fields preserved
    });

    it('should not update user when not authenticated', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.updateUser({ name: 'New Name' });
      });

      expect(result.current.user).toBe(null);
    });
  });

  describe('HttpOnly Cookie Integration', () => {
    it('should send credentials: include for all API calls', async () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Test login
      (fetch as any).mockClear();
      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );

      // Test signup
      (fetch as any).mockClear();
      await act(async () => {
        await result.current.signup('test@example.com', 'password', 'name');
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          credentials: 'include',
        })
      );
    });

    it('should prefer cookie-based authentication over token', async () => {
      const storedToken = 'localStorage-token';
      
      // Mock localStorage token exists
      (window.localStorage.getItem as any).mockReturnValue(storedToken);
      
      // Mock successful cookie authentication (first call)
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { user: mockUser },
        }),
      });

      const TestComponent = createTestComponent();
      renderWithAuthProvider(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      // Should use cookie-based authentication (no Authorization header)
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/api/auth/me',
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.any(String),
          }),
        })
      );

      expect(screen.getByTestId('token')).toHaveTextContent('cookie-authenticated');
    });
  });

  describe('Auto Refresh Integration', () => {
    it('should initialize auto refresh when authenticated', async () => {
      const { useAutoRefresh } = await import('../../hooks/useAutoRefresh');
      
      // Setup authenticated user
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: { user: mockUser },
        }),
      });

      renderWithAuthProvider(<div>Test</div>);

      await waitFor(() => {
        expect(useAutoRefresh).toHaveBeenCalled();
      });
    });
  });

  describe('Error Handling', () => {
    it('should clear error on successful operations', async () => {
      // Set up initial mocks for AuthProvider initialization
      (fetch as any)
        .mockResolvedValueOnce({ ok: false, status: 401 }) // Initial cookie check fails
        .mockResolvedValueOnce({ // Login fails
          ok: false,
          status: 401,
          json: vi.fn().mockResolvedValue({
            success: false,
            message: 'Invalid credentials',
          }),
        });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await act(async () => {
        await result.current.login('wrong@example.com', 'wrongpassword');
      });

      expect(result.current.error).toBe('Invalid credentials');

      // Now succeed with login
      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: vi.fn().mockResolvedValue({
          success: true,
          data: {
            token: 'new-token',
            user: mockUser,
          },
        }),
      });

      await act(async () => {
        await result.current.login('test@example.com', 'correctpassword');
      });

      expect(result.current.error).toBe(null);
    });
  });
});