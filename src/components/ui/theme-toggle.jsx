'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsClient } from '@/hooks/useIsClient';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { DEFAULT_THEME, resolveExplicitTheme } from '@/app/components/Layout/themeConfig';

export function ThemeToggle({ className = '', compact = false }) {
  const isClient = useIsClient();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const activeTheme = isClient ? resolveExplicitTheme(theme ?? resolvedTheme) : DEFAULT_THEME;
  const isDark = activeTheme === 'dark';
  const TriggerIcon = isDark ? Moon : Sun;
  const option = isDark ? { label: 'Light', value: 'light', Icon: Sun } : { label: 'Dark', value: 'dark', Icon: Moon };
  const handleOpenChange = (open) => {
    if (open) {
      window.dispatchEvent(new CustomEvent('weelp-header-dropdown-open', { detail: { source: 'theme' } }));
    }
  };

  return (
    <DropdownMenu modal={false} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        aria-label={`Change theme, currently ${activeTheme}`}
        className={cn(
          'flex items-center justify-center rounded-full text-foreground transition-colors hover:text-weelp-sage-text focus-visible:outline-none motion-reduce:transition-none',
          compact ? 'h-9 w-9' : 'h-11 w-11',
          className,
          'focus-visible:ring-2 focus-visible:ring-weelp-sage-text focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
      >
        <TriggerIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onSelect={() => setTheme(option.value)}>
          <option.Icon className="mr-2 h-4 w-4" />
          <span>{option.label}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
