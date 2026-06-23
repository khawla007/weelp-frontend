'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TagInput } from '@/components/ui/TagInput';
import { EnhancedUrlInput } from '@/components/ui/EnhancedUrlInput';
import { editUserProfileAction } from '@/lib/actions/userActions';

const profileSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  username: z.string().readonly(),
  email: z.string().email().readonly(),
  gender: z.enum(['male', 'female', 'other', '']).optional(),
  bio: z.string().optional(),
  interest: z.array(z.string()).optional(),
  urls: z
    .array(
      z.object({
        label: z.string().optional(),
        url: z.string().optional(),
      }),
    )
    .optional(),
});

export function ProfileSettings({ user }) {
  const { update } = useSession();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar || null);
  const { name, email, meta, profile } = user;

  // AvatarService already persisted profile.avatar on the backend, so we only
  // need to refresh local copies: the page's SWR cache and the NextAuth session
  // (which the header reads via useSession).
  const handleAvatarUpload = async (url) => {
    try {
      setAvatarUrl(url);
      await update({ avatar: url });
      await mutate('/api/customer/profile');
      toast({ title: 'Avatar updated successfully' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to refresh avatar' });
    }
  };

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
      gender: profile?.gender || '',
      bio: meta?.bio || '',
      interest: parsedInterest,
      urls: profile?.urls?.length > 0 ? profile.urls : [{ label: '', url: '' }],
    },
  });

  const {
    handleSubmit,
    formState: { isValid, isDirty, isSubmitting },
  } = form;

  const onSubmit = async (data) => {
    try {
      const result = await editUserProfileAction({
        name: data.name,
        bio: data.bio,
        gender: data.gender || null,
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
          {/* Avatar Upload */}
          <div className="space-y-4 pb-6 border-b">
            <h3 className="text-base font-medium">Profile Picture</h3>
            <AvatarUpload currentAvatar={avatarUrl} onUploadSuccess={handleAvatarUpload} userName={name} />
          </div>

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
                  <Input {...field} readOnly tabIndex={-1} className="bg-muted text-muted-foreground opacity-100 pointer-events-none cursor-default" />
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
                  <Input {...field} readOnly tabIndex={-1} className="bg-muted text-muted-foreground opacity-100 pointer-events-none cursor-default" />
                </FormControl>
                <FormDescription>Manage email in Account settings.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Gender */}
          <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>This helps personalize your experience.</FormDescription>
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
                <FormDescription>Type and press comma or Enter to add interests.</FormDescription>
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

          <Button
            type="submit"
            disabled={!isDirty || !isValid || isSubmitting}
            className="bg-weelp-sage-deep border border-weelp-sage-deep text-white hover:bg-weelp-sage-hover hover:border-weelp-sage-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
}
