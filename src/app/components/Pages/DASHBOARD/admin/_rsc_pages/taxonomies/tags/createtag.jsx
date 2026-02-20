'use client';
import React, { useEffect } from 'react';
import { Form, FormLabel, FormDescription, FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { generateSlug } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useForm, useWatch } from 'react-hook-form';
import { TaxonomyFormNavigation } from '../taxonomies_shared';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createTag } from '@/lib/actions/tags';

// schema
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'tag name must be at least 3 characters.',
  }),
  slug: z.string().min(3, {
    message: 'Slug is required.',
  }),
  description: z.string().min(3, {
    message: 'Please enter a description.',
  }),
});

export const CreateTagPageForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form; // checking form state

  const nameValue = useWatch({ control: form.control, name: 'name' });

  const onSubmit = async (data) => {
    try {
      const res = await createTag(data); // create tag

      if (res.success) {
        // Reset form only if success
        form.reset();

        // Display success notification
        toast({
          title: res.message || 'Tag Created Successfully',
        });

        // back to tag
        router.back();
      } else {
        // Display error notification
        toast({
          variant: 'destructive',
          title: 'Failed to create tag',
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
      <TaxonomyFormNavigation title={'Create Tag'} description={'Add a new tag to organize activities'} url={'/dashboard/admin/taxonomies/categories/'} />

      <div className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white border p-6 shadow-sm rounded-lg">
            <fieldset className={`flex flex-col gap-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
              <FormLabel className="font-semibold text-lg">Basic Information</FormLabel>
              <FormDescription>Enter the details for the new tag.</FormDescription>

              {/* tag Name */}
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
                      <Textarea placeholder="Enter tag description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <p className="flex gap-2">
                <Button className="w-fit bg-secondaryDark hover:bg-secondaryDark" type="submit">
                  {isSubmitting ? 'Creating Tag' : ' Create Tag'}
                </Button>
                <Button
                  className="w-fit bg-inherit hover:bg-inherit text-black border"
                  type="button"
                  onClick={() => {
                    router.back();
                  }}
                >
                  Cancel
                </Button>
              </p>
            </fieldset>
          </form>
        </Form>
      </div>
    </div>
  );
};
