'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

interface Props {
  className?: string;
}

export default function ThemeToggle({ className = '' }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Dark/Light Mode"
      className={`relative p-2 rounded-lg border transition-colors duration-200 flex items-center justify-center shrink-0 ${
        theme === 'dark'
          ? 'bg-[#1F232D] border-[#2A2F3A] text-[#F9FAFB] hover:bg-[#2A2F3A]'
          : 'bg-white border-[#E5E7EB] text-[#111827] hover:bg-[#F3F4F6]'
      } ${className}`}
    >
      {theme === 'dark' ? (
        <Sun className="w-4 h-4" />
      ) : (
        <Moon className="w-4 h-4" />
      )}
    </button>
  );
}
