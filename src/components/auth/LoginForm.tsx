'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface LoginFormProps {
  onModeChange: (_mode: 'login' | 'signup') => void;
}

export function LoginForm({ onModeChange }: LoginFormProps) {
  const { login, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    emailOrUsername: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.emailOrUsername || !formData.password) {
      return;
    }

    const success = await login(formData.emailOrUsername, formData.password);
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
    <div className='card-primary p-8 rounded-lg shadow-md w-full max-w-md mx-auto'>
      <h2 className='text-2xl font-bold text-center mb-6 text-primary'>ログイン</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='emailOrUsername' className='label-primary'>
            メールアドレスまたはユーザー名
          </label>
          <input
            type='text'
            id='emailOrUsername'
            name='emailOrUsername'
            value={formData.emailOrUsername}
            onChange={handleChange}
            required
            className='input-primary'
            placeholder='email@example.com または username'
          />
        </div>

        <div>
          <label htmlFor='password' className='label-primary'>
            パスワード
          </label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            className='input-primary'
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
          disabled={isLoading || !formData.emailOrUsername || !formData.password}
          className={`w-full hover-lift click-shrink focus-ring ${
            isLoading || !formData.emailOrUsername || !formData.password
              ? 'interactive-disabled'
              : 'btn-primary'
          }`}
        >
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>
      </form>

      <div className='mt-6 text-center'>
        <p className='text-sm text-secondary'>
          アカウントをお持ちでない方は{' '}
          <button
            onClick={() => onModeChange('signup')}
            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline'
          >
            アカウント作成
          </button>
        </p>
      </div>

      <div className='mt-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-md'>
        <p className='text-xs text-secondary text-center'>開発環境用: test@example.com またはユーザー名 / test1234</p>
      </div>
    </div>
  );
}
