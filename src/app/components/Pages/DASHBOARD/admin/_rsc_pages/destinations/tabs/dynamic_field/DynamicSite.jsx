'use client';
import React from 'react';
import { usePathname } from 'next/navigation';
import { Controller, useController, useFormContext } from 'react-hook-form';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useCountriesOptionsAdmin } from '@/hooks/api/admin/countries';
import { useStatesOptionsAdmin } from '@/hooks/api/admin/state';
import { useCitiesOptionsAdmin } from '@/hooks/api/admin/cities';

const DynamicSite = () => {
  const pathname = usePathname();

  const isState = pathname.includes('states');
  const isCity = pathname.includes('cities');
  const isPlace = pathname.includes('places');

  const { countries = [], isValidating: cValid, isLoading: cLoad, error: cError } = useCountriesOptionsAdmin();
  const { states = [], isValidating: sValid, isLoading: sLoad, error: sError } = useStatesOptionsAdmin();
  const { cities = [], isValidating: cityValid, isLoading: cityLoad, error: cityError } = useCitiesOptionsAdmin();

  return (
    <div>
      {isState && <DynamicSelectField name="country_id" label="Select Country" options={countries} isLoading={cLoad} isValidating={cValid} error={cError} />}
      {isCity && <DynamicSelectField name="state_id" label="State/Region" options={states} isLoading={sLoad} isValidating={sValid} error={sError} />}
      {isPlace && <DynamicSelectField name="city_id" label="Select City" options={cities} isLoading={cityLoad} isValidating={cityValid} error={cityError} />}
    </div>
  );
};

export default DynamicSite;

export const DynamicSelectField = ({ name, label, options = [], isLoading, isValidating, error, placeholder }) => {
  const { control, formState } = useFormContext();

  const fieldError = formState.errors[name];

  if (error) return <div className="text-red-400">Something Went Wrong</div>;
  if (isValidating || isLoading) return <span className="loader"></span>;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Controller
        name={name}
        control={control}
        defaultValue=""
        rules={{ required: 'Field Required' }}
        render={({ field }) => (
          <Select value={field.value ? field.value : ''} onValueChange={(val) => field.onChange(Number(val))}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder || `Select ${label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {typeof options === 'object' &&
                  options.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      />
      {fieldError && <span className="text-red-400">{fieldError.message}</span>}
    </div>
  );
};
