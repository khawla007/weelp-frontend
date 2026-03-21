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
      <div className="relative">
        <Controller
          name="name"
          rules={{ required: 'Field Required' }}
          control={control}
          render={({ field, fieldState: { error } }) => {
            return (
              <>
                <WidgetCard contentClassName="p-0">
                  <Input placeholder="Enter Title" className="border-0 px-4 py-3 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-md" {...field} />
                </WidgetCard>
                {error?.message && (
                  <span className="text-red-400 absolute bottom-0 left-0 translate-y-full px-1 block" style={{ fontSize: '0.875rem' }}>
                    {error?.message}
                  </span>
                )}
              </>
            );
          }}
        />
      </div>

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
