'use client';

import React from 'react';
import { TaxonomyFormNavigation } from '../taxonomies_shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { addCommabetweenString, generateSlug } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
// import { createCategory } from "@/lib/actions/categories";
import { createAttribute } from '@/lib/actions/attributes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const formSchema = z
  .object({
    name: z.string().min(3, {
      message: 'Category name must be at least 3 characters.',
    }),
    slug: z.string().min(3, {
      message: 'Slug is required and must be at least 3 characters.',
    }),
    type: z.string().min(1, {
      message: 'Type is required.',
    }),
    description: z.string().optional(),
    values: z.string().min(3, 'Each value must be at least 3 character'),

    defaultValue: z.string().optional(), // optional by default
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'yes/no') {
      if (!data.defaultValue || data.defaultValue.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Value is required.',
          path: ['default_value'],
        });
      }
    }
  });

export const CreateAttributePageForm = () => {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      slug: '',
      type: '',
      description: '',
      values: '',
      default_value: '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form; // checking form state

  const typeValue = form.watch('type');

  // on submit handle
  const onSubmit = async (data) => {
    const { values } = data; // desturcuture

    const updatedValues = values.split(',');

    // console.log(updatedValues);
    const finalData = { ...data, values: updatedValues };
    console.log(finalData);

    try {
      const res = await createAttribute(finalData); // create attribute

      if (res.success) {
        // Reset form only if success
        form.reset();

        // Display success notification
        toast({
          title: res.message || 'Attribute Created Successfully',
        });

        // back to attribute
        router.back();
      } else {
        // Display error notification
        toast({
          variant: 'destructive',
          title: 'Failed to create attribute',
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

  // default select option
  const defaultSelectOption = [
    { name: 'Single select', value: 'single_select' },
    { name: 'Multi Select', value: 'multi_select' },
    { name: 'Text', value: 'text' },
    { name: 'Number', value: 'number' },
    { name: 'Yes/No', value: 'yes/no' },
  ];

  return (
    <div>
      <TaxonomyFormNavigation title={'Create Attribute'} description={'Add a new attribute for activities'} url={'/dashboard/admin/taxonomies/attributes/'} />
      <div className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white border p-6 shadow-sm rounded-lg">
            <fieldset className={`flex flex-col gap-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
              <FormLabel className="font-semibold text-lg">Attribute Details</FormLabel>
              <FormDescription>Enter the details for the new Attribute.</FormDescription>

              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter attribute name"
                        {...field}
                        onBlur={() => {
                          form.setValue('slug', generateSlug(field.value), {
                            shouldValidate: true,
                          });
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug (readonly) */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="attribute-slug" {...field} readOnly />
                    </FormControl>
                    <FormDescription>This is the URL-friendly version of the name. It should be lowercase and contain only letters, numbers, and hyphens.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a type" />
                        </SelectTrigger>
                        <SelectContent>
                          {defaultSelectOption.map((val, index) => {
                            return (
                              <SelectItem key={index} value={val.value}>
                                {val.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </FormControl>
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
                      <Textarea placeholder="Enter attribute description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Values */}
              <FormField
                control={form.control}
                name="values"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Values</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter possible values, separated by commas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Default Value */}
              {typeValue !== 'yes/no' && ( // remove field for specific type
                <FormField
                  control={form.control}
                  name="default_value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Value</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter default value" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Submit/Cancel Buttons */}
              <p className="flex gap-2">
                <Button className="w-fit bg-secondaryDark hover:bg-secondaryDark" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating Attribute' : 'Create Attribute'}
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
