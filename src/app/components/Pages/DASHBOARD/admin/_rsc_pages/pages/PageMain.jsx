'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { WidgetCard } from '../blogs/components/WidgetCard';
import { PageContentField } from './PageContentField';

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function PageMain() {
  const { control, setValue } = useFormContext();

  return (
    <div className="w-full flex-[3] gap-8 flex flex-col">
      <div className="relative">
        <Controller
          name="title"
          rules={{ required: 'Title is required' }}
          control={control}
          render={({ field, fieldState: { error } }) => (
            <>
              <WidgetCard contentClassName="p-0">
                <Input
                  id="cms-page-title"
                  placeholder="Enter Title"
                  className="border-0 px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md"
                  {...field}
                  onChange={(event) => {
                    field.onChange(event);
                    setValue('slug', slugify(event.target.value), { shouldDirty: true, shouldValidate: true });
                  }}
                />
              </WidgetCard>
              {error?.message && (
                <span className="text-destructive absolute bottom-0 left-0 translate-y-full px-1 block" style={{ fontSize: '0.875rem' }}>
                  {error.message}
                </span>
              )}
            </>
          )}
        />
      </div>

      <WidgetCard cardTitle="Slug">
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
              <Input id="cms-page-slug" aria-label="Slug" placeholder="about-weelp" {...field} onChange={(event) => field.onChange(slugify(event.target.value))} />
              {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
            </div>
          )}
        />
      </WidgetCard>

      <PageContentField />
    </div>
  );
}
