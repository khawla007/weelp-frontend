'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { editUserProfileAction } from '@/lib/actions/userActions';
import { Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

export function EditProfile({ user }) {
  const { toast } = useToast();
  const { name, email, meta, profile } = user;
  console.log(profile);

  // Then use optional chaining and default values
  const bio = meta?.bio || '';
  const urls = profile?.urls || [];

  const form = useForm({
    defaultValues: {
      username: name,
      email: email,
      bio: bio ?? ' ',
      urls: [
        { label: '', url: '' }, // At least one item to start
      ],
    },
  });

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
  } = form;

  // Handling dynamic fields
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'urls',
  });
  // handle Submission
  const onSubmit = async (data) => {
    try {
      // console.log(data);
      // Send to server action
      await editUserProfileAction(data);
      const { success, message } = result;
      // sucesss
      if (success) {
        toast({
          title: message ?? 'Data Submitted SuccessFully',
        });
        return;
      }
      // on failed
      toast({
        variant: 'destructive',
        title: message ?? 'Data not submitted',
      });
    } catch (error) {
      // error
      toast({
        variant: 'destructive',
        title: 'Something Went Wrong',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={isSubmitting} className={`${isSubmitting ? 'cursor-wait' : 'cursor-pointer'}`}>
          {/* Username */}
          <FormField
            control={control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} disabled />
                </FormControl>
                <FormDescription>This is your public display name.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="shadcn" {...field} disabled />
                </FormControl>
                <FormDescription>You can manage verified email addresses in your email settings.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" placeholder="Write something about yourself" {...field} />
                </FormControl>
                <FormDescription>You can @mention other users and organizations to link to them.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URLs (Dynamic Array of Fields) */}
          <div className="space-y-2">
            <FormLabel className="font-semibold">URLs</FormLabel>
            <FormDescription>Add links to your website, blog, or social media profiles.</FormDescription>

            {fields.map((field, index) => (
              <div key={field.id} className="flex flex-col gap-2 md:flex-row items-center">
                {/* Label Field */}
                <FormField
                  control={control}
                  name={`urls.${index}.label`} // Label input
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-1/3">
                      <Label>Label</Label>
                      <FormControl>
                        <Input {...field} placeholder="e.g., Twitter" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL Field */}
                <FormField
                  control={control}
                  name={`urls.${index}.url`} // URL input
                  render={({ field }) => (
                    <FormItem className="w-full sm:w-2/3">
                      <Label>Url Link</Label>
                      <FormControl>
                        <Input {...field} type="url" placeholder="http://twitter.com" />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="button" onClick={() => remove(index)} variant="destructive" className="self-end">
                  <Trash2 />
                </Button>
              </div>
            ))}

            <Button type="button" className={'bg-white text-black border hover:bg-black hover:text-white'} onClick={() => append('')}>
              + Add URL
            </Button>
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={!isValid} className={'bg-secondaryDark mt-4'}>
            {isSubmitting ? 'Updating Profile' : 'Update Profile'}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
