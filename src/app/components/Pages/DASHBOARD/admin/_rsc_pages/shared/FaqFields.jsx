'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const FaqFields = () => {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faqs',
    keyName: 'fieldArrayId',
  });

  return (
    <Card className="flex flex-col gap-4 py-4 shadow-none border-none">
      <CardHeader className="flex-row justify-between p-4">
        <div className="space-y-2">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardContent className="p-0">Add common questions and answers customers may ask before booking.</CardContent>
        </div>
        <Button
          type="button"
          className="self-end border border-weelp-sage-deep bg-weelp-sage-deep text-white hover:bg-weelp-sage-deep/90 hover:text-white"
          onClick={() => append({ question: '', answer: '' })}
        >
          Add FAQ
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {fields.map((field, index) => (
          <Card key={field.fieldArrayId} className="w-full py-4 space-y-8 relative">
            <div className="absolute top-4 right-4">
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} aria-label="Remove FAQ">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <FormField
              control={control}
              name={`faqs.${index}.question`}
              rules={{ required: 'Question is required' }}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter the question" className="text-xs focus-visible:ring-weelp-sage-deep" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`faqs.${index}.answer`}
              rules={{ required: 'Answer is required' }}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter the answer" className="text-xs focus-visible:ring-weelp-sage-deep" />
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

export default FaqFields;
