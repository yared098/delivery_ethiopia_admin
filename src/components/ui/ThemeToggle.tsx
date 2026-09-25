import { Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore, type Theme } from '@/lib/theme';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Theme; icon: any; label: string }[] = [
  { value: 'light', icon: Sun, label: 'Light' },
  { value: 'dark', icon: Moon, label: 'Dark' },
  { value: 'system', icon: Monitor, label: 'System' },
];

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return (
    <div className="inline-flex p-0.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = theme === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            title={opt.label}
            className={cn(
              'p-1.5 rounded-md transition-colors',
              active
                ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-100',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}