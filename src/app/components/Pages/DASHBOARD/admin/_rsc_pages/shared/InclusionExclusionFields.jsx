'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

const TYPE_OPTIONS = [
  { label: 'Activity', value: 'activity' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Meal', value: 'meal' },
  { label: 'Equipment', value: 'equipment' },
  { label: 'Other', value: 'other' },
];

const InclusionExclusionFields = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'inclusions_exclusions',
    keyName: 'fieldArrayId',
  });

  return (
    <Card className="flex flex-col gap-4 py-4 shadow-none border-none">
      <CardHeader className="flex-row justify-between p-4">
        <div className="space-y-2">
          <CardTitle>Inclusions & Exclusions</CardTitle>
          <CardContent className="p-0">Add what customers get with this activity and what remains outside the price.</CardContent>
        </div>
        <Button
          type="button"
          className="self-end border border-weelp-sage-deep bg-weelp-sage-deep text-white hover:bg-weelp-sage-deep/90 hover:text-white"
          onClick={() => append({ type: 'activity', title: '', description: '', included: true })}
        >
          Add Item
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {fields.map((item, index) => (
          <Card key={item.fieldArrayId} className="w-full py-4 space-y-6 relative">
            <div className="absolute top-4 right-4">
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove inclusion">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 px-4 md:grid-cols-[180px_1fr_auto] md:items-start">
              <FormField
                control={control}
                name={`inclusions_exclusions.${index}.type`}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value || 'activity'} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger className="focus:ring-weelp-sage-deep">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TYPE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`inclusions_exclusions.${index}.title`}
                rules={{ required: 'Title is required' }}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Hotel pickup and drop-off" className="focus-visible:ring-weelp-sage-deep" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`inclusions_exclusions.${index}.included`}
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Included</FormLabel>
                    <FormControl>
                      <Switch checked={!!field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={control}
              name={`inclusions_exclusions.${index}.description`}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Optional details shown under the title" className="focus-visible:ring-weelp-sage-deep" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

export default InclusionExclusionFields;
