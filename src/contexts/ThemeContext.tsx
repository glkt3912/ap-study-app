'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [mounted, setMounted] = useState(false)

  // ローカルストレージからテーマを復元
  useEffect(() => {
    const savedTheme = localStorage.getItem('ap-study-theme') as Theme
    let initialTheme: Theme
    
    if (savedTheme) {
      initialTheme = savedTheme
    } else {
      // システムの設定を確認
      initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    
    setTheme(initialTheme)
    
    // 初期テーマを即座に適用
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    setMounted(true)
    console.log('Initial theme set to:', initialTheme)
  }, [])

  // テーマが変更されたときの処理
  useEffect(() => {
    console.log('Theme effect triggered, mounted:', mounted, 'theme:', theme)
    // DOM操作は常に実行（mountedに関係なく）
    localStorage.setItem('ap-study-theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      console.log('Added dark class to html element')
    } else {
      document.documentElement.classList.remove('dark')
      console.log('Removed dark class from html element')
    }
    console.log('HTML element classes:', document.documentElement.classList.toString())
  }, [theme])

  const toggleTheme = () => {
    console.log('toggleTheme called, current theme:', theme)
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light'
      console.log('Setting theme to:', newTheme)
      return newTheme
    })
  }

  // Hydration mismatchを防ぐため、mounted前は何もしない
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}