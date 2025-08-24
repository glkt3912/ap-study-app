const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export abstract class BaseClient {
  protected getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // ブラウザ環境でのみLocalStorageにアクセス
    if (typeof window !== 'undefined') {
      let token = localStorage.getItem('ap-study-token');
      
      const enableAuthLogging = process.env.NEXT_PUBLIC_ENABLE_AUTH_LOGGING === 'true';
      
      if (process.env.NODE_ENV === 'development') {
        // 開発環境: デフォルトのテストトークンを使用
        if (!token || token === 'cookie-authenticated') {
          // 開発環境用のデフォルトテストトークン（User ID: 7）
          token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwidXNlcklkIjo3LCJlbWFpbCI6InRlc3RAZXhhbXBsZS5jb20iLCJyb2xlIjoidXNlciIsImlhdCI6MTc1NTQ2NTIwMywiZXhwIjoxNzU4MDU3MjAzfQ.RHF7B13iGWdvbNwGkZM0gH8XSsMU0JeFaMAfLQ1_glA';
          if (enableAuthLogging) {
            // eslint-disable-next-line no-console
            console.log('Development mode: Using default test token (User ID: 7)');
          }
        }
        
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          if (enableAuthLogging) {
            // eslint-disable-next-line no-console
            console.log('Development mode: Using Bearer token authentication');
          }
        }
      } else {
        // 本番環境: HttpOnly Cookie優先、フォールバックとしてBearer token
        if (token && token !== 'cookie-authenticated') {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    return headers;
  }

  // エラーボディ解析を分離
  private async parseErrorBody(response: Response): Promise<{ message: string; details: any }> {
    let errorMessage = `HTTP error! status: ${response.status}`;
    let errorDetails = null;

    try {
      const errorBody = await response.text();
      if (errorBody) {
        try {
          errorDetails = JSON.parse(errorBody);
          errorMessage = errorDetails.error || errorDetails.message || errorMessage;
        } catch {
          errorMessage = errorBody.length > 0 ? errorBody : errorMessage;
        }
      }
    } catch {
      // エラーボディの読み取りに失敗した場合はデフォルトメッセージを使用
    }

    return { message: errorMessage, details: errorDetails };
  }

  // エラーログ出力を分離
  private logApiError(response: Response, url: string, method: string, errorMessage: string, errorDetails: any): void {
    if (process.env.NODE_ENV !== 'development') return;

    if (response.status === 404) {
      // eslint-disable-next-line no-console
      console.warn(`API 404: ${method} ${url}`);
    } else if (response.status >= 500) {
      // eslint-disable-next-line no-console
      console.error(`API ${response.status}: ${method} ${url} - ${errorMessage}`);
      console.error('Error details:', errorDetails);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`API ${response.status}: ${method} ${url} - ${errorMessage}`);
      console.warn('Error details:', errorDetails);
    }
  }

  // 監視システムへの記録を分離
  private async trackApiError(
    endpoint: string, 
    method: string, 
    duration: number, 
    status: number, 
    error: Error
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      const { monitoring } = await import('../monitoring');
      monitoring.trackApiCall(endpoint, method, duration, status, error);
    }
  }

  // エラーハンドリングを分離して複雑度を削減
  private async handleApiError(
    response: Response, 
    url: string, 
    method: string, 
    duration: number, 
    endpoint: string
  ): Promise<never> {
    const { message: errorMessage, details: errorDetails } = await this.parseErrorBody(response);
    
    this.logApiError(response, url, method, errorMessage, errorDetails);

    const error = new Error(errorMessage);
    await this.trackApiError(endpoint, method, duration, response.status, error);

    throw error;
  }

  // APIリクエストログ出力を分離
  private logApiRequest(method: string, url: string, body?: any): void {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
      // eslint-disable-next-line no-console
      console.log(`API ${method}: ${url}`);
      if (body) {
        // eslint-disable-next-line no-console
        console.log('Body:', body);
      }
    }
  }

  // APIレスポンスログ出力を分離
  private logApiResponse(
    method: string, 
    url: string, 
    status: number, 
    duration: number, 
    data?: any
  ): void {
    if (process.env.NODE_ENV === 'development') {
      if (process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
        // eslint-disable-next-line no-console
        console.log(`API ${status}: ${method} ${url} (${duration.toFixed(2)}ms)`);
      }
      if (process.env.NEXT_PUBLIC_DETAILED_API_LOGGING === 'true' && data) {
        // eslint-disable-next-line no-console
        console.log('Response Data:', data);
      }
    }
  }

  // データバリデーションを分離
  private async validateResponseData(
    data: any, 
    method: string, 
    url: string, 
    endpoint: string, 
    duration: number, 
    status: number
  ): Promise<void> {
    if (!data) {
      const error = new Error('No data returned from API');
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DETAILED_API_LOGGING === 'true') {
        console.error(`API returned null/undefined data: ${method} ${url}`);
      }
      await this.trackApiError(endpoint, method, duration, status, error);
      throw error;
    }

    if ('success' in data && !data.success) {
      const errorMessage = typeof data.error === 'string' 
        ? data.error 
        : data.message 
        ? String(data.message)
        : 'API request failed';
      
      const error = new Error(errorMessage);
      
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DETAILED_API_LOGGING === 'true') {
        console.error(`API business logic error: ${method} ${url} - ${errorMessage}`);
        console.error('Error data:', data);
      }
      
      await this.trackApiError(endpoint, method, duration, status, error);
      throw error;
    }
  }

  // 成功時の監視記録を分離
  private async trackApiSuccess(
    endpoint: string, 
    method: string, 
    duration: number, 
    status: number
  ): Promise<void> {
    if (typeof window !== 'undefined') {
      const { monitoring } = await import('../monitoring');
      monitoring.trackApiCall(endpoint, method, duration, status);
    }
  }

  // ネットワークエラーハンドリングを分離
  private async handleNetworkError(
    error: any, 
    endpoint: string, 
    method: string, 
    url: string, 
    duration: number
  ): Promise<never> {
    if (process.env.NODE_ENV === 'development') {
      if (error instanceof Error) {
        if (error.message.includes('fetch')) {
          // eslint-disable-next-line no-console
          console.warn(`Network error: ${method} ${url} - ${error.message}`);
        } else {
          // eslint-disable-next-line no-console
          console.warn(`API request error: ${method} ${url} - ${error.message}`);
        }
      } else {
        // eslint-disable-next-line no-console
        console.warn(`API request error: ${method} ${url} - Unknown error:`, error);
      }
    }

    await this.trackApiError(
      endpoint, 
      method, 
      duration, 
      0, 
      error instanceof Error ? error : new Error(String(error))
    );

    if (!(error instanceof Error)) {
      throw new Error(
        typeof error === 'string' ? error : `API request failed: ${JSON.stringify(error)}`
      );
    }

    throw error;
  }

  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const startTime = performance.now();
    const method = options?.method || 'GET';
    const url = `${API_BASE_URL}${endpoint}`;

    const requestConfig = {
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      credentials: 'include' as const,
      ...options,
    };

    this.logApiRequest(method, url, options?.body);

    try {
      const response = await fetch(url, requestConfig);
      const duration = performance.now() - startTime;

      this.logApiResponse(method, url, response.status, duration);

      if (!response.ok) {
        return await this.handleApiError(response, url, method, duration, endpoint) as never;
      }

      const data = await response.json();
      this.logApiResponse(method, url, response.status, duration, data);

      await this.validateResponseData(data, method, url, endpoint, duration, response.status);
      await this.trackApiSuccess(endpoint, method, duration, response.status);

      return 'success' in data ? data.data : data;
    } catch (error) {
      const duration = performance.now() - startTime;
      return await this.handleNetworkError(error, endpoint, method, url, duration) as never;
    }
  }
}