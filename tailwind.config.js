/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // カスタムデザイントークン
      colors: {
        // アプリケーション固有のブランドカラー
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
        // セマンティックカラー
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
          950: '#450a0a',
        },
        // アクセシビリティ対応カラー
        'high-contrast': {
          primary: '#000000',
          secondary: '#333333',
          accent: '#0066cc',
          background: '#ffffff',
          surface: '#f5f5f5',
        },
      },
      // タイポグラフィ
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          '"Noto Sans"',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
          '"Noto Color Emoji"',
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          '"Cascadia Code"',
          '"Liberation Mono"',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Courier New"',
          'monospace',
        ],
        // 日本語フォント対応
        ja: [
          '"Hiragino Kaku Gothic ProN"',
          '"Hiragino Sans"',
          'Meiryo',
          'sans-serif',
        ],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      // Z-index管理システム
      zIndex: {
        // 基本レイヤー
        'base': '1',
        'content': '10',
        'header': '40',
        'sidebar': '30',
        // UIレイヤー
        'dropdown': '100',
        'sticky': '110',
        'fixed': '120',
        'overlay': '200',
        // インタラクション
        'modal-backdrop': '400',
        'modal': '410',
        'popover': '420',
        'tooltip': '430',
        // システム
        'notification': '500',
        'toast': '510',
        'loading': '600',
        'debug': '9999',
      },
      // カスタムブレークポイント（応用情報技術者試験学習アプリ用）
      screens: {
        'xs': '320px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        // 学習デバイス対応
        'mobile': '320px',
        'tablet': '768px',
        'laptop': '1024px',
        'desktop': '1280px',
        'wide': '1920px',
        // カスタム高さブレークポイント
        'h-sm': { 'raw': '(min-height: 640px)' },
        'h-md': { 'raw': '(min-height: 768px)' },
        'h-lg': { 'raw': '(min-height: 1024px)' },
      },
      // 高度なアニメーション設定
      animation: {
        // 基本アニメーション
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'fade-out': 'fadeOut 0.5s ease-in-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-left': 'slideInLeft 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'slide-in-down': 'slideInDown 0.3s ease-out',
        // マイクロインタラクション
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'wiggle': 'wiggle 0.5s ease-in-out',
        'shake': 'shake 0.5s ease-in-out',
        // 学習アプリ固有
        'correct-answer': 'correctAnswer 0.8s ease-out',
        'wrong-answer': 'wrongAnswer 0.6s ease-out',
        'progress-fill': 'progressFill 1s ease-out',
        'notification-slide': 'notificationSlide 0.4s ease-out',
        // パフォーマンス最適化版
        'scale-in-fast': 'scaleIn 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-out-fast': 'scaleOut 0.1s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInDown: {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translate3d(0,0,0)' },
          '40%, 43%': { transform: 'translate3d(0, -15px, 0)' },
          '70%': { transform: 'translate3d(0, -7px, 0)' },
          '90%': { transform: 'translate3d(0, -2px, 0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
        correctAnswer: {
          '0%': { transform: 'scale(1)', backgroundColor: 'rgb(34 197 94)' },
          '50%': { transform: 'scale(1.05)', backgroundColor: 'rgb(22 163 74)' },
          '100%': { transform: 'scale(1)', backgroundColor: 'rgb(34 197 94)' },
        },
        wrongAnswer: {
          '0%': { transform: 'translateX(0)', backgroundColor: 'rgb(239 68 68)' },
          '25%': { transform: 'translateX(-5px)', backgroundColor: 'rgb(220 38 38)' },
          '75%': { transform: 'translateX(5px)', backgroundColor: 'rgb(220 38 38)' },
          '100%': { transform: 'translateX(0)', backgroundColor: 'rgb(239 68 68)' },
        },
        progressFill: {
          '0%': { width: '0%' },
          '100%': { width: 'var(--progress-width, 0%)' },
        },
        notificationSlide: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
      // 拡張トランジション
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        'ease-in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'ease-out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'ease-in-out-back': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
      transitionDuration: {
        '0': '0ms',
        '75': '75ms',
        '100': '100ms',
        '150': '150ms',
        '200': '200ms',
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
        '1000': '1000ms',
        '2000': '2000ms',
      },
      // 空間・レイアウト
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      // シャドウシステム
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'gentle': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'moderate': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'strong': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'intense': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        'glow': '0 0 20px rgba(59, 130, 246, 0.5)',
        'glow-green': '0 0 20px rgba(34, 197, 94, 0.5)',
        'glow-red': '0 0 20px rgba(239, 68, 68, 0.5)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // または 'base'
    }),
    require('@tailwindcss/typography'),
    require('@tailwindcss/container-queries'),
    require('tailwindcss-animate'),
    // カスタムプラグイン
    function({ addUtilities, theme, addComponents }) {
      // Z-indexユーティリティ
      const zIndexUtilities = Object.fromEntries(
        Object.entries(theme('zIndex')).map(([key, value]) => [
          `.z-${key}`,
          { zIndex: value },
        ])
      );

      // アクセシビリティユーティリティ
      const accessibilityUtilities = {
        '.sr-only-focusable': {
          '&:not(:focus):not(:focus-within)': {
            position: 'absolute !important',
            width: '1px !important',
            height: '1px !important',
            padding: '0 !important',
            margin: '-1px !important',
            overflow: 'hidden !important',
            clip: 'rect(0, 0, 0, 0) !important',
            whiteSpace: 'nowrap !important',
            border: '0 !important',
          },
        },
        '.focus-ring': {
          '&:focus-visible': {
            outline: '2px solid rgb(59 130 246)',
            outlineOffset: '2px',
          },
        },
        '.focus-ring-inset': {
          '&:focus-visible': {
            outline: '2px solid rgb(59 130 246)',
            outlineOffset: '-2px',
          },
        },
      };

      // レスポンシブコンテナ
      const containerComponents = {
        '.container-primary': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          '@screen sm': {
            maxWidth: '640px',
            paddingLeft: '1.5rem',
            paddingRight: '1.5rem',
          },
          '@screen md': {
            maxWidth: '768px',
          },
          '@screen lg': {
            maxWidth: '1024px',
            paddingLeft: '2rem',
            paddingRight: '2rem',
          },
          '@screen xl': {
            maxWidth: '1280px',
          },
          '@screen 2xl': {
            maxWidth: '1536px',
          },
        },
        '.container-narrow': {
          width: '100%',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '1rem',
          paddingRight: '1rem',
          maxWidth: '48rem',
        },
      };

      // モーション設定対応
      const motionUtilities = {
        '@media (prefers-reduced-motion: reduce)': {
          '.motion-reduce-friendly': {
            animation: 'none !important',
            transition: 'none !important',
          },
        },
        '@media (prefers-reduced-motion: no-preference)': {
          '.motion-safe-animate': {
            animation: 'inherit',
            transition: 'inherit',
          },
        },
      };

      addUtilities({
        ...zIndexUtilities,
        ...accessibilityUtilities,
        ...motionUtilities,
      });

      // Study Plan Components
      const studyPlanComponents = {
        // Container Classes
        '.study-container': {
          '@apply max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg': {},
        },
        '.study-container-wide': {
          '@apply max-w-6xl mx-auto p-6': {},
        },
        '.study-card': {
          '@apply bg-white dark:bg-gray-800 rounded-lg shadow-subtle border dark:border-gray-700 p-6': {},
        },
        '.study-card-compact': {
          '@apply bg-white dark:bg-gray-800 rounded-lg shadow-subtle border dark:border-gray-700 p-4': {},
        },

        // Form Components
        '.study-input': {
          '@apply w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white focus-ring': {},
        },
        '.study-select': {
          '@apply w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white focus-ring': {},
        },
        '.study-textarea': {
          '@apply w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none focus-ring': {},
        },
        '.study-form-label': {
          '@apply block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2': {},
        },

        // Button Components
        '.study-btn-primary': {
          '@apply px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg transition-colors duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed': {},
        },
        '.study-btn-secondary': {
          '@apply px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors duration-200 focus-ring': {},
        },

        // Progress Components
        '.study-progress-bar': {
          '@apply w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2': {},
        },
        '.study-progress-fill': {
          '@apply h-2 rounded-full transition-all duration-700': {},
          transitionTimingFunction: 'cubic-bezier(0.19, 1, 0.22, 1)',
        },
        '.study-progress-fill-blue': {
          '@apply bg-brand-600': {},
        },
        '.study-progress-fill-green': {
          '@apply bg-success-500': {},
        },

        // Status Components
        '.study-badge': {
          '@apply px-2 py-1 text-xs rounded-full font-medium': {},
        },
        '.study-badge-popular': {
          '@apply bg-brand-600 text-white px-3 py-1 text-sm rounded-full': {},
        },
        '.study-badge-difficulty-beginner': {
          '@apply text-success-700 dark:text-success-400 bg-success-100 dark:bg-success-900/50': {},
        },
        '.study-badge-difficulty-intermediate': {
          '@apply text-warning-700 dark:text-warning-400 bg-warning-100 dark:bg-warning-900/50': {},
        },
        '.study-badge-difficulty-advanced': {
          '@apply text-error-700 dark:text-error-400 bg-error-100 dark:bg-error-900/50': {},
        },

        // Priority Badges
        '.study-badge-priority-high': {
          '@apply px-3 py-1 text-sm rounded-full bg-error-100 dark:bg-error-900/50 text-error-800 dark:text-error-200': {},
        },
        '.study-badge-priority-medium': {
          '@apply px-3 py-1 text-sm rounded-full bg-warning-100 dark:bg-warning-900/50 text-warning-800 dark:text-warning-200': {},
        },
        '.study-badge-priority-low': {
          '@apply px-3 py-1 text-sm rounded-full bg-brand-100 dark:bg-brand-900/50 text-brand-800 dark:text-brand-200': {},
        },

        // Statistics Components
        '.study-stat-box': {
          '@apply text-center': {},
        },
        '.study-stat-number': {
          '@apply text-2xl font-bold': {},
        },
        '.study-stat-label': {
          '@apply text-sm text-gray-500 dark:text-gray-400': {},
        },

        // Card Components
        '.study-template-card': {
          '@apply relative p-6 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-gentle focus-ring': {},
        },
        '.study-template-card-default': {
          '@apply border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-brand-300 dark:hover:border-brand-500': {},
        },
        '.study-template-card-popular': {
          '@apply border-brand-200 dark:border-brand-600 bg-brand-50 dark:bg-brand-900/10 hover:border-brand-300 dark:hover:border-brand-500': {},
        },

        // Recommendation Components
        '.study-recommendation-card': {
          '@apply p-6 rounded-lg border animate-fade-in': {},
        },
        '.study-recommendation-card-high': {
          '@apply border-error-200 dark:border-error-500 bg-error-50 dark:bg-error-900/20': {},
        },
        '.study-recommendation-card-medium': {
          '@apply border-warning-200 dark:border-warning-500 bg-warning-50 dark:bg-warning-900/20': {},
        },
        '.study-recommendation-card-low': {
          '@apply border-brand-200 dark:border-brand-500 bg-brand-50 dark:bg-brand-900/20': {},
        },

        // State Components
        '.study-loading': {
          '@apply flex items-center justify-center p-8': {},
        },
        '.study-loading-compact': {
          '@apply flex items-center justify-center p-4': {},
        },
        '.study-loading-spinner': {
          '@apply animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600': {},
        },
        '.study-loading-spinner-compact': {
          '@apply animate-spin rounded-full h-6 w-6 border-b-2 border-brand-600': {},
        },
        '.study-error': {
          '@apply p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-500 rounded-lg': {},
        },
        '.study-error-text': {
          '@apply text-error-700 dark:text-error-300 text-sm': {},
        },
        '.study-error-button': {
          '@apply mt-2 text-sm text-error-600 dark:text-error-400 hover:underline focus-ring': {},
        },
        '.study-empty': {
          '@apply p-4 text-gray-500 dark:text-gray-400 text-sm text-center': {},
        },

        // Milestone Components
        '.study-milestone-card': {
          '@apply flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-fade-in': {},
        },

        // Typography
        '.study-title': {
          '@apply text-2xl font-bold text-gray-900 dark:text-white': {},
        },
        '.study-subtitle': {
          '@apply text-lg font-semibold text-gray-900 dark:text-white mb-4': {},
        },
        '.study-section-title': {
          '@apply font-medium text-gray-900 dark:text-white mb-2': {},
        },
        '.study-description': {
          '@apply text-gray-600 dark:text-gray-300 mt-2': {},
        },
        '.study-meta': {
          '@apply text-sm text-gray-500 dark:text-gray-400': {},
        },

        // Achievement Colors
        '.study-achievement-high': {
          '@apply text-success-600 dark:text-success-400': {},
        },
        '.study-achievement-medium': {
          '@apply text-warning-600 dark:text-warning-400': {},
        },
        '.study-achievement-low': {
          '@apply text-error-600 dark:text-error-400': {},
        },

        // Streak Colors
        '.study-streak-good': {
          '@apply text-success-600 dark:text-success-400': {},
        },
        '.study-streak-warning': {
          '@apply text-warning-600 dark:text-warning-400': {},
        },
        '.study-streak-danger': {
          '@apply text-error-600 dark:text-error-400': {},
        },
      };

      addComponents({
        ...containerComponents,
        ...studyPlanComponents,
      });
    },
  ],
};
