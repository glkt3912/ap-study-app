'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { isUsernameFormat, isEmailFormat } from '@/utils/validation';

interface SignupFormProps {
  onModeChange: (_mode: 'login' | 'signup') => void;
}

export function SignupForm({ onModeChange }: SignupFormProps) {
  const { signup, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    name: '',
  });
  const [validationError, setValidationError] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // コンポーネントマウント時にAuthContextのエラーをローカル状態にコピーしてクリア
  useEffect(() => {
    if (error) {
      setAuthError(error);
    } else {
      setAuthError(null);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    // 必須項目チェック
    if (!formData.email.trim() || !formData.username.trim() || !formData.password.trim()) {
      setValidationError('メールアドレス、ユーザー名、パスワードは必須です');
      return;
    }

    // メールアドレス形式チェック
    if (!isEmailFormat(formData.email.trim())) {
      setValidationError('有効なメールアドレス形式で入力してください');
      return;
    }

    // ユーザー名形式チェック
    if (!isUsernameFormat(formData.username.trim())) {
      setValidationError('ユーザー名は3-20文字の英数字、アンダースコア、ハイフンのみ使用できます');
      return;
    }

    // パスワード長さチェック
    if (formData.password.length < 8) {
      setValidationError('パスワードは8文字以上で入力してください');
      return;
    }

    // パスワード確認チェック
    if (formData.password !== formData.confirmPassword) {
      setValidationError('パスワードが一致しません');
      return;
    }

    const success = await signup(formData.email, formData.password, formData.name || undefined, formData.username);

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
    setAuthError(null); // フォーム変更時にAuthContextのエラーもクリア
  };

  // フォームの入力完了状態をチェック（デバッグログ付き）
  const emailValid = formData.email.trim() !== '' && isEmailFormat(formData.email.trim());
  const usernameValid = formData.username.trim() !== '' && isUsernameFormat(formData.username.trim());
  const passwordValid = formData.password.trim() !== '' && formData.password.length >= 8;
  const confirmPasswordValid = formData.confirmPassword.trim() !== '';
  const passwordsMatch = formData.password === formData.confirmPassword;
  
  const isFormValid = emailValid && usernameValid && passwordValid && confirmPasswordValid && passwordsMatch;

  // デバッグ情報（開発環境のみ）
  if (process.env.NODE_ENV === 'development') {
    console.log('Form validation debug:', {
      email: formData.email,
      emailValid,
      username: formData.username,
      usernameValid,
      passwordLength: formData.password.length,
      passwordValid,
      confirmPasswordValid,
      passwordsMatch,
      isFormValid
    });
  }

  return (
    <div className='card-primary p-8 rounded-lg shadow-md w-full max-w-md mx-auto'>
      <h2 className='text-2xl font-bold text-center mb-6 text-primary'>アカウント作成</h2>

      <form onSubmit={handleSubmit} className='space-y-4'>
        <div>
          <label htmlFor='name' className='block text-sm font-medium text-secondary mb-1'>
            名前（任意）
          </label>
          <input
            type='text'
            id='name'
            name='name'
            value={formData.name}
            onChange={handleChange}
            className='input-primary'
            placeholder='お名前'
          />
        </div>

        <div>
          <label htmlFor='username' className='block text-sm font-medium text-secondary mb-1'>
            ユーザー名 * 
            <span className={`ml-2 text-xs ${
              formData.username.length === 0 ? 'text-gray-400' :
              usernameValid ? 'text-green-600' : 'text-red-600'
            }`}>
              ({formData.username.length}/20文字)
            </span>
          </label>
          <input
            type='text'
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
            className={`input-primary ${
              formData.username.length > 0 && !usernameValid 
                ? 'border-red-300 focus:border-red-500' 
                : ''
            }`}
            placeholder='3-20文字の英数字、_、-のみ'
          />
          {formData.username.length > 0 && !usernameValid && (
            <p className="text-xs text-red-600 mt-1">
              3-20文字の英数字、アンダースコア(_)、ハイフン(-)のみ使用できます
            </p>
          )}
        </div>

        <div>
          <label htmlFor='email' className='block text-sm font-medium text-secondary mb-1'>
            メールアドレス *
          </label>
          <input
            type='email'
            id='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
            className='input-primary'
            placeholder='email@example.com'
          />
        </div>

        <div>
          <label htmlFor='password' className='block text-sm font-medium text-secondary mb-1'>
            パスワード *
          </label>
          <input
            type='password'
            id='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            className='input-primary'
            placeholder='8文字以上のパスワード'
          />
        </div>

        <div>
          <label htmlFor='confirmPassword' className='block text-sm font-medium text-secondary mb-1'>
            パスワード確認 *
          </label>
          <input
            type='password'
            id='confirmPassword'
            name='confirmPassword'
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className='input-primary'
            placeholder='パスワードを再入力'
          />
        </div>

        {(validationError || authError) && (
          <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3'>
            <div className='flex items-start'>
              <div className='flex-shrink-0'>
                <span className='text-red-400'>⚠️</span>
              </div>
              <div className='ml-2'>
                <h4 className='text-sm font-medium text-red-800 dark:text-red-200'>
                  アカウント作成エラー
                </h4>
                <p className='text-sm text-red-600 dark:text-red-400 mt-1'>
                  {validationError || authError}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* デバッグ情報（開発環境のみ） */}
        {process.env.NODE_ENV === 'development' && (
          <div className="text-xs text-gray-500 p-2 border rounded">
            <p>フォーム有効性チェック:</p>
            <ul className="list-disc ml-4">
              <li className={emailValid ? 'text-green-600' : 'text-red-600'}>
                メール: {emailValid ? '✓' : '✗'} ({formData.email})
              </li>
              <li className={usernameValid ? 'text-green-600' : 'text-red-600'}>
                ユーザー名: {usernameValid ? '✓' : '✗'} ({formData.username})
              </li>
              <li className={passwordValid ? 'text-green-600' : 'text-red-600'}>
                パスワード: {passwordValid ? '✓' : '✗'} (長さ: {formData.password.length})
              </li>
              <li className={passwordsMatch ? 'text-green-600' : 'text-red-600'}>
                パスワード一致: {passwordsMatch ? '✓' : '✗'}
              </li>
            </ul>
            <p className={isFormValid ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
              総合: {isFormValid ? '有効' : '無効'}
            </p>
          </div>
        )}

        <button
          type='submit'
          disabled={isLoading || !isFormValid}
          className={`w-full hover-lift click-shrink focus-ring ${
            isLoading || !isFormValid 
              ? 'interactive-disabled' 
              : 'btn-success'
          }`}
        >
          {isLoading ? 'アカウント作成中...' : 'アカウント作成'}
        </button>

      </form>

      <div className='mt-6 text-center'>
        <p className='text-sm text-secondary'>
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
