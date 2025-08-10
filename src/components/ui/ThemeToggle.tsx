'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClick = () => {
    toggleTheme();
  };

  if (!mounted) {
    return <div className='w-9 h-9 bg-gray-100 rounded-lg animate-pulse' />;
  }

  return (
    <button
      onClick={handleClick}
      className='btn-primary hover-lift click-shrink focus-ring text-lg font-medium'
    >
      <span className='text-xl mr-2'>{theme === 'light' ? '🌙' : '☀️'}</span>
      {theme === 'light' ? 'Dark' : 'Light'}
    </button>
  );
}
