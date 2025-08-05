'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { LoginForm } from './LoginForm'
import { SignupForm } from './SignupForm'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { isAuthenticated } = useAuth()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  // 認証完了時にモーダルを閉じる
  useEffect(() => {
    if (isAuthenticated) {
      onClose()
    }
  }, [isAuthenticated, onClose])

  // モーダルが開かれた時にモードをリセット
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
    }
  }, [isOpen, initialMode])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative">
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 w-8 h-8 bg-gray-600 text-white rounded-full flex items-center justify-center hover:bg-gray-700 z-10"
          aria-label="閉じる"
        >
          ✕
        </button>
        
        {/* フォームコンテンツ */}
        {mode === 'login' ? (
          <LoginForm onModeChange={setMode} />
        ) : (
          <SignupForm onModeChange={setMode} />
        )}
      </div>
    </div>
  )
}