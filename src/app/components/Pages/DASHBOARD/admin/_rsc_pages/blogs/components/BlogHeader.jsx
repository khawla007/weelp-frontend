import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const BlogHeader = ({ editPage = false }) => {
  const router = useRouter();

  const {
    control,
    formState: { isSubmitting, isValid, isDirty },
  } = useFormContext();

  // Watch required fields for create mode validation
  const nameValue = useWatch({ control, name: 'name' });
  const contentValue = useWatch({ control, name: 'content' });

  // Extract text from Tiptap JSON to check if content is actually filled
  const hasContent = (() => {
    if (!contentValue) return false;
    try {
      const parsed = JSON.parse(contentValue);
      const extractText = (node) => {
        if (node.text) return node.text;
        if (node.content) return node.content.map(extractText).join('');
        return '';
      };
      return extractText(parsed).trim().length > 0;
    } catch {
      return !!contentValue?.trim();
    }
  })();

  // Create: enabled when name and content are filled
  // Edit: enabled when any field is changed (dirty)
  const isCreateValid = !!(nameValue?.trim() && hasContent);
  const computedDisabled = editPage ? !isDirty : !isCreateValid;

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 flex-wrap">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-8" />
        </Button>
        <h1 className="text-2xl font-bold">{editPage ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      </div>

      {/* On Submit Control */}
      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="publish"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Label htmlFor="publish">Publish</Label>
              <Switch
                id="publish"
                checked={field.value} // true / false
                onCheckedChange={field.onChange} // updates RHF state
                className="data-[state=checked]:bg-secondaryDark"
              />
            </div>
          )}
        />

        <FormActionButtons
          mode={editPage ? 'update' : 'create'}
          isSubmitting={isSubmitting}
          isDisabled={computedDisabled}
          cancelAlwaysEnabled={true}
          cancelHref="/dashboard/admin/blogs"
          showCancel={true}
          containerType="none"
          className="flex gap-2"
        />
      </div>
    </div>
  );
};
