'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/ui/TagInput';
import { EnhancedUrlInput } from '@/components/ui/EnhancedUrlInput';
import { editUserProfileAction } from '@/lib/actions/userActions';

const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  username: z.string().readonly(),
  email: z.string().email().readonly(),
  bio: z.string().optional(),
  interest: z.array(z.string()).optional(),
  urls: z
    .array(
      z.object({
        label: z.string().optional(),
        url: z.string().url().optional().or(z.literal('')),
      }),
    )
    .optional(),
});

export function ProfileSettings({ user }) {
  const { toast } = useToast();
  const { name, email, meta, profile } = user;

  let parsedInterest = [];
  try {
    if (typeof meta?.interest === 'string') {
      parsedInterest = JSON.parse(meta.interest);
    } else if (Array.isArray(meta?.interest)) {
      parsedInterest = meta.interest;
    }
  } catch (e) {
    parsedInterest = [];
  }

  const form = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: name || '',
      username: meta?.username || user?.username || name?.toLowerCase()?.replace(/\s+/g, '') || '',
      email: email || '',
      bio: meta?.bio || '',
      interest: parsedInterest,
      urls: profile?.urls?.length > 0 ? profile.urls : [{ label: '', url: '' }],
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = form;

  const onSubmit = async (data) => {
    try {
      const result = await editUserProfileAction({
        name: data.name,
        bio: data.bio,
        interest: JSON.stringify(data.interest),
        urls: data.urls.filter((u) => u.label || u.url),
      });

      if (result.success) {
        toast({
          title: result.message || 'Profile updated successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: result.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <fieldset disabled={isSubmitting} className={`${isSubmitting ? 'cursor-wait' : ''}`}>
          {/* Full Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormDescription>This is your display name on the platform.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Username (Read-only) */}
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="bg-gray-100 text-gray-700 opacity-100 dark:bg-zinc-800 dark:text-gray-300 pointer-events-none" />
                </FormControl>
                <FormDescription>Your unique username. Cannot be changed.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email (Read-only) */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} disabled className="bg-gray-100 text-gray-700 opacity-100 dark:bg-zinc-800 dark:text-gray-300 pointer-events-none" />
                </FormControl>
                <FormDescription>Manage email in Account settings.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Bio */}
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea className="resize-none" placeholder="Write something about yourself" rows={4} {...field} />
                </FormControl>
                <FormDescription>Introduce yourself to the community.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Interests */}
          <FormField
            control={form.control}
            name="interest"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Interests</FormLabel>
                <FormControl>
                  <TagInput value={field.value || []} onChange={field.onChange} placeholder="Add interests (e.g., travel, photography, hiking)" />
                </FormControl>
                <FormDescription>Press Enter to add interests.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* URLs */}
          <FormField
            control={form.control}
            name="urls"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URLs</FormLabel>
                <FormControl>
                  <EnhancedUrlInput value={field.value || [{ label: '', url: '' }]} onChange={field.onChange} />
                </FormControl>
                <FormDescription>Add links to your website or social media.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={!isValid || isSubmitting} className="bg-secondaryDark">
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
