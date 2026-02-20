'use client';
import React from 'react';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import BreakSection from '@/app/components/BreakSection';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

export const NotificationSetting = () => {
  const form = useForm({
    defaultValues: {
      notifyabout: 'nothing',
      communication: false,
      marketing: false,
      social: false,
      security: false,
    },
  });

  const { isDirty } = form.formState;

  //initialize toast
  const { toast } = useToast();

  // Handle form submission
  const onSubmit = (formdata) => {
    console.log(formdata);

    //on success
    toast({
      title: 'Settings Changed SuccessFully',
    });
  };

  return (
    <Card className="shadow-none border-none bg-transparent space-y-8 w-full dark:bg-inherit">
      <div className="space-y-2 w-full">
        <CardTitle className="text-black font-medium text-lg">Notification</CardTitle>
        <CardDescription className="text-[#71717A] text-sm">Configure how you receive notifications.</CardDescription>
      </div>
      <BreakSection className={'my-4 w-full'} />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          {/* Radio Group - Notify me about */}
          <FormField
            control={form.control}
            name="notifyabout"
            render={({ field }) => (
              <FormItem>
                <Label className="text-sm font-medium">Notify me about...</Label>
                <RadioGroup value={field.value} onValueChange={field.onChange} className="space-y-2">
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="option-one" />
                    <Label htmlFor="option-one" className="font-normal px-2" style={{ margin: 0 }}>
                      All new messages
                    </Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="direct" id="option-two" />
                    <Label htmlFor="option-two" className="font-normal px-2" style={{ margin: 0 }}>
                      Direct messages and mentions
                    </Label>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <RadioGroupItem value="nothing" id="option-three" />
                    <Label htmlFor="option-three" className="font-normal px-2" style={{ margin: 0 }}>
                      Nothing
                    </Label>
                  </FormItem>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Communication Checkbox */}
          <FormField
            control={form.control}
            name="communication"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-center  justify-evenly space-y-2 border p-4 rounded-md">
                <Card className={'w-full bg-inherit shadow-none border-none dark:bg-inherit'}>
                  <Label className="text-sm font-medium  ">Communication emails</Label>
                  <CardDescription className="text-xs text-gray-500">Get updates about your account activity.</CardDescription>
                </Card>
                <FormControl>
                  <Switch className={'self-start data-[state=checked]:bg-secondaryDark'} checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Marketing Checkbox */}
          <FormField
            control={form.control}
            name="marketing"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-center  justify-evenly space-y-2 border p-4 rounded-md">
                <Card className={'w-full bg-inherit shadow-none border-none dark:bg-inherit'}>
                  <Label className="text-sm font-medium">Marketing emails</Label>
                  <CardDescription className="text-xs text-gray-500">Receive emails abouts new products, features, and more.</CardDescription>
                </Card>
                <FormControl>
                  <Switch className={'self-start data-[state=checked]:bg-secondaryDark'} checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Social Checkbox */}
          <FormField
            control={form.control}
            name="social"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-center  justify-evenly space-y-2 border p-4 rounded-md">
                <Card className={'w-full bg-inherit shadow-none border-none dark:bg-inherit'}>
                  <Label className="text-sm font-medium">Social emails</Label>
                  <CardDescription className="text-xs text-gray-500">Receive emails for friend requests, follows and more.</CardDescription>
                </Card>
                <FormControl>
                  <Switch className={'self-start data-[state=checked]:bg-secondaryDark'} checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          {/* Security Checkbox */}
          <FormField
            control={form.control}
            name="security"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row items-center  justify-evenly space-y-2 border p-4 rounded-md">
                <Card className={'w-full bg-inherit shadow-none border-none dark:bg-inherit'}>
                  <Label className="text-sm font-medium">Security emails</Label>
                  <CardDescription className="text-xs text-gray-500">Receive emails about your account activity and security.</CardDescription>
                </Card>
                <FormControl>
                  <Switch className={'self-start data-[state=checked]:bg-secondaryDark'} checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <Button disabled={!isDirty} type="submit" className={'bg-secondaryDark'}>
            Update notifications
          </Button>
        </form>
      </Form>
    </Card>
  );
};
