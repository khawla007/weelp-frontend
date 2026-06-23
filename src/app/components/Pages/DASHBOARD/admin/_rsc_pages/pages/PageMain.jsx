'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WidgetCard } from '../blogs/components/WidgetCard';
import { PageContentField } from './PageContentField';

export function PageMain() {
  const { control } = useFormContext();

  return (
    <div className="w-full flex-[3] gap-6 flex flex-col">
      <WidgetCard cardTitle="Page details">
        <div className="grid gap-4">
          <Controller
            name="title"
            rules={{ required: 'Title is required' }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label htmlFor="cms-page-title">Title</Label>
                <Input id="cms-page-title" placeholder="About Weelp" {...field} />
                {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
              </div>
            )}
          />

          <Controller
            name="slug"
            rules={{
              required: 'Slug is required',
              pattern: {
                value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                message: 'Use lowercase letters, numbers, and hyphens',
              },
            }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label htmlFor="cms-page-slug">Slug</Label>
                <Input id="cms-page-slug" placeholder="about-weelp" {...field} />
                {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
              </div>
            )}
          />

          <Controller
            name="excerpt"
            rules={{ maxLength: { value: 300, message: 'Excerpt too long (max 300 characters)' } }}
            control={control}
            render={({ field, fieldState: { error } }) => (
              <div className="space-y-2">
                <Label htmlFor="cms-page-excerpt">Excerpt</Label>
                <Textarea id="cms-page-excerpt" rows={4} placeholder="Short page summary for listings and SEO fallbacks" {...field} />
                {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
              </div>
            )}
          />
        </div>
      </WidgetCard>

      <PageContentField />
    </div>
  );
}
