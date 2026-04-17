'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTransferRoute, updateTransferRoute } from '@/lib/actions/transferRoute';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';
import LocationCombobox from '../shared/LocationCombobox';

const slugify = (s = '') =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const locationShape = z
  .object({
    locatable_id: z.number(),
    locatable_type: z.enum(['city', 'place']),
    name: z.string().optional(),
    city_name: z.string().optional().nullable(),
    country_name: z.string().optional().nullable(),
  })
  .nullable();

const RouteFormSchema = z.object({
  origin: locationShape.refine((v) => v !== null, { message: 'Origin is required' }),
  destination: locationShape.refine((v) => v !== null, { message: 'Destination is required' }),
  name: z.string().min(1, 'Name is required').max(255),
  slug: z.string().max(255).optional().transform((v) => (v ? v.trim() : v)),
  distance_km: z.coerce.number().min(0).optional().nullable(),
  duration_minutes: z.coerce.number().int().min(0).optional().nullable(),
  is_active: z.boolean().default(true),
  is_popular: z.boolean().default(false),
});

const DEFAULTS = {
  origin: null,
  destination: null,
  name: '',
  slug: '',
  distance_km: '',
  duration_minutes: '',
  is_active: true,
  is_popular: false,
};

export default function RouteForm({ initialData = null }) {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(RouteFormSchema),
    defaultValues: { ...DEFAULTS, ...(initialData || {}) },
  });

  const {
    formState: { isSubmitting, isValid },
  } = form;

  const onSubmit = async (data) => {
    const payload = {
      name: data.name,
      slug: data.slug || slugify(data.name),
      origin_type: data.origin.locatable_type,
      origin_id: data.origin.locatable_id,
      destination_type: data.destination.locatable_type,
      destination_id: data.destination.locatable_id,
      distance_km: data.distance_km !== '' ? data.distance_km : null,
      duration_minutes: data.duration_minutes !== '' ? data.duration_minutes : null,
      is_active: data.is_active,
      is_popular: data.is_popular,
    };

    const res = id
      ? await updateTransferRoute(id, payload)
      : await createTransferRoute(payload);

    if (!res.success) {
      toast({ title: res.message || 'Failed to save route', variant: 'destructive' });
      return;
    }
    toast({ title: res.message, variant: 'default' });
    router.push('/dashboard/admin/transfers/routes');
  };

  const FORMSTYLE = { formLabel: 'font-bold' };

  return (
    <Card className="border-none">
      <div className="flex flex-row items-center gap-2">
        <Link href="/dashboard/admin/transfers/routes" className="hover:bg-slate-50 rounded" aria-label="Back to routes">
          <ArrowLeft size={20} />
        </Link>
        <CardTitle>{id ? 'Edit Route' : 'Create Route'}</CardTitle>
      </div>
      <CardDescription>
        {id ? 'Update transfer route details below.' : 'Define a new transfer route between locations.'}
      </CardDescription>
      <CardContent className="p-0 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting} className={`space-y-4 ${isSubmitting && 'cursor-wait'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="origin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={FORMSTYLE.formLabel}>Origin</FormLabel>
                      <FormControl>
                        <LocationCombobox
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search origin location..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="destination"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={FORMSTYLE.formLabel}>Destination</FormLabel>
                      <FormControl>
                        <LocationCombobox
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Search destination location..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Route Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Dubai Airport to Downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="auto-generated from name if left empty" {...field} />
                    </FormControl>
                    <FormDescription>URL-friendly identifier. Leave empty to auto-generate.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="distance_km"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={FORMSTYLE.formLabel}>Distance (km)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="e.g. 35.5"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={FORMSTYLE.formLabel}>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="e.g. 45"
                          {...field}
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center">
                    <div>
                      <FormLabel className={FORMSTYLE.formLabel}>Active</FormLabel>
                      <FormDescription>Enable this route for booking.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        className="data-[state=checked]:bg-secondaryDark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_popular"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center">
                    <div>
                      <FormLabel className={FORMSTYLE.formLabel}>Popular</FormLabel>
                      <FormDescription>Mark this route as a featured/popular route.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={Boolean(field.value)}
                        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                        className="data-[state=checked]:bg-secondaryDark"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormActionButtons
                mode={id ? 'update' : 'create'}
                cancelHref="/dashboard/admin/transfers/routes"
                isSubmitting={isSubmitting}
                isDisabled={!isValid}
                containerType="div"
                className="justify-end"
              />
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
