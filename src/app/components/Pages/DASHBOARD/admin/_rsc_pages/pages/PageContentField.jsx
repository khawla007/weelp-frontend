'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { WidgetCard } from '../blogs/components/WidgetCard';
import { RichTextEditor } from '../shared/RichTextEditor';
import { Medialibrary } from '../media/MediaLibrary';
import { hasEditorContent } from '../shared/richTextContent';

export function PageContentField() {
  const { control } = useFormContext();

  return (
    <WidgetCard cardTitle="Content">
      <Controller
        name="content"
        control={control}
        rules={{ validate: (value) => hasEditorContent(value) || 'Content is required' }}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-2">
            <RichTextEditor
              content={field.value}
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
            {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
          </div>
        )}
      />
    </WidgetCard>
  );
}
