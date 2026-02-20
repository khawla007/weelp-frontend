'use client';

import React, { useEffect } from 'react';
import { TaxonomyFormNavigation } from '../taxonomies_shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateSlug } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { editCategory } from '@/lib/actions/categories';

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
});

export const EditCategoryForm = ({ categoryData }) => {
  const router = useRouter();
  const { toast } = useToast();

  // category data
  const { id, name, slug, description } = categoryData;

  // intialize form
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || '',
      slug: slug || '',
      description: description || '',
    },
  });

  const nameValue = useWatch({ control: form.control, name: 'name' }); // name field

  // getting form state
  const {
    formState: { isSubmitting },
  } = form;

  // on submit handle
  const onSubmit = async (data) => {
    try {
      const res = await editCategory(id, data); // edit category

      if (res.success) {
        // Display success notification
        toast({
          title: res.message || 'Category Updated Successfully',
        });

        router.back();
      } else {
        // Display error notification
        toast({
          variant: 'destructive',
          title: 'Failed to update category',
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
      <TaxonomyFormNavigation title="Edit Category" description="Edit Category for organizing activities." url="/dashboard/admin/taxonomies/categories/" />

      <div className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white border p-6 shadow-sm rounded-lg">
            <fieldset className={`flex flex-col gap-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
              <FormLabel className="font-semibold text-lg">Category Details</FormLabel>
              <FormDescription>Enter the details for the Edit Category.</FormDescription>

              {/* Category Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter category name"
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
                      <Input placeholder="category-slug" {...field} readOnly />
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

              <p className="flex gap-2">
                <Button className="w-fit bg-secondaryDark hover:bg-secondaryDark" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating Category ' : 'Update Category'}
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
