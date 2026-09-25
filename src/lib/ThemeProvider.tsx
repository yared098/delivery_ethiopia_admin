import { useEffect } from 'react';
import { useThemeStore, applyTheme } from './theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  // Apply on mount + whenever theme changes
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen to OS preference changes when in "system" mode
  useEffect(() => {
    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyTheme('system');
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return <>{children}</>;
}