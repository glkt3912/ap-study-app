'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'

interface User {
  id: string
  name: string
  email?: string
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  userId: string
  isAuthenticated: boolean
  login: (_name: string, _email?: string) => void
  logout: () => void
  updateUser: (_updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  const generateUserId = useCallback((): string => {
    return `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
  }, [])

  const createNewUser = useCallback(() => {
    const newUser: User = {
      id: generateUserId(),
      name: 'ゲストユーザー',
      createdAt: new Date()
    }
    setUser(newUser)
    localStorage.setItem('ap-study-user', JSON.stringify(newUser))
  }, [generateUserId])

  // Generate or retrieve user ID
  useEffect(() => {
    const storedUser = localStorage.getItem('ap-study-user')
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser({
          ...userData,
          createdAt: new Date(userData.createdAt)
        })
      } catch {
        // Create new user if parsing fails
        createNewUser()
      }
    } else {
      // Create new user if none exists
      createNewUser()
    }
    
    setMounted(true)
  }, [createNewUser])

  const login = useCallback((name: string, email?: string) => {
    if (!user) return
    
    const updatedUser: User = {
      ...user,
      name,
      ...(email && { email })
    }
    
    setUser(updatedUser)
    localStorage.setItem('ap-study-user', JSON.stringify(updatedUser))
  }, [user])

  const logout = useCallback(() => {
    localStorage.removeItem('ap-study-user')
    createNewUser()
  }, [createNewUser])

  const updateUser = useCallback((updates: Partial<User>) => {
    if (!user) return
    
    const updatedUser = { ...user, ...updates }
    setUser(updatedUser)
    localStorage.setItem('ap-study-user', JSON.stringify(updatedUser))
  }, [user])

  // Prevent hydration mismatch
  if (!mounted) {
    return <>{children}</>
  }

  const contextValue: AuthContextType = {
    user,
    userId: user?.id || 'anonymous',
    isAuthenticated: user !== null && user.name !== 'ゲストユーザー',
    login,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}