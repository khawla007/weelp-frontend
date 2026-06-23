import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { WidgetCard } from './components/WidgetCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '../shared/RichTextEditor';
import { Medialibrary } from '../media/MediaLibrary';
import { hasEditorContent } from '../shared/richTextContent';

const slugify = (value = '') =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const BlogMain = ({ content }) => {
  const { control, getValues, setValue } = useFormContext(); // context provider

  return (
    <div className="w-full flex-[3] gap-8 flex flex-col">
      {/* Blog Title */}
      <div className="relative">
        <Controller
          name="name"
          rules={{ required: 'Field Required' }}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <>
                <WidgetCard contentClassName="p-0">
                  <Input
                    placeholder="Enter Title"
                    className="border-0 px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      if (!getValues('slug')) {
                        setValue('slug', slugify(event.target.value), { shouldDirty: true, shouldValidate: true });
                      }
                    }}
                  />
                </WidgetCard>
                {error?.message && (
                  <span className="text-destructive absolute bottom-0 left-0 translate-y-full px-1 block" style={{ fontSize: '0.875rem' }}>
                    {error?.message}
                  </span>
                )}
              </>
            );
          }}
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
              <Label htmlFor="blog-slug">URL slug</Label>
              <Input id="blog-slug" placeholder="best-places-to-visit" {...field} onChange={(event) => field.onChange(slugify(event.target.value))} />
              {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
            </div>
          )}
        />
      </WidgetCard>

      {/* Content Editor */}
      <Controller
        name="content"
        control={control}
        rules={{ validate: (value) => hasEditorContent(value) || 'Content is required' }}
        render={({ field, fieldState: { error } }) => (
          <div className="relative">
            <RichTextEditor
              content={field.value || content}
              onChange={field.onChange}
              mediaPicker={({ onSelect, close }) => (
                <Medialibrary
                  closeDialog={close}
                  alreadySelectedImages={[]}
                  selectionMode="single"
                  onSelectImages={({ added }) => {
                    const selected = added?.[0];
                    if (selected) onSelect(selected);
                  }}
                />
              )}
            />
            {error?.message && (
              <span className="text-destructive absolute bottom-0 left-0 translate-y-full px-1 block" style={{ fontSize: '0.875rem' }}>
                {error?.message}
              </span>
            )}
          </div>
        )}
      />
    </div>
  );
};
