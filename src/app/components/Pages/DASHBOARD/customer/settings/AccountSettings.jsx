'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';

const addressSchema = z.object({
  phone: z.string().optional(),
  address_line_1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  post_code: z.string().optional(),
});

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords don't match",
    path: ['password_confirmation'],
  });

// Tab Button Component
const TabButton = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-4 py-2 font-medium transition-colors border-b-2 ${active ? 'border-secondaryDark text-secondaryDark' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
  >
    {children}
  </button>
);

export function AccountSettings({ user }) {
  const [activeTab, setActiveTab] = useState('contact');
  const { toast } = useToast();
  const { profile } = user;

  // Address Form
  const addressForm = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      phone: profile?.phone || '',
      address_line_1: profile?.address_line_1 || '',
      city: profile?.city || '',
      state: profile?.state || '',
      country: profile?.country || '',
      post_code: profile?.post_code || '',
    },
  });

  // Password Form
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      password: '',
      password_confirmation: '',
    },
  });

  const onAddressSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:8000/api/customer/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Contact information updated successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: result.error || 'Failed to update contact information',
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong',
      });
    }
  };

  const onPasswordSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:8000/api/customer/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: 'Password changed successfully',
        });
        passwordForm.reset();
      } else {
        toast({
          variant: 'destructive',
          title: result.error || 'Failed to change password',
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
    <div className="space-y-6">
      <h2 className="font-bold text-lg">Account Settings</h2>
      <p className="text-base text-[#71717A]">Manage your contact information and security settings.</p>

      {/* Tabs */}
      <div className="flex border-b">
        <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')}>
          Contact & Address
        </TabButton>
        <TabButton active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
          Security
        </TabButton>
      </div>

      {/* Contact & Address Tab */}
      {activeTab === 'contact' && (
        <Form {...addressForm}>
          <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-6 max-w-md">
            <FormField
              control={addressForm.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <Label>Phone</Label>
                  <FormControl>
                    <Input type="tel" placeholder="+1 234 567 8900" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={addressForm.control}
              name="address_line_1"
              render={({ field }) => (
                <FormItem>
                  <Label>Address Line 1</Label>
                  <FormControl>
                    <Input placeholder="123 Main Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={addressForm.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <Label>City</Label>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <Label>State</Label>
                    <FormControl>
                      <Input placeholder="NY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={addressForm.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <Label>Country</Label>
                    <FormControl>
                      <Input placeholder="United States" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={addressForm.control}
                name="post_code"
                render={({ field }) => (
                  <FormItem>
                    <Label>Post Code</Label>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="bg-secondaryDark">
              Save Contact Information
            </Button>
          </form>
        </Form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-8 max-w-md">
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Change Password</h3>
                <p className="text-sm text-muted-foreground">Enter your current password and a new password to update your credentials.</p>
              </div>

              <FormField
                control={passwordForm.control}
                name="current_password"
                render={({ field }) => (
                  <FormItem>
                    <Label>Current Password</Label>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <Label>New Password</Label>
                    <FormControl>
                      <Input type="password" placeholder="Min 8 characters" {...field} />
                    </FormControl>
                    <FormDescription>Must be at least 8 characters long.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={passwordForm.control}
                name="password_confirmation"
                render={({ field }) => (
                  <FormItem>
                    <Label>Confirm New Password</Label>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="bg-secondaryDark">
                Change Password
              </Button>
            </form>
          </Form>

          {/* Email Section (Read-only for now) */}
          <div className="space-y-4 pt-6 border-t">
            <h3 className="font-medium">Email Address</h3>
            <div className="p-4 bg-muted rounded-md">
              <p className="text-sm">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-1">Contact support to change your email address.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
