'use client';

import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useIsClient } from '@/hooks/useIsClient';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className = '', compact = false }) {
  const isClient = useIsClient();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const TriggerIcon = !isClient ? Sun : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Toggle theme"
        className={cn(
          'flex items-center justify-center rounded-full text-foreground transition-colors hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2 motion-reduce:transition-none',
          compact ? 'h-9 w-9' : 'h-11 w-11',
          className,
        )}
      >
        <TriggerIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        <DropdownMenuItem onSelect={() => setTheme('light')} data-active={theme === 'light'} className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground">
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('dark')} data-active={theme === 'dark'} className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground">
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme('system')} data-active={theme === 'system'} className="data-[active=true]:bg-accent data-[active=true]:text-accent-foreground">
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
