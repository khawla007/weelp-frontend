'use client';

import { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { ImagePlus, X } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Medialibrary } from '../media/MediaLibrary';

const HORIZONTAL_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Left', value: 'left' },
  { label: 'Middle', value: 'center' },
  { label: 'Right', value: 'right' },
];

const VERTICAL_OPTIONS = [
  { label: 'Default', value: '' },
  { label: 'Top', value: 'top' },
  { label: 'Middle', value: 'middle' },
  { label: 'Bottom', value: 'bottom' },
];

const STYLE_SHORTCUTS = {
  Bold: 'B',
  Italic: 'I',
  Underline: 'U',
};

const controlFocusClass = 'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-input';

const FieldGroup = ({ value, title, children }) => (
  <AccordionItem value={value} className="rounded-md border px-3">
    <AccordionTrigger className="py-3 text-sm">{title}</AccordionTrigger>
    <AccordionContent className="space-y-3 pb-3">{children}</AccordionContent>
  </AccordionItem>
);

const TextControl = ({ control, name, label, placeholder, type = 'text', min, max, step, inputMode }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        <Input id={name} {...field} value={field.value ?? ''} type={type} min={min} max={max} step={step} inputMode={inputMode} placeholder={placeholder} className={controlFocusClass} />
      </div>
    )}
  />
);

const SelectControl = ({ control, name, label, options }) => (
  <Controller
    name={name}
    control={control}
    render={({ field }) => (
      <div className="space-y-1.5">
        <Label htmlFor={name}>{label}</Label>
        <select
          id={name}
          {...field}
          value={field.value ?? ''}
          className={cn('flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background', controlFocusClass)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )}
  />
);

const StyleToggles = ({ control, fields }) => (
  <div className="flex flex-wrap gap-2">
    {fields.map(({ name, label }) => (
      <Controller
        key={name}
        name={name}
        control={control}
        render={({ field }) => (
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label={label}
            aria-pressed={Boolean(field.value)}
            title={label}
            className={cn(
              'h-9 w-9 rounded-md border text-sm focus-visible:ring-0 focus-visible:ring-offset-0',
              field.value && 'border-weelp-sage-deep bg-weelp-sage-deep text-white hover:bg-weelp-sage-deep hover:text-white',
              label === 'Bold' && 'font-bold',
              label === 'Italic' && 'italic',
              label === 'Underline' && 'underline decoration-2 underline-offset-2',
            )}
            onClick={() => field.onChange(!field.value)}
          >
            {STYLE_SHORTCUTS[label]}
          </Button>
        )}
      />
    ))}
  </div>
);

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
              <Input {...field} value={field.value ?? ''} placeholder="/storage/pages/about-hero.jpg" />
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

      <Accordion type="multiple" className="space-y-3">
        <FieldGroup value="background" title="Background">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextControl control={control} name="hero_overlay_color" label="Overlay color" type="color" />
            <TextControl control={control} name="hero_overlay_opacity" label="Overlay opacity" inputMode="decimal" placeholder="0.5" />
          </div>
        </FieldGroup>

        <FieldGroup value="content" title="Content">
          <Controller name="hero_heading" control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Hero heading" />} />

          <Controller name="hero_text" control={control} render={({ field }) => <Textarea {...field} value={field.value ?? ''} rows={4} placeholder="Hero supporting text" />} />

          <SelectControl control={control} name="hero_content_vertical_position" label="Whole content vertical position" options={VERTICAL_OPTIONS} />
        </FieldGroup>

        <FieldGroup value="heading" title="Heading">
          <div className="grid gap-3 sm:grid-cols-3">
            <TextControl control={control} name="hero_heading_size" label="Size" placeholder="56px" />
            <TextControl control={control} name="hero_heading_color" label="Color" type="color" />
            <SelectControl control={control} name="hero_heading_align" label="Position" options={HORIZONTAL_OPTIONS} />
          </div>
          <StyleToggles
            control={control}
            fields={[
              { name: 'hero_heading_bold', label: 'Bold' },
              { name: 'hero_heading_italic', label: 'Italic' },
              { name: 'hero_heading_underline', label: 'Underline' },
            ]}
          />
        </FieldGroup>

        <FieldGroup value="text" title="Text">
          <div className="grid gap-3 sm:grid-cols-3">
            <TextControl control={control} name="hero_text_size" label="Size" placeholder="20px" />
            <TextControl control={control} name="hero_text_color" label="Color" type="color" />
            <SelectControl control={control} name="hero_text_align" label="Position" options={HORIZONTAL_OPTIONS} />
          </div>
          <StyleToggles
            control={control}
            fields={[
              { name: 'hero_text_bold', label: 'Bold' },
              { name: 'hero_text_italic', label: 'Italic' },
              { name: 'hero_text_underline', label: 'Underline' },
            ]}
          />
        </FieldGroup>

        <FieldGroup value="button" title="Button">
          <Controller name="hero_button_label" control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="Button label" />} />

          <Controller name="hero_button_url" control={control} render={({ field }) => <Input {...field} value={field.value ?? ''} placeholder="/contact" />} />

          <div className="grid gap-3 sm:grid-cols-2">
            <TextControl control={control} name="hero_button_text_size" label="Text size" placeholder="16px" />
            <TextControl control={control} name="hero_button_text_color" label="Text color" type="color" />
          </div>

          <fieldset className="rounded-md border px-3 pb-3 pt-2">
            <legend className="px-1 text-sm font-medium text-foreground">Border</legend>
            <div className="grid gap-3 sm:grid-cols-3">
              <TextControl control={control} name="hero_button_radius" label="Radius" placeholder="999px" />
              <TextControl control={control} name="hero_button_border_width" label="Width" placeholder="2px" />
              <TextControl control={control} name="hero_button_border_color" label="Color" type="color" />
            </div>
          </fieldset>

          <div className="grid gap-3 sm:grid-cols-3">
            <TextControl control={control} name="hero_button_padding" label="Padding" placeholder="14px 28px" />
            <TextControl control={control} name="hero_button_margin" label="Margin" placeholder="24px 0 0" />
            <SelectControl control={control} name="hero_button_align" label="Position" options={HORIZONTAL_OPTIONS} />
            <TextControl control={control} name="hero_button_bg_color" label="BG color" type="color" />
          </div>
        </FieldGroup>
      </Accordion>
    </div>
  );
}
