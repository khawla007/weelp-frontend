'use client';

import React from 'react';
import { Form, FormLabel, FormDescription, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { generateSlug } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useForm, useWatch } from 'react-hook-form';
import { TaxonomyFormNavigation } from '../taxonomies_shared';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { editTag } from '@/lib/actions/tags';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';

// schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Category name must be at least 3 characters.',
  }),
  slug: z.string().min(3, {
    message: 'Slug is required.',
  }),
  description: z.string().min(3, {
    message: 'Please enter a description.',
  }),
  status: z.enum(['active', 'draft']).default('active'),
  is_featured: z.boolean().default(false),
});

export const EditTageForm = ({ tagdata }) => {
  const router = useRouter();
  const { toast } = useToast();

  const { id, name, slug, description, status, is_featured } = tagdata;
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || '',
      slug: slug || '',
      description: description || '',
      status: status || 'active',
      is_featured: is_featured || false,
    },
  });

  const {
    formState: { isSubmitting, isValid, isDirty },
  } = form; // state

  const nameValue = useWatch({ control: form.control, name: 'name' });

  const onSubmit = async (data) => {
    try {
      const res = await editTag(id, data); // update tag

      if (res.success) {
        // Reset form only if success
        form.reset();

        // Display success notification
        toast({
          title: res.message || 'Tag Updated Successfully',
        });

        // back to tags
        router.back();
      } else {
        // Display error notification
        toast({
          variant: 'destructive',
          title: 'Failed to update tags',
          description: res.message,
        });

        // Optional: Show validation errors if needed
        if (res.errors) {
          console.log('Validation Errors:', res.errors);
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'An unexpected error occurred',
        description: 'Please try again later.',
      });
    }
  };

  return (
    <div>
      <TaxonomyFormNavigation title={'Update Tag'} description={'Add a new tag to organize activities'} url={'/dashboard/admin/taxonomies/tags/'} />
      <div className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white border p-6 shadow-sm rounded-lg">
            <fieldset className={`flex flex-col gap-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
              <FormLabel className="font-semibold text-lg">Basic Information</FormLabel>
              <FormDescription>Enter the details for the new tag.</FormDescription>

              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g, Family Friendly"
                        {...field}
                        onBlur={() => {
                          form.setValue('slug', generateSlug(nameValue), {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g, family-friendly" {...field} readOnly />
                    </FormControl>
                    <FormDescription>This is the URL-friendly version of the name. It should be lowercase and contain only letters, numbers, and hyphens.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter category description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col gap-2">
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="active" />
                          </FormControl>
                          <FormLabel className="font-normal">Active</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="draft" />
                          </FormControl>
                          <FormLabel className="font-normal">Draft</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Featured */}
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                      <FormDescription>Mark this tag as featured</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormActionButtons
                mode="update"
                cancelHref="/dashboard/admin/taxonomies/tags/"
                isSubmitting={isSubmitting}
                isDisabled={!isValid || !isDirty}
                containerType="div"
                className="justify-end"
              />
            </fieldset>
          </form>
        </Form>
      </div>
    </div>
  );
};
