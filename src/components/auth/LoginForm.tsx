'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onModeChange: (_mode: 'login' | 'signup') => void;
}

export function LoginForm({ onModeChange }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      return;
    }

    const success = await login(formData.email, formData.password);
    if (success) {
      // ログイン成功時は親コンポーネントで処理される
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-auto'>
      <h2 className='text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white'>ログイン</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            メールアドレス
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
            placeholder='email@example.com'
          />
        </div>

        <div>
          <label htmlFor='password' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            パスワード
          </label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
            placeholder='パスワードを入力'
          />
        </div>

        {error && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3'>
            <p className='text-sm text-red-600 dark:text-red-400'>{error}</p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading || !formData.email || !formData.password}
          className='w-full bg-blue-600 dark:bg-blue-700 text-white py-2 px-4 rounded-md hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className='mt-6 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          アカウントをお持ちでない方は{' '}
          <button
            onClick={() => onModeChange('signup')}
            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline'
          >
            アカウント作成
          </button>
        </p>
      </div>

      <div className='mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md'>
        <p className='text-xs text-gray-600 dark:text-gray-300 text-center'>開発環境用: test@example.com / test1234</p>
      </div>
    </div>
  );
}
