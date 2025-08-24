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

  protected async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const startTime = performance.now();
    const method = options?.method || 'GET';
    const url = `${API_BASE_URL}${endpoint}`;

    const requestConfig = {
      headers: {
        ...this.getAuthHeaders(),
        ...options?.headers,
      },
      // HttpOnly Cookie対応: 常にcredentials includeを使用
      // バックエンドはオプショナル認証なので、認証なしでも動作する
      credentials: 'include' as const,
      ...options,
    };

    // 詳細なAPI リクエストログは特定の環境変数でのみ有効
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
      // eslint-disable-next-line no-console
      console.log(`API ${method}: ${url}`);
      if (options?.body) {
        // eslint-disable-next-line no-console
        console.log('Body:', options.body);
      }
    }

    try {
      const response = await fetch(url, requestConfig);

      const duration = performance.now() - startTime;

      // 詳細なレスポンスログは特定の環境変数でのみ有効
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_ENABLE_API_LOGGING === 'true') {
        // eslint-disable-next-line no-console
        console.log(`API ${response.status}: ${method} ${url} (${duration.toFixed(2)}ms)`);
      }

      if (!response.ok) {
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

        // 開発環境でエラー情報をコンパクトに出力
        if (process.env.NODE_ENV === 'development') {
          // 404エラーは警告レベルで出力（よくある正常なケース）
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

        const error = new Error(errorMessage);
        
        // 監視システムにAPI エラーを記録
        if (typeof window !== 'undefined') {
          const { monitoring } = await import('../monitoring');
          monitoring.trackApiCall(endpoint, method, duration, response.status, error);
        }

        throw error;
      }

      const data = await response.json();

      // 詳細ログは特定の環境変数でのみ有効
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DETAILED_API_LOGGING === 'true') {
        // eslint-disable-next-line no-console
        console.log('Response Data:', data);
      }

      // データが存在しない場合やsuccess プロパティがない場合の処理
      if (!data) {
        const error = new Error('No data returned from API');
        if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DETAILED_API_LOGGING === 'true') {
          console.error(`API returned null/undefined data: ${method} ${url}`);
        }
        
        if (typeof window !== 'undefined') {
          const { monitoring } = await import('../monitoring');
          monitoring.trackApiCall(endpoint, method, duration, response.status, error);
        }
        
        throw error;
      }

      // success プロパティが存在し、false の場合
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

        if (typeof window !== 'undefined') {
          const { monitoring } = await import('../monitoring');
          monitoring.trackApiCall(endpoint, method, duration, response.status, error);
        }

        throw error;
      }

      // 監視システムに成功したAPI呼び出しを記録
      if (typeof window !== 'undefined') {
        const { monitoring } = await import('../monitoring');
        monitoring.trackApiCall(endpoint, method, duration, response.status);
      }

      // success プロパティがある場合は data.data を返す、ない場合は data をそのまま返す
      return 'success' in data ? data.data : data;
    } catch (error) {
      const duration = performance.now() - startTime;

      // ネットワークエラーを開発環境で適切にログ出力
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

      // 監視システムにネットワークエラーを記録
      if (typeof window !== 'undefined') {
        const { monitoring } = await import('../monitoring');
        monitoring.trackApiCall(
          endpoint, 
          method, 
          duration, 
          0, 
          error instanceof Error ? error : new Error(String(error))
        );
      }

      // Error オブジェクトでない場合は Error に変換
      if (!(error instanceof Error)) {
        throw new Error(typeof error === 'string' ? error : `API request failed: ${JSON.stringify(error)}`);
      }

      throw error;
    }
  }
}