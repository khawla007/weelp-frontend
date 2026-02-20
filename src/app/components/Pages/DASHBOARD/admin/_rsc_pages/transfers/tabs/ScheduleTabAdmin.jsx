import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SelectInputTransfer2 } from '../components/SelectForm';
import { useFormContext, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Switch } from '@/components/ui/switch';

const ScheduleTabAdmin = () => {
  const methods = useFormContext(); // intialize context

  // desturcutre methods
  const {
    control,
    register,
    setError,
    formState: { errors },
  } = methods;

  // field for Days
  const {
    fields: timeSlotsFields,
    append: addTimeSlotField,
    remove: removeTimeSlotField,
  } = useFieldArray({
    control: control,
    name: 'time_slots',
  });

  const watchedAvailabilityType = useWatch({
    control: control,
    name: 'availability_type',
  }); // watching avaialblity type
  const watchedTimeSlots = useWatch({ control: control, name: 'time_slots' }); // watching time slots

  useEffect(() => {
    if (watchedAvailabilityType === 'custom' && watchedTimeSlots.length === 0) {
      setError('time_slots', {
        type: 'manual',
        message: 'At least one time slot is required',
      });
    }
  }, [watchedTimeSlots, watchedAvailabilityType, setError]);

  // Availablitiy Type
  const availabilityType = [
    { label: 'Always available', value: 'always_available' },
    { label: 'Specific Date', value: 'specific_date' },
    { label: 'Custom', value: 'custom' },
  ];

  // Availability Days
  const availabilityDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  // handleRemove Time Slote Field
  const handleRemoveSlotField = (index) => {
    removeTimeSlotField(index);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Availability Settings</CardTitle>
        <CardDescription className="text-sm">Configure when this transfer service is available</CardDescription>

        <CardContent className="px-0 py-4">
          {/* Availability Type */}
          <div className="space-y-2">
            <Label htmlFor="availability_type">Availability Type</Label>
            <Controller
              control={control}
              rules={{ required: 'Field Required' }}
              name="availability_type"
              render={({ field }) => <SelectInputTransfer2 options={availabilityType} onChange={field.onChange} value={field.value} placeholder="Select Availability Type" />}
            />
            {errors?.availability_type && <p className="text-red-500 text-sm mt-1">{errors?.availability_type?.message}</p>}
          </div>

          {/* Display Dynamic Based Fields */}
          {(watchedAvailabilityType === 'specific_date' || watchedAvailabilityType === 'custom') && (
            <div className="flex flex-col gap-4">
              {/* Dynamic Available Days */}
              <div className="py-4">
                <Controller
                  name="available_days"
                  control={control}
                  rules={{ required: 'field required' }}
                  render={({ field }) => (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {availabilityDays.map((day) => {
                        const isSelected = field.value.includes(day);
                        return (
                          <Button
                            key={day}
                            type="button"
                            className="capitalize"
                            variant={isSelected ? 'secondary' : 'outline'}
                            onClick={() => {
                              if (isSelected) {
                                field.onChange(field.value.filter((val) => val !== day));
                              } else {
                                field.onChange([...field.value, day]);
                              }
                            }}
                          >
                            {day}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors?.available_days && <p className="text-red-500 text-sm mt-1">{errors?.available_days?.message}</p>}
              </div>

              <Separator />

              {/* Dynamic Time Slots */}
              <div className="flex flex-col">
                <div className="w-full flex justify-between">
                  <Label htmlFor="time_slots">Time Slots</Label>

                  <span className={cn(buttonVariants({ variant: 'outline' }), 'text-xs cursor-pointer')} onClick={() => addTimeSlotField({ start: '', end: '' })}>
                    Add Time Slot
                  </span>
                </div>

                {timeSlotsFields.length === 0 && <p className="text-red-500 text-sm mt-1">At least one time slot is required</p>}

                {/* slots */}
                <div className="space-y-2">
                  {timeSlotsFields.map((slotField, index) => (
                    <p key={slotField.id} className="flex flex-wrap md:flex-nowrap gap-2 py-2 items-center">
                      <Input
                        type="time"
                        required
                        {...register(`time_slots.${index}.start`, {
                          required: 'Field Required',
                        })}
                        className={`${errors?.time_slots?.[index]?.start?.message && 'border-red-400'}`}
                      />

                      <span>to</span>
                      <Input
                        type="time"
                        required
                        {...register(`time_slots.${index}.end`, {
                          required: 'Field Required',
                        })}
                        className={`${errors?.time_slots?.[index]?.end?.message && 'border-red-400'}`}
                      />

                      <span className={cn(buttonVariants({ variant: 'outline' }), 'text-xs border-none cursor-pointer')} onClick={() => handleRemoveSlotField(index)}>
                        Remove
                      </span>
                    </p>
                  ))}
                  {errors?.time_slots && <p className="text-red-500 text-sm mt-1">Fields Requireds</p>}
                </div>
              </div>

              {/* Dynamic Blackout Dates */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="blackout_dates">Blackout Date</Label>
                <Controller
                  control={control}
                  name="blackout_dates"
                  rules={{
                    validate: (value) => (!value || value.length === 0 ? 'Please select at least one blackout date' : true),
                  }}
                  render={({ field, formState: { errors } }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value && field.value.length > 0 ? <span>{field.value.length} dates selected</span> : <span>Select Dates</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Calendar
                          mode="multiple"
                          selected={field.value ? field.value.map((d) => new Date(d)) : []}
                          onSelect={(dates) => {
                            const formatted = dates.map((d) => format(d, 'yyyy-MM-dd'));
                            field.onChange(formatted);
                          }}
                          disabled={{ before: new Date() }}
                          initialFocus
                        />
                      </PopoverContent>

                      {/* Display Selected Dates */}
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((date, id) => (
                            <div key={id} className="flex items-center gap-1 px-2 py-1 border rounded text-sm bg-muted">
                              {format(date, 'PPP')}
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = field.value.filter((d) => d !== date);
                                  field.onChange(updated);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </Popover>
                  )}
                />
                {errors?.blackout_dates && <p className="text-red-500 text-sm mt-1">{errors?.blackout_dates?.message}</p>}
              </div>
            </div>
          )}

          {/* Instant Confirmation & Lead Time */}
          <div className="flex justify-between items-center py-4">
            <div>
              <Label>Instant Confirmation</Label>
              <CardDescription aschild="true">
                <p>Automatically confirm bookings without manual approval</p>
              </CardDescription>
            </div>
            <Controller
              control={control}
              name="instant_confirmation"
              render={({ field }) => <Switch className="data-[state=checked]:bg-secondaryDark" checked={field.value} onCheckedChange={field.onChange} />}
            />
          </div>

          <div className="flex justify-between items-center flex-col sm:flex-row gap-6 py-4 ">
            <div className="w-full space-y-2">
              <Label htmlFor="minimum_lead_time">Minimum Lead Time ( hours )</Label>
              <Input
                id="minimum_lead_time"
                type="number"
                min="1"
                {...register('minimum_lead_time', {
                  required: 'Lead Time Required',
                  valueAsNumber: true,
                })}
                required
              />
              {errors?.minimum_lead_time && <p className="text-red-500 text-sm mt-1">{errors?.minimum_lead_time?.message}</p>}
            </div>

            <div className="w-full space-y-2">
              <Label htmlFor="maximum_passengers">Maximum Passengers</Label>
              <Input
                id="maximum_passengers"
                type="number"
                min="1"
                {...register('maximum_passengers', {
                  required: 'Maximum Passenger Required',
                  valueAsNumber: true,
                })}
                required
              />
              {errors?.maximum_passengers && <p className="text-red-500 text-sm mt-1">{errors?.maximum_passengers?.message}</p>}
            </div>
          </div>

          <CardDescription aschild="true">
            <span className="text-sm ">Minimum time required before the transfer service</span>
          </CardDescription>
        </CardContent>
      </CardHeader>
    </Card>
  );
};

export default ScheduleTabAdmin;
