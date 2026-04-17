'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { createTransferZone, updateTransferZone } from '@/lib/actions/transferZone';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';

const slugify = (s = '') =>
  s
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const ZoneFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  slug: z
    .string()
    .max(255)
    .optional()
    .transform((v) => (v ? v.trim() : v)),
  description: z.string().optional().nullable(),
  sort_order: z.coerce.number().int().min(0).default(0),
  is_active: z.boolean().default(true),
});

const DEFAULTS = {
  name: '',
  slug: '',
  description: '',
  sort_order: 0,
  is_active: true,
};

export default function ZoneForm({ initialData = null }) {
  const { id } = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm({
    resolver: zodResolver(ZoneFormSchema),
    defaultValues: { ...DEFAULTS, ...(initialData || {}) },
  });

  const {
    formState: { isSubmitting, isValid, isDirty },
  } = form;

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      slug: data.slug || slugify(data.name),
      description: data.description || null,
    };

    const res = id ? await updateTransferZone(id, payload) : await createTransferZone(payload);
    if (!res.success) {
      toast({ title: res.message || 'Failed to save zone', variant: 'destructive' });
      return;
    }
    toast({ title: res.message, variant: 'default' });
    router.push('/dashboard/admin/transfers/zones');
  };

  const FORMSTYLE = { formLabel: 'font-bold' };

  return (
    <Card className="border-none">
      <div className="flex flex-row items-center gap-2">
        <Link href="/dashboard/admin/transfers/zones" className="hover:bg-slate-50 rounded" aria-label="Back to zones">
          <ArrowLeft size={20} />
        </Link>
        <CardTitle>{id ? 'Edit Zone' : 'Create Zone'}</CardTitle>
      </div>
      <CardDescription>{id ? 'Update zone details below.' : 'Define a new pricing zone.'}</CardDescription>
      <CardContent className="p-0 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <fieldset disabled={isSubmitting} className={`space-y-4 ${isSubmitting && 'cursor-wait'}`}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Zone Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Downtown Dubai" {...field} />
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

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional description of this zone..." {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={FORMSTYLE.formLabel}>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                    </FormControl>
                    <FormDescription>Lower numbers appear first.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex justify-between items-center">
                    <div>
                      <FormLabel className={FORMSTYLE.formLabel}>Active</FormLabel>
                      <FormDescription>Enable this zone for fare resolution.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={Boolean(field.value)} onCheckedChange={(checked) => field.onChange(Boolean(checked))} className="data-[state=checked]:bg-secondaryDark" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormActionButtons
                mode={id ? 'update' : 'create'}
                cancelHref="/dashboard/admin/transfers/zones"
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
}
