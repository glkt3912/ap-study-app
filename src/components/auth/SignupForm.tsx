'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormProps {
  onModeChange: (_mode: 'login' | 'signup') => void;
}

export function SignupForm({ onModeChange }: SignupFormProps) {
  const { signup, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [validationError, setValidationError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.email || !formData.password) {
      setValidationError('メールアドレスとパスワードは必須です');
      return;
    }

    if (formData.password.length < 8) {
      setValidationError('パスワードは8文字以上で入力してください');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setValidationError('パスワードが一致しません');
      return;
    }

    const success = await signup(formData.email, formData.password, formData.name || undefined);

    if (success) {
      // サインアップ成功時は親コンポーネントで処理される
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setValidationError('');
  };

  return (
    <div className='bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-auto'>
      <h2 className='text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white'>アカウント作成</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='name' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            名前（任意）
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
            placeholder='お名前'
          />
        </div>

        <div>
          <label htmlFor='email' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            メールアドレス *
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
            パスワード *
          </label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
            placeholder='8文字以上のパスワード'
          />
        </div>

        <div>
          <label htmlFor='confirmPassword' className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1'>
            パスワード確認 *
          </label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400'
            placeholder='パスワードを再入力'
          />
        </div>

        {(validationError || error) && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3'>
            <p className='text-sm text-red-600 dark:text-red-400'>{validationError || error}</p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading || !formData.email || !formData.password}
          className='w-full bg-green-600 dark:bg-green-700 text-white py-2 px-4 rounded-md hover:bg-green-700 dark:hover:bg-green-600 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-200'
        >
          {isLoading ? 'アカウント作成中...' : 'アカウント作成'}
        </button>
      </form>

      <div className='mt-6 text-center'>
        <p className='text-sm text-gray-600 dark:text-gray-300'>
          すでにアカウントをお持ちの方は{' '}
          <button
            onClick={() => onModeChange('login')}
            className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline'
          >
            ログイン
          </button>
        </p>
      </div>
    </div>
  );
}
