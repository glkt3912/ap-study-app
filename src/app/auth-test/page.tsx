'use client';

import { useState } from 'react';

interface AuthTestResult {
  action: string;
  status: 'pending' | 'success' | 'error';
  responseTime?: number;
  statusCode?: number;
  error?: string;
  data?: any;
}

export default function AuthTestPage() {
  const [results, setResults] = useState<AuthTestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testPassword, setTestPassword] = useState('testpassword123');
  const [testName, setTestName] = useState('Test User');

  const generateUniqueEmail = () => {
    const timestamp = Date.now();
    return `test-${timestamp}@example.com`;
  };

  const addResult = (result: AuthTestResult) => {
    setResults(prev => [...prev, result]);
  };

  const testDirectSignupAPI = async () => {
    const email = generateUniqueEmail();
    setTestEmail(email);
    const startTime = performance.now();
    
    addResult({
      action: 'Direct API Signup',
      status: 'pending'
    });

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Testing signup with:', { email, password: testPassword, name: testName });
        console.log('API URL:', API_BASE_URL);
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: testPassword,
          name: testName
        }),
      });

      const responseTime = Math.round(performance.now() - startTime);
      const data = await response.json();

      if (process.env.NODE_ENV === 'development') {
        console.log('Signup response:', { status: response.status, data });
      }

      if (response.ok) {
        setResults(prev => prev.map(r => 
          r.action === 'Direct API Signup' && r.status === 'pending'
            ? {
                ...r,
                status: 'success' as const,
                responseTime,
                statusCode: response.status,
                data
              }
            : r
        ));
      } else {
        setResults(prev => prev.map(r => 
          r.action === 'Direct API Signup' && r.status === 'pending'
            ? {
                ...r,
                status: 'error' as const,
                responseTime,
                statusCode: response.status,
                error: data.error || data.message || 'Signup failed',
                data
              }
            : r
        ));
      }
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      if (process.env.NODE_ENV === 'development') {
        console.error('Signup error:', error);
      }
      
      setResults(prev => prev.map(r => 
        r.action === 'Direct API Signup' && r.status === 'pending'
          ? {
              ...r,
              status: 'error' as const,
              responseTime,
              error: error instanceof Error ? error.message : 'Network error'
            }
          : r
      ));
    }
  };

  const testAuthContextSignup = async () => {
    const email = generateUniqueEmail();
    const startTime = performance.now();
    
    addResult({
      action: 'AuthContext Signup',
      status: 'pending'
    });

    try {
      // AuthContext signup関数のシミュレーション
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Testing AuthContext signup with:', { email, password: testPassword, name: testName });
      }

      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: testPassword, name: testName }),
      });

      const data = await response.json();
      const responseTime = Math.round(performance.now() - startTime);

      if (process.env.NODE_ENV === 'development') {
        console.log('AuthContext signup response:', { status: response.ok, data });
      }

      if (response.ok && data.success) {
        // AuthContextと同じ処理
        const { token: newToken, user: userData } = data.data;
        if (process.env.NODE_ENV === 'development') {
          console.log('Success - Token and user data received:', { token: newToken.substring(0, 20) + '...', user: userData });
        }
        
        setResults(prev => prev.map(r => 
          r.action === 'AuthContext Signup' && r.status === 'pending'
            ? {
                ...r,
                status: 'success' as const,
                responseTime,
                statusCode: response.status,
                data: { token: newToken.substring(0, 20) + '...', user: userData }
              }
            : r
        ));
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log('Failed - Error from server:', data.message || data.error);
        }
        
        setResults(prev => prev.map(r => 
          r.action === 'AuthContext Signup' && r.status === 'pending'
            ? {
                ...r,
                status: 'error' as const,
                responseTime,
                statusCode: response.status,
                error: data.message || 'アカウント作成に失敗しました',
                data
              }
            : r
        ));
      }
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      if (process.env.NODE_ENV === 'development') {
        console.error('AuthContext signup error:', error);
      }
      
      setResults(prev => prev.map(r => 
        r.action === 'AuthContext Signup' && r.status === 'pending'
          ? {
              ...r,
              status: 'error' as const,
              responseTime,
              error: 'ネットワークエラーが発生しました'
            }
          : r
      ));
    }
  };

  const testBackendHealth = async () => {
    const startTime = performance.now();
    
    addResult({
      action: 'Backend Health Check',
      status: 'pending'
    });

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      const response = await fetch(`${API_BASE_URL}/api/monitoring/health`);
      const data = await response.json();
      const responseTime = Math.round(performance.now() - startTime);

      setResults(prev => prev.map(r => 
        r.action === 'Backend Health Check' && r.status === 'pending'
          ? {
              ...r,
              status: response.ok ? 'success' as const : 'error' as const,
              responseTime,
              statusCode: response.status,
              data: response.ok ? data : { error: 'Health check failed' }
            }
          : r
      ));
    } catch (error) {
      const responseTime = Math.round(performance.now() - startTime);
      
      setResults(prev => prev.map(r => 
        r.action === 'Backend Health Check' && r.status === 'pending'
          ? {
              ...r,
              status: 'error' as const,
              responseTime,
              error: error instanceof Error ? error.message : 'Network error'
            }
          : r
      ));
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setResults([]);

    await testBackendHealth();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testDirectSignupAPI();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAuthContextSignup();
    
    setIsRunning(false);
  };

  const clearResults = () => {
    setResults([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'pending': return '⏳';
      default: return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 dark:text-green-400';
      case 'error': return 'text-red-600 dark:text-red-400';
      case 'pending': return 'text-yellow-600 dark:text-yellow-400';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-slate-900 p-8'>
      <div className='max-w-4xl mx-auto'>
        <div className='flex justify-between items-center mb-8'>
          <h1 className='text-3xl font-bold text-slate-900 dark:text-white'>🔐 Authentication Test</h1>
          <div className='flex gap-4'>
            <button
              onClick={clearResults}
              disabled={isRunning}
              className='px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600 disabled:opacity-50'
            >
              Clear Results
            </button>
            <button
              onClick={runAllTests}
              disabled={isRunning}
              className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50'
            >
              {isRunning ? '🔄 Testing...' : '🚀 Run Tests'}
            </button>
          </div>
        </div>

        {/* Test Configuration */}
        <div className='bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8'>
          <h2 className='text-xl font-semibold text-slate-900 dark:text-white mb-4'>Test Configuration</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                Test Email (auto-generated)
              </label>
              <input
                type='text'
                value={testEmail || 'Will be auto-generated'}
                readOnly
                className='w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                Password
              </label>
              <input
                type='password'
                value={testPassword}
                onChange={(e) => setTestPassword(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
              />
            </div>
            <div>
              <label className='block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2'>
                Name
              </label>
              <input
                type='text'
                value={testName}
                onChange={(e) => setTestName(e.target.value)}
                className='w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
              />
            </div>
          </div>
          <div className='mt-4 text-sm text-slate-600 dark:text-slate-400'>
            <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}</p>
          </div>
        </div>

        {/* Test Results */}
        <div className='space-y-4'>
          {results.map((result, index) => (
            <div key={index} className='bg-white dark:bg-slate-800 rounded-lg shadow p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center'>
                  <span className='text-2xl mr-3'>{getStatusIcon(result.status)}</span>
                  <div>
                    <h3 className='text-lg font-semibold text-slate-900 dark:text-white'>
                      {result.action}
                    </h3>
                  </div>
                </div>
                <div className='text-right'>
                  <div className={`font-bold ${getStatusColor(result.status)}`}>
                    {result.status.toUpperCase()}
                  </div>
                  {result.responseTime && (
                    <div className='text-sm text-slate-600 dark:text-slate-400'>
                      {result.responseTime}ms
                    </div>
                  )}
                </div>
              </div>

              {result.statusCode && (
                <div className='mb-2'>
                  <span className='text-sm font-medium text-slate-700 dark:text-slate-300'>Status Code:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                    result.statusCode >= 200 && result.statusCode < 300
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {result.statusCode}
                  </span>
                </div>
              )}

              {result.error && (
                <div className='mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded'>
                  <h4 className='font-medium text-red-800 dark:text-red-200 mb-1'>Error:</h4>
                  <code className='text-sm text-red-700 dark:text-red-300'>{result.error}</code>
                </div>
              )}

              {result.data && (
                <div className='mt-4'>
                  <h4 className='font-medium text-slate-700 dark:text-slate-300 mb-2'>Response Data:</h4>
                  <pre className='bg-slate-100 dark:bg-slate-700 p-3 rounded text-xs overflow-x-auto'>
                    <code className='text-slate-800 dark:text-slate-200'>
                      {JSON.stringify(result.data, null, 2)}
                    </code>
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {results.length === 0 && !isRunning && (
          <div className='text-center py-12'>
            <p className='text-slate-600 dark:text-slate-400 text-lg'>
              No test results yet. Click &quot;Run Tests&quot; to start authentication testing.
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className='mt-8 text-center'>
          <button
            onClick={() => window.history.back()}
            className='px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded hover:bg-slate-300 dark:hover:bg-slate-600'
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}