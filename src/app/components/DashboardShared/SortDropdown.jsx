'use client';

import { Controller } from 'react-hook-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sortOptions = [
  { name: 'Price: Low to High', value: 'price_asc' },
  { name: 'Price: High to Low', value: 'price_desc' },
  { name: 'Name: A to Z', value: 'name_asc' },
  { name: 'Name: Z to A', value: 'name_desc' },
  { name: 'ID: Oldest First', value: 'id_asc' },
  { name: 'ID: Newest First', value: 'id_desc' },
  { name: 'Featured First', value: 'featured' },
  { name: 'Default (Newest First)', value: 'default' },
];

export function SortDropdown({ control, name = 'sort_by' }) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select onValueChange={field.onChange} value={field.value}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Default (Newest First)" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {sortOptions.map(({ name, value }) => (
                <SelectItem key={value} value={value} className="cursor-pointer">
                  {name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
    />
  );
}
