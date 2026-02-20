'use client';
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * @param {Object} props
 * @param {ReviewSelectOption[]} [props.data] - Array of options -> [{label,value}]
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Currently selected value
 * @param {(value: string) => void} [props.onChange] - Callback when value changes
 */
export const SelectField = ({ data = [], placeholder = 'Select...', value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
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
        <SelectTrigger>
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
