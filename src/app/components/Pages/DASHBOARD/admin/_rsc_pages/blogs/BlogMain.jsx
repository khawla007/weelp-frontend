import React from 'react';
import Tiptap from './components/Tiptap';
import { useFormContext, Controller } from 'react-hook-form';
import { WidgetCard } from './components/WidgetCard';
import { Input } from '@/components/ui/input';

export const BlogMain = ({ content }) => {
  const { control } = useFormContext(); // context provider

  return (
    <div className="w-full flex-[3] gap-8 flex flex-col">
      {/* Blog Title */}
      <WidgetCard>
        <Controller
          name="name"
          rules={{ required: 'Field Required' }}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <div className="space-y-2 pt-2">
                <Input placeholder="Enter Title" className="border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 w-full" {...field} />
                {error?.message && <span className="text-red-400">{error?.message}</span>}
              </div>
            );
          }}
        />
      </WidgetCard>

      {/* Content Editor */}
      <Controller
        name="content"
        control={control}
        render={({ field }) => {
          return <Tiptap content={content} onChange={field.onChange} {...field} />;
        }}
      />
    </div>
  );
};
