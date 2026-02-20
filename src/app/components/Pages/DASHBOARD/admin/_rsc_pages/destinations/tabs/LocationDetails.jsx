'use client';
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import Select from 'react-select';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY, GMT_TIMEZONE, LANGUAGES, LOCAL_CUISINE } from '@/constants/shared';

const LocationDetailsTab = () => {
  const form = useFormContext();

  return (
    <Card className="space-y-4 py-6 border-none">
      <CardTitle className="text-base font-semibold px-4">Location & Details</CardTitle>

      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2 p-4">
        {/* Latitude */}
        <FormField
          control={form.control}
          name="location_details.latitude"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Latitude</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="any" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Longitude */}
        <FormField
          control={form.control}
          name="location_details.longitude"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Longitude</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="any" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Capital City */}
        <FormField
          control={form.control}
          name="location_details.capital_city"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capital City</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Population */}
        <FormField
          control={form.control}
          name="location_details.population"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Population</FormLabel>
              <FormControl>
                <Input type="number" min="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Currency */}

        <FormField
          control={form.control}
          name="location_details.currency"
          rules={{ required: 'Currency Required' }}
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-2">
              <FormLabel>Currency</FormLabel>
              <FormControl>
                <ShadcnSelect onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCY.map((currency, index) => {
                      return (
                        <SelectItem key={index} value={currency}>
                          {currency}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </ShadcnSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Timezone */}
        <FormField
          control={form.control}
          name="location_details.timezone"
          rules={{ required: 'Timezone Required' }}
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-2">
              <FormLabel>Timezone</FormLabel>
              <FormControl>
                <ShadcnSelect onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {GMT_TIMEZONE.map(({ label, value }, index) => {
                      return (
                        <SelectItem key={index} value={value}>
                          {label}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </ShadcnSelect>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Languages*/}
        <div className="max-w-full md:col-span-2">
          <FormField
            control={form.control}
            name="location_details.language"
            rules={{ required: 'Language Requried' }}
            render={({ field }) => (
              <FormItem className="flex flex-col items-start gap-2">
                <FormLabel>Languages</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    isMulti
                    options={LANGUAGES}
                    className="w-full"
                    value={(field.value || []).map((val) => ({
                      value: val,
                      label: val,
                    }))}
                    onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                    placeholder="Select languages..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Cuisine*/}
        <div className="max-w-full md:col-span-2">
          <FormField
            control={form.control}
            name="location_details.local_cuisine"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem className="flex flex-col items-start gap-2">
                <FormLabel>Local Cuisine</FormLabel>
                <FormControl>
                  <Select
                    {...field}
                    isMulti
                    options={LOCAL_CUISINE}
                    className="w-full"
                    value={(field.value || []).map((val) => ({
                      value: val,
                      label: val,
                    }))}
                    onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                    placeholder="Select languages..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
export default LocationDetailsTab;
