'use client';
import React from 'react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import Select from 'react-select';
import { Textarea } from '@/components/ui/textarea';
import { CALENDAR_MONTHS, EVENT_TYPES, SEASON_ACTIVITIES } from '@/constants/shared';

const EventSeasonTab = () => {
  const form = useFormContext(); // intialize form context

  // destructure property
  const { control } = form;

  // initialize repeater for seasons
  const {
    fields: seasonFields,
    append: addSeason,
    remove: removeSeason,
  } = useFieldArray({
    control,
    name: 'seasons', // unique name
  });

  // intialize repeater for events
  const {
    fields: eventFields,
    append: addEvent,
    remove: removeEvent,
  } = useFieldArray({
    control,
    name: 'events', // unique name
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Seasons */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-6 justify-between">
          <div>
            <CardTitle className="text-lg">Seasons</CardTitle>
            <CardDescription className="text-sm">Define the different seasons and their characteristics</CardDescription>
          </div>

          {/* Add Season  */}
          <span className={buttonVariants({ variant: 'outline', size: 'sm' })} onClick={addSeason}>
            <Plus size={16} /> Add Season{' '}
          </span>
        </CardHeader>
        <CardContent>
          <Separator className="mb-6" />
          {/* Dynamic Season Fields */}
          <div className="space-y-6">
            {seasonFields.map((season, index) => (
              <div key={index} className="relative grid grid-cols-1 xl:grid-cols-2 gap-4 rounded-lg border bg-card text-card-foreground shadow-sm p-4 pt-8  ">
                {/* Remove Season  */}
                <span className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), ' absolute max-w-fit cursor-pointer right-8 top-4')} onClick={() => removeSeason(index)}>
                  <Trash2 className="text-red-400" size={16} />
                </span>

                {/* Name */}
                <FormField
                  control={form.control}
                  name={`seasons.${index}.name`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g.., Summer, winter" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Months */}
                <FormField
                  control={form.control}
                  name={`seasons.${index}.months`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2">
                      <FormLabel>
                        Months <span className="text-xs">(Select multiple)</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          isMulti
                          options={CALENDAR_MONTHS}
                          className="w-full"
                          value={(field.value || []).map((val) => ({
                            value: val,
                            label: val,
                          }))}
                          onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                          placeholder="Select Months..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Weather */}
                <FormField
                  control={form.control}
                  name={`seasons.${index}.weather`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2 xl:col-span-2">
                      <FormLabel>Weather</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none" placeholder="Describe typical weather conditions, temperatures, and precipitation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Activities */}
                <FormField
                  control={form.control}
                  name={`seasons.${index}.activities`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2 xl:col-span-2">
                      <FormLabel>
                        Activities <span className="text-xs">(Select multiple)</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          isMulti
                          options={SEASON_ACTIVITIES}
                          className="w-full"
                          value={SEASON_ACTIVITIES.filter((option) => (field.value || []).includes(option.value))}
                          onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                          placeholder="Select Activites..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {/* If No Season Found */}
            {!seasonFields.length > 0 && (
              <div className="grid place-items-center rounded-lg  p-4 pt-8 text-gray-500">
                <div className="flex flex-col items-center space-y-1">
                  <Calendar size={20} /> <h3 className=" capitalize">No seasons added yet</h3>
                  <span className=" text-xs">Add a season to get started</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Events Column */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-6 justify-between ">
          <div>
            <CardTitle className="text-lg">Events</CardTitle>
            <CardDescription className="text-sm">Add notable events and festivals</CardDescription>
          </div>
          {/* Add Events  */}
          <span className={buttonVariants({ variant: 'outline', size: 'sm' })} onClick={addEvent}>
            <Plus size={16} /> Add Events
          </span>
        </CardHeader>

        <CardContent>
          <Separator className="mb-6" />
          {/* Dynamic Season Fields */}
          <div className="space-y-6">
            {eventFields.map((event, index) => (
              <div key={index} className="relative grid grid-cols-1 xl:grid-cols-2 gap-4 rounded-lg border bg-card text-card-foreground shadow-sm p-4 pt-8  ">
                {/* Remove Season  */}
                <span className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), ' absolute max-w-fit cursor-pointer right-8 top-4')} onClick={() => removeEvent(index)}>
                  <Trash2 className="text-red-400" size={16} />
                </span>

                {/* Name */}
                <FormField
                  control={control}
                  name={`events.${index}.name`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g.., Summer Festival" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type Event */}
                <FormField
                  control={form.control}
                  name={`events.${index}.type`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2">
                      <FormLabel>
                        Type <span className="text-xs">(Select multiple)</span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          isMulti
                          options={EVENT_TYPES}
                          className="w-full"
                          value={EVENT_TYPES.filter((option) => (field.value || []).includes(option.value))}
                          onChange={(selected) => field.onChange(selected.map((option) => option.value))}
                          placeholder="Select Type..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Date */}
                <FormField
                  control={form.control}
                  name={`events.${index}.date`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2 xl:col-span-2">
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value ? format(parseISO(field.value), 'yyyy-MM-dd') : ''} onChange={(e) => field.onChange(e.target.value)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location */}
                <FormField
                  control={form.control}
                  name={`events.${index}.location`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2 xl:col-span-2">
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input type="text" placeholder="e.g., City Center" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={control}
                  name={`events.${index}.description`}
                  rules={{ required: 'Field Required' }}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start gap-2 xl:col-span-2">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea className=" resize-none" placeholder="e.g., City Center" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}

            {/* If No Season Found */}
            {!seasonFields.length > 0 && (
              <div className="grid place-items-center rounded-lg  p-4 pt-8 text-gray-500">
                <div className="flex flex-col items-center space-y-1">
                  <Calendar size={20} /> <h3 className=" capitalize">No seasons added yet</h3>
                  <span className=" text-xs">Add a season to get started</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Season */}
    </div>
  );
};

export default EventSeasonTab;
