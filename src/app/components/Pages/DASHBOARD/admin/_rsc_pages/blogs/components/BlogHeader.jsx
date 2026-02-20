import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const BlogHeader = () => {
  const router = useRouter();

  const {
    control,
    formState: { isSubmitting },
  } = useFormContext();
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 flex-wrap">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-8" />
        </Button>
        <h1 className="text-2xl font-bold">Create New Blog Post</h1>
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

        <Button variant="secondary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};
