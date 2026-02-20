'use client';

import React, { useEffect } from 'react';
import { TaxonomyFormNavigation } from '../taxonomies_shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { generateSlug } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { editAttribute } from '@/lib/actions/attributes';

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
    default_value: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type !== 'yes/no') {
      if (!data.default_value || data.default_value.trim().length < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Default value is required.',
          path: ['default_value'],
        });
      }
    }
  });

export const EditAttributePageForm = ({ attributeData }) => {
  const router = useRouter();
  const { toast } = useToast();

  const { id, name, slug, type, description, values, default_value } = attributeData;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: name || '',
      slug: slug || '',
      type: type || '',
      description: description || '',
      values: values || '',
      default_value: default_value || '',
    },
  });

  const {
    formState: { isSubmitting },
  } = form;

  const typeValue = form.watch('type');

  // Clear default_value if type is 'yes/no'
  useEffect(() => {
    if (typeValue === 'yes/no') {
      form.setValue('default_value', '', { shouldValidate: true });
    }
  }, [typeValue, form]);

  const onSubmit = async (data) => {
    const updatedValues = data.values.split(',');

    const finalData = { ...data, values: updatedValues };

    try {
      const res = await editAttribute(id, finalData);

      if (res.success) {
        form.reset();
        toast({
          title: res.message || 'Attribute Updated Successfully',
        });
        router.back();
      } else {
        toast({
          variant: 'destructive',
          title: 'Failed to update attribute',
          description: res.message,
        });

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

  const defaultSelectOption = [
    { name: 'Single select', value: 'single_select' },
    { name: 'Multi Select', value: 'multi_select' },
    { name: 'Text', value: 'text' },
    { name: 'Number', value: 'number' },
    { name: 'Yes/No', value: 'yes/no' },
  ];

  return (
    <div>
      <TaxonomyFormNavigation title={'Edit Attribute'} description={'Edit the details of the attribute.'} url={'/dashboard/admin/taxonomies/attributes/'} />
      <div className="px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 bg-white border p-6 shadow-sm rounded-lg">
            <fieldset className={`flex flex-col gap-4 ${isSubmitting ? 'cursor-wait' : ''}`} disabled={isSubmitting}>
              <FormLabel className="font-semibold text-lg">Attribute Details</FormLabel>
              <FormDescription>Enter the details for the attribute.</FormDescription>

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

              {/* Type */}
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
                          {defaultSelectOption.map((val) => (
                            <SelectItem key={val.value} value={val.value}>
                              {val.name}
                            </SelectItem>
                          ))}
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

              {/* Default Value - show only if type !== "yes/no" */}
              {typeValue !== 'yes/no' && (
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

              {/* Submit/Cancel */}
              <div className="flex gap-2">
                <Button className="w-fit bg-secondaryDark hover:bg-secondaryDark" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Editing Attribute' : 'Edit Attribute'}
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
              </div>
            </fieldset>
          </form>
        </Form>
      </div>
    </div>
  );
};
