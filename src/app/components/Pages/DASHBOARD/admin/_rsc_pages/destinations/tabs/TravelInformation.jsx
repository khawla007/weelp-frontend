'use client';
import React from 'react';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import Select from 'react-select';
import { Select as ShadcnSelect, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CURRENCY, GMT_TIMEZONE, LANGUAGES, LOCAL_CUISINE, PUBLIC_TRANSPORTATION } from '@/constants/shared';
import { Textarea } from '@/components/ui/textarea';
import { ComboboxMultiple } from '@/components/ui/combobox_multi';

const TravelInformationTab = () => {
  const form = useFormContext();

  return (
    <Card className="space-y-4 py-6 border-none">
      <CardTitle className="text-base font-semibold px-4">Transportation</CardTitle>

      <CardContent className="grid gap-4 grid-cols-1 p-4">
        {/* Airport */}
        <FormField
          control={form.control}
          name="travel_info.airport"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Airport</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Public Transportation */}
        <FormField
          control={form.control}
          name="travel_info.public_transportation"
          rules={{ required: 'Field Required' }}
          render={({ field }) => (
            <FormItem className="flex flex-col items-start gap-2">
              <FormLabel>Public Transportation</FormLabel>
              <FormControl>
                <Select
                  {...field}
                  isMulti
                  options={PUBLIC_TRANSPORTATION}
                  className="w-full"
                  value={(field.value || []).map((val) => ({
                    value: val,
                    label: val,
                  }))}
                  onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                  placeholder="Select Transport mediums..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* taaxi & rental switches */}
        <div className="flex space-x-4">
          {['taxi_available', 'rental_cars_available'].map((value) => (
            <FormField
              key={value}
              control={form.control}
              name={`travel_info.${value}`}
              render={({ field }) => (
                <FormItem className="flex items-start gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-secondaryDark" />
                  </FormControl>
                  <FormLabel className="capitalize">{value.replace(/_/g, ' ')}</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {/* Accomodation */}
        <CardTitle>Accomodation</CardTitle>
        <div className="grid grid-cols-2 gap-4">
          {['hotels', 'hostels', 'apartments', 'resorts'].map((value) => (
            <FormField
              key={value}
              control={form.control}
              name={`travel_info.${value}`}
              render={({ field }) => (
                <FormItem className="flex items-start gap-2">
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} className="data-[state=checked]:bg-secondaryDark" />
                  </FormControl>
                  <FormLabel className="capitalize">{value.replace(/_/g, ' ')}</FormLabel>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>

        {['visa_requirements', 'best_time_to_visit', 'travel_tips', 'safety_information'].map((value, index) => (
          <FormField
            key={value}
            control={form.control}
            name={`travel_info.${value}`}
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-2">
                <FormLabel className="capitalize">{value.replace(/_/g, ' ')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={`Enter ${value.replace(/_/g, ' ')}`} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default TravelInformationTab;
