'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsClient } from '@/hooks/useIsClient';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className = '', compact = false }) {
  const isClient = useIsClient();
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = isClient && resolvedTheme === 'dark';
  const TriggerIcon = !isClient ? Sun : resolvedTheme === 'dark' ? Moon : Sun;
  const option = isDark ? { label: 'Light', value: 'light', Icon: Sun } : { label: 'Dark', value: 'dark', Icon: Moon };
  const handleOpenChange = (open) => {
    if (open) {
      window.dispatchEvent(new CustomEvent('weelp-header-dropdown-open', { detail: { source: 'theme' } }));
    }
  };

  return (
    <DropdownMenu modal={false} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        className={cn(
          'flex items-center justify-center rounded-full text-foreground transition-colors hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 motion-reduce:transition-none',
          compact ? 'h-9 w-9' : 'h-11 w-11',
          className,
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
