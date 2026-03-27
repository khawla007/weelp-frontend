'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardDescription, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useUIStore } from '@/lib/store/uiStore';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { useState } from 'react';
import { editUserProfileAction } from '@/lib/actions/userActions';

const formSchema = z.object({
  font: z.string().min(1, 'Font selection is required'),
  theme: z.enum(['light', 'dark']),
});

export function AppearanceSettings({ user }) {
  const { theme, setTheme, font, setFont } = useUIStore();
  const { toast } = useToast();
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatar || null);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      font: font,
      theme: theme,
    },
  });

  const selectedTheme = form.watch('theme');
  const { isDirty } = form.formState;

  const onSubmit = (data) => {
    setTheme(data.theme);
    setFont(data.font);
    toast({
      title: 'Settings Updated Successfully',
    });
  };

  const handleAvatarUpload = async (url) => {
    setIsSavingAvatar(true);
    try {
      await editUserProfileAction({ avatar: url });
      toast({
        title: 'Avatar updated successfully',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to save avatar',
      });
    } finally {
      setIsSavingAvatar(false);
    }
  };

  return (
    <Card className="shadow-none border-none bg-transparent space-y-8 dark:bg-black">
      <div className="space-y-2">
        <CardTitle className="text-black font-medium text-lg">Appearance</CardTitle>
        <CardDescription className="text-[#71717A] text-sm">Customize the appearance of the app.</CardDescription>
      </div>

      {/* Avatar Upload Section */}
      <div className="space-y-4 pb-6 border-b">
        <h3 className="text-base font-medium">Profile Picture</h3>
        <AvatarUpload currentAvatar={avatarUrl} onUploadSuccess={handleAvatarUpload} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-md">
          <FormField
            control={form.control}
            name="font"
            render={({ field }) => (
              <FormItem>
                <Label>Font</Label>
                <FormControl>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="max-w-56 w-full">
                      <SelectValue placeholder="Select font" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
                <FormDescription className="text-sm">Set the font for dashboard</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="theme"
            render={({ field }) => (
              <FormItem>
                <Label>Theme</Label>
                <FormControl>
                  <RadioGroup onValueChange={field.onChange} value={field.value} className="flex space-x-4">
                    <FormItem className={`p-4 cursor-pointer border-2 flex items-center gap-2 rounded-md ${selectedTheme === 'light' ? 'border-secondaryDark bg-secondaryLight2' : ''}`}>
                      <FormControl>
                        <RadioGroupItem value="light" id="light" className="hidden" />
                      </FormControl>
                      <Label htmlFor="light">
                        <span className="sr-only">Light Mode</span>
                        <img src="/assets/images/LightMode.png" alt="Light mode" />
                      </Label>
                    </FormItem>

                    <FormItem className={`p-4 cursor-pointer border-2 flex items-center gap-2 rounded-md ${selectedTheme === 'dark' ? 'border-secondaryDark bg-secondaryLight2' : ''}`}>
                      <FormControl>
                        <RadioGroupItem value="dark" id="dark" className="hidden" />
                      </FormControl>
                      <Label htmlFor="dark">
                        <span className="sr-only">Dark Mode</span>
                        <img src="/assets/images/DarkMode.png" alt="Dark mode" />
                      </Label>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
                <FormDescription className="text-sm">Select the theme for dashboard</FormDescription>
              </FormItem>
            )}
          />

          <Button disabled={!isDirty} type="submit" className="bg-secondaryDark">
            Update Preferences
          </Button>
        </form>
      </Form>
    </Card>
  );
}
