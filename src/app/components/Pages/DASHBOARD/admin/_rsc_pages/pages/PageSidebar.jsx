'use client';

import { Controller, useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SeoFields from '../shared/SeoFields';
import { WidgetCard } from '../blogs/components/WidgetCard';
import { PAGE_STATUS } from '@/lib/pages/normalizers';

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

      <WidgetCard cardTitle="SEO & Schema">
        <SeoFields itemType="page" requiredBasicFields={false} />
      </WidgetCard>
    </div>
  );
}
