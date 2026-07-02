'use client';

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { ImagePlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Medialibrary } from '../media/MediaLibrary';

export function PageHeroFields() {
  const { control, setValue } = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const heroImageUrl = useWatch({ control, name: 'hero_background_image_url' });

  const selectedHeroImage = heroImageUrl ? [{ id: heroImageUrl, url: heroImageUrl }] : [];

  const setHeroImage = (url) => {
    setValue('hero_background_image_url', url || '', { shouldDirty: true, shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <Controller
        name="hero_background_image_url"
        control={control}
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Input {...field} placeholder="/storage/pages/about-hero.jpg" />
              {field.value && (
                <Button type="button" variant="outline" size="icon" aria-label="Clear hero image" onClick={() => setHeroImage('')}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {field.value && <img src={field.value} alt="Hero background preview" className="aspect-video w-full rounded-md border object-cover" />}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Select image
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-screen-xl">
                <DialogTitle className="sr-only">Select hero background image</DialogTitle>
                <DialogDescription className="sr-only">Choose one media item to use as the public page hero background.</DialogDescription>
                <Medialibrary
                  closeDialog={() => setDialogOpen(false)}
                  alreadySelectedImages={selectedHeroImage}
                  selectionMode="single"
                  onSelectImages={({ added }) => {
                    const selected = added?.[0];
                    if (selected?.url) setHeroImage(selected.url);
                  }}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      />

      <Controller name="hero_heading" control={control} render={({ field }) => <Input {...field} placeholder="Hero heading" />} />

      <Controller name="hero_text" control={control} render={({ field }) => <Textarea {...field} rows={4} placeholder="Hero supporting text" />} />

      <Controller name="hero_button_label" control={control} render={({ field }) => <Input {...field} placeholder="Button label" />} />

      <Controller name="hero_button_url" control={control} render={({ field }) => <Input {...field} placeholder="/contact" />} />
    </div>
  );
}
