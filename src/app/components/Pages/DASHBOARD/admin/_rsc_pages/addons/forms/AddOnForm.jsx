'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { z } from 'zod';
import { SelectField } from '../components/Select';
import { FORM_ADDON_VALUES_DEFAULT, FORM_ADDON_ITEMTYPE, FORM_ADDON_PRICE_CALCULATION_BY, ADDON_TYPES } from '@/constants/forms/addon';
import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createAddOn, editAddOn } from '@/lib/actions/addOn'; // actions
import { cn } from '@/lib/utils';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';

// Extract values
const priceCalculationValues = FORM_ADDON_PRICE_CALCULATION_BY.map(({ value }) => value);

// Zod Schema for validation
export const AddOnFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name cannot exceed 255 characters'),
  type: z.enum(ADDON_TYPES, {
    errorMap: () => ({ message: 'Type is required and must be a valid option' }),
  }),

  description: z.string(),
  price: z.coerce
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a number',
    })
    .min(0, 'Price cannot be negative'),

  sale_price: z.coerce
    .number({
      invalid_type_error: 'Sale price must be a number',
    })
    .min(0, 'Sale price cannot be negative')
    .optional(),

  price_calculation: z.enum(priceCalculationValues, {
    errorMap: () => ({
      message: 'Price calculation must be one of the allowed values',
    }),
  }),
  active_status: z.boolean().default(false),
});

//  Form Component
export const AddOnForm = ({ formData = {} }) => {
  const { id } = useParams(); // checking id is exist
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(AddOnFormSchema),
    defaultValues: { ...FORM_ADDON_VALUES_DEFAULT, ...formData },
  });

  // destructure form
  const {
    formState: { isSubmitting, isValid, isDirty },
  } = form;

  // Watch type field for auto-populating price_calculation
  // eslint-disable-next-line react-hooks/incompatible-library
  const typeValue = form.watch('type');

  // Watch price_calculation field for display label
  const priceCalculationValue = form.watch('price_calculation');

  // Watch price and sale_price for validation
  const priceValue = form.watch('price');
  const salePriceValue = form.watch('sale_price');

  // State for sale price validation error
  const [isSalePriceInvalid, setIsSalePriceInvalid] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  // Get display label for price_calculation value
  const priceCalculationLabel = useMemo(() => {
    const option = FORM_ADDON_PRICE_CALCULATION_BY.find(({ value }) => value === priceCalculationValue);
    return option?.label || '';
  }, [priceCalculationValue]);

  // Auto-populate price_calculation based on type
  useEffect(() => {
    if (typeValue) {
      const priceCalculationMap = {
        activity: 'per_activity',
        package: 'per_package',
        itinerary: 'per_itinerary',
        transfer: 'per_transfer',
      };
      form.setValue('price_calculation', priceCalculationMap[typeValue], { shouldDirty: false });
    }
  }, [typeValue, form]);

  // Real-time validation: sale_price must be less than price
  useEffect(() => {
    const invalid = salePriceValue > 0 && salePriceValue >= priceValue;
    setIsSalePriceInvalid(invalid);

    // Show toast only when transitioning to invalid state (avoid spamming)
    if (invalid && !hasShownToast) {
      toast({
        title: 'Invalid Sale Price',
        description: 'Sale price must be less than regular price.',
        variant: 'destructive',
      });
      setHasShownToast(true);
    } else if (!invalid) {
      setHasShownToast(false);
    }
  }, [salePriceValue, priceValue, hasShownToast, toast]);

  // handle submit
  const onSubmit = async (data) => {
    // Validate sale_price before submit
    if (data.sale_price > 0 && data.sale_price >= data.price) {
      toast({
        title: 'Invalid Sale Price',
        description: 'Sale price must be less than regular price.',
        variant: 'destructive',
      });
      return;
    }

    try {
      let response;
      if (id) {
        response = await editAddOn(id, data);
      } else {
        response = await createAddOn(data);
      }

      if (!response.success) {
        // Handle API errors gracefully
        console.error('Error:', response.message);

        if (response.errors) {
          console.table(response.errors); // e.g., validation errors
        }

        // Optional: show toast/notification
        toast({
          title: response.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: response.message,
        variant: 'default',
      });

      // back to add on page
      router.back();
    } catch (err) {
      // Catch unexpected errors (network issues, etc.)
      console.error('Unexpected error:', err);
      toast({
        title: 'Unexpected Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const FORMSTYLE = {
    formLabel: 'font-bold',
  };

  return (
    <Card className="border-none">
      <CardTitle>{id ? 'Edit Add On' : 'Create Add On'}</CardTitle>
      <CardDescription>{id ? 'Update the add on details below.' : 'Create the add on details below.'}</CardDescription>
      <CardContent className="p-0 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting} className={`space-y-4 ${isSubmitting && 'cursor-wait'}`}>
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Premium Package" {...field} />
                    </FormControl>
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
                    <FormLabel className={FORMSTYLE.formLabel}>Type</FormLabel>
                    <FormControl>
                      <SelectField data={FORM_ADDON_ITEMTYPE} onChange={field.onChange} value={field.value} />
                    </FormControl>
                    <FormDescription>Choose the category this add-on belongs to.</FormDescription>
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
                    <FormLabel className={FORMSTYLE.formLabel}>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe what this add-on includes.." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Price & Sale Price */}
              <div className="flex flex-col sm:flex-row gap-6">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className={FORMSTYLE.formLabel}>Price</FormLabel>
                      <FormControl>
                        <Input type="number" min="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sale_price"
                  defaultValue={undefined}
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className={FORMSTYLE.formLabel}>Sale Price</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          className={cn(isSalePriceInvalid && 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500')}
                        />
                      </FormControl>
                      <FormDescription>Leave empty if no discount is applied.</FormDescription>
                      <FormMessage />
                      <p className={cn('text-sm text-red-500 min-h-[20px]', !isSalePriceInvalid && 'invisible')}>Sale price must be less than regular price.</p>
                    </FormItem>
                  )}
                />
              </div>

              {/* Price Calculation - Auto-filled based on Type */}
              <FormField
                control={form.control}
                name="price_calculation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Price Calculation</FormLabel>
                    <FormControl>
                      <Input {...field} value={priceCalculationLabel} disabled className="bg-muted cursor-not-allowed" />
                    </FormControl>
                    <FormDescription>Automatically calculated based on selected Type.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Active Status Switch */}
              <FormField
                control={form.control}
                name="active_status"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center">
                    <div>
                      <FormLabel className={FORMSTYLE.formLabel}>Active Status</FormLabel>
                      <FormDescription>Enable this add-on for customers to purchase.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        id="active_status"
                        checked={Boolean(field.value)} // explicit boolean conversion
                        onCheckedChange={(checked) => {
                          field.onChange(Boolean(checked));
                        }}
                        className="data-[state=checked]:bg-secondaryDark data-[state=checked]:accent-secondaryDark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormActionButtons
                mode={id ? 'update' : 'create'}
                cancelHref="/dashboard/admin/addon"
                isSubmitting={isSubmitting}
                isDisabled={id ? !isValid || !isDirty : !isValid}
                containerType="div"
                className="justify-end"
              />
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
