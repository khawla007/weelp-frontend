'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import SeoFields from '../shared/SeoFields';
import { WidgetCard } from '../blogs/components/WidgetCard';
import { PAGE_STATUS } from '@/lib/pages/normalizers';
import { PageHeroFields } from './PageHeroFields';

export function PageSidebar() {
  const { control } = useFormContext();

  return (
    <div className="space-y-6">
      <WidgetCard cardTitle="Publishing">
        <Controller
          name="status"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="focus:ring-0">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={PAGE_STATUS.draft}>Draft</SelectItem>
                  <SelectItem value={PAGE_STATUS.published}>Published</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </WidgetCard>

      <WidgetCard cardTitle="Hero Section">
        <PageHeroFields />
      </WidgetCard>

      <WidgetCard cardTitle="Excerpt">
        <Controller
          name="excerpt"
          control={control}
          rules={{ maxLength: { value: 300, message: 'Excerpt too long (max 300 characters)' } }}
          render={({ field, fieldState: { error } }) => (
            <>
              <Textarea id="cms-page-excerpt" rows={4} placeholder="Short page summary for listings and SEO fallbacks" {...field} />
              {error?.message && <span className="text-sm text-destructive">{error.message}</span>}
            </>
          )}
        />
      </WidgetCard>

      <WidgetCard cardTitle="SEO & Schema">
        <SeoFields itemType="page" requiredBasicFields={false} />
      </WidgetCard>
    </div>
  );
}
