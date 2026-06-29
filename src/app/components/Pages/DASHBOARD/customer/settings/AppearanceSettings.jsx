'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/lib/store/uiStore';
import { useIsClient } from '@/hooks/useIsClient';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  font: z.string().min(1, 'Font selection is required'),
});

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', icon: Sun, description: 'Bright surfaces, dark text.' },
  { value: 'dark', label: 'Dark', icon: Moon, description: 'Dim surfaces, light text.' },
];

export function AppearanceSettings() {
  const { font, setFont } = useUIStore();
  const { theme, resolvedTheme, setTheme } = useTheme();
  const { toast } = useToast();
  const isClient = useIsClient();
  const activeTheme = isClient ? theme : 'light';

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { font },
  });
  const { isDirty } = form.formState;

  useEffect(() => {
    if (theme === 'system') {
      setTheme(resolvedTheme === 'dark' ? 'dark' : 'light');
    }
  }, [resolvedTheme, setTheme, theme]);

  const onSubmit = (data) => {
    setFont(data.font);
    toast({ title: 'Settings Updated Successfully' });
  };

  const handleThemeSelect = (value) => {
    setTheme(value);
    toast({ title: `Theme set to ${value}` });
  };

  return (
    <Card className="shadow-none border-none bg-transparent space-y-8">
      <div className="space-y-2">
        <CardTitle className="text-foreground font-semibold text-lg">Appearance</CardTitle>
        <CardDescription className="text-muted-foreground text-sm">Customize the appearance of the app.</CardDescription>
      </div>

      <fieldset className="space-y-3" aria-label="Theme preference">
        <Label asChild>
          <legend>Theme</legend>
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
          {THEME_OPTIONS.map(({ value, label, icon: Icon, description }) => {
            const isActive = activeTheme === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => handleThemeSelect(value)}
                aria-pressed={isActive}
                className={cn(
                  'group flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2 motion-reduce:transition-none',
                  isActive ? 'border-weelp-sage-deep bg-accent' : 'border-border bg-card hover:bg-accent/40',
                )}
              >
                <span className="flex items-center gap-2 text-foreground">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{label}</span>
                </span>
                <span className="text-xs text-muted-foreground">{description}</span>
              </button>
            );
          })}
        </div>
        <p className="text-sm text-muted-foreground">Choose how the dashboard looks.</p>
      </fieldset>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="font"
            render={({ field }) => (
              <FormItem>
                <Label>Font</Label>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="max-w-56 w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                <FormDescription className="text-sm">Set the font for dashboard</FormDescription>
              </FormItem>
            )}
          />

          <Button disabled={!isDirty} type="submit" className="bg-weelp-sage-deep">
            Update Preferences
          </Button>
        </form>
      </Form>
    </Card>
  );
}
