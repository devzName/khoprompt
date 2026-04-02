import { useState, useEffect } from 'react';

/**
 * Custom hook: reads/writes localStorage 'theme' key, toggles html.dark class.
 * On mount: checks localStorage first, then falls back to system preference.
 * Returns [isDark, setIsDark] tuple.
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return [isDark, setIsDark];
}
