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
    const handleThemeChange = () => {
      const saved = localStorage.getItem('theme') === 'dark';
      setIsDark(prev => {
        if (prev === saved) return prev;
        return saved;
      });
    };

    window.addEventListener('themeChange', handleThemeChange);
    return () => window.removeEventListener('themeChange', handleThemeChange);
  }, []);

  useEffect(() => {
    const currentTheme = isDark ? 'dark' : 'light';
    const savedTheme = localStorage.getItem('theme');
    
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    if (savedTheme !== currentTheme) {
      localStorage.setItem('theme', currentTheme);
      window.dispatchEvent(new Event('themeChange'));
    }
  }, [isDark]);

  return [isDark, setIsDark];
}
