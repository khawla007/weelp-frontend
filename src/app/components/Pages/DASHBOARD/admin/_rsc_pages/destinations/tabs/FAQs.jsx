'use client';
import { useFormContext, useFieldArray, useWatch } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

const FaqTab = ({ currentStep, setCurrentStep }) => {
  const { control, trigger, getValues, setError, clearErrors } = useFormContext();

  const faqs = useWatch({ control, name: 'faqs' });

  const {
    fields: faqFields,
    append: addFaqField,
    remove: removeFaqField,
  } = useFieldArray({
    control,
    name: 'faqs',
  });

  return (
    <Card className="flex flex-col gap-4 py-4 shadow-none border-none">
      <CardHeader className="flex-row justify-between p-4">
        <div className="space-y-2">
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardContent className=" p-0">Add common questions and answers about this package</CardContent>
        </div>
        {/* Add FAQ Button */}
        <Button type="button" className="bg-white hover:bg-white border text-inherit self-end" onClick={() => addFaqField({ question: '', answer: '' })}>
          Add Section
        </Button>
      </CardHeader>

      <CardContent>
        {faqFields.map((field, index) => (
          <Card key={field.id} className="w-full py-4 space-y-8 relative">
            {/* Remove FAQ Button */}
            <div className="absolute top-4 right-4">
              <Button type="button" variant="ghost" size="icon" onClick={() => removeFaqField(index)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Question */}
            <FormField
              control={control}
              name={`faqs.${index}.question`}
              rules={{ required: 'Question Required' }}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Question</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Enter the Question" className="text-xs focus-visible:ring-secondaryDark" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Answer */}
            <FormField
              control={control}
              name={`faqs.${index}.answer`}
              rules={{ required: 'Answer Required' }}
              render={({ field }) => (
                <FormItem className="px-4 space-y-2">
                  <FormLabel>Answer</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter the Answer" className="text-xs focus-visible:ring-secondaryDark" />
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

export default FaqTab;
