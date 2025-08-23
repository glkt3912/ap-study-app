import { BaseClient } from './BaseClient';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  password?: string;
}

export class AuthClient extends BaseClient {
  // 認証状態確認
  async verifyAuth(): Promise<User> {
    return this.request<User>('/api/auth/verify');
  }

  // ユーザー情報取得
  async getUser(): Promise<User> {
    return this.request<User>('/api/auth/user');
  }

  // Cookie認証チェック
  async verifyCookieAuth(): Promise<{ success: boolean; user?: User }> {
    try {
      const user = await this.request<User>('/api/auth/verify-cookie');
      return { success: true, user };
    } catch {
      return { success: false };
    }
  }

  // ログイン
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  // サインアップ
  async signup(userData: SignupRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // ログアウト
  async logout(): Promise<void> {
    await this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  // トークン更新
  async refreshToken(): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/api/auth/refresh', {
      method: 'POST',
    });
  }

  // ユーザー情報更新
  async updateUser(userId: number, updates: UpdateUserRequest): Promise<User> {
    return this.request<User>(`/api/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // パスワードリセット要求
  async requestPasswordReset(email: string): Promise<void> {
    await this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // パスワードリセット実行
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.request('/api/auth/reset-password/confirm', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }
}

// シングルトンインスタンス
export const authClient = new AuthClient();