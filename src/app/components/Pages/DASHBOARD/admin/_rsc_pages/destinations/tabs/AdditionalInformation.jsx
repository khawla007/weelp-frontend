'use client';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, X } from 'lucide-react';
import React from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';

const AdditionalInformationTab = () => {
  const form = useFormContext(); // intialize form context

  // destructure property
  const { control } = form;

  // initialize repeater for seasons
  const {
    fields: additionalFields,
    append: addField,
    remove: removeField,
  } = useFieldArray({
    control,
    name: 'additional_info', // unique name
  });
  return (
    <Card className="border-none shadow-none ">
      <CardHeader className="flex flex-row justify-between">
        <CardTitle className="text-xl">Additional Information</CardTitle>
        <span
          className={buttonVariants({
            variant: 'outline',
            size: 'sm',
            className: 'cursor-pointer',
          })}
          onClick={() => addField({ title: '', content: '' })}
        >
          <Plus size={16} /> Add Section
        </span>
      </CardHeader>
      <CardContent>
        {/* Repeater Fields */}
        {additionalFields.map((field, index) => (
          <Card key={field.id} className="w-full py-4 space-y-6 relative">
            <div className="absolute top-4 right-4">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeField(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <FormField
              control={form.control}
              name={`additional_info.${index}.title`}
              rules={{ required: 'Title Required' }}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Section Title</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter section title" className="text-xs focus-visible:ring-secondaryDark" />
                  </FormControl>
                  <FormMessage className="px-2 text-red-500 text-sm" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name={`additional_info.${index}.content`}
              rules={{ required: 'Content Required' }}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter section content" className="text-xs focus-visible:ring-secondaryDark" />
                  </FormControl>
                  <FormMessage className="px-2 text-red-500 text-sm" />
                </FormItem>
              )}
            />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default AdditionalInformationTab;
