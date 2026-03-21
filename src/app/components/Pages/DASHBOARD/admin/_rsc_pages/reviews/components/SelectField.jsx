'use client';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * @param {Object} props
 * @param {ReviewSelectOption[]} [props.data] - Array of options -> [{label,value}]
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Currently selected value
 * @param {(value: string) => void} [props.onChange] - Callback when value changes
 * @param {string} [props.className] - Additional className for SelectTrigger
 */
export const SelectField = ({ data = [], placeholder = 'Select...', value, onChange, className = '' }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className={cn('w-full', className)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

/**
 * @param {Object} props
 * @param {ReviewSelectOption2[]} [props.data] - Array of options e.g -> [{id,name}]
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Currently selected value
 * @param {(value: string) => void} [props.onChange] - Callback when value changes
 */
export const SelectField2 = ({ data = [], placeholder = 'Select...', value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Select value={String(value)} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem key={item.id} value={String(item.id)}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
