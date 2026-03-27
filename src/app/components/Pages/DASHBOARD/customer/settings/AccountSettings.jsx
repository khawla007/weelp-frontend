'use client';

import { useState, useCallback } from 'react';
import { changePasswordAction, editUserProfileAction } from '@/lib/actions/userActions';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormDescription, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Check, X, Eye, EyeOff } from 'lucide-react';
import { useTogglePassword } from '@/hooks/useTogglePassword';

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
    current_password: z.string().nonempty('Current password is required'),
    password: z
      .string()
      .nonempty('Password Required')
      .min(8, 'Must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter (a-z)')
      .regex(/\d/, 'Must contain at least one number (0-9)')
      .regex(/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/, 'Must contain at least one special character'),
    password_confirmation: z.string().nonempty('Please confirm your password'),
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
    className={`px-4 py-2 font-semibold transition-all border-x-0 border-t-0 border-b-[3px] outline-none focus:outline-none ${
      active ? 'border-secondaryDark text-secondaryDark' : 'border-transparent text-muted-foreground hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

export function AccountSettings({ user }) {
  const [activeTab, setActiveTab] = useState('contact');
  const { toast } = useToast();
  const { profile } = user;

  const { visible: currentPwdVisible, toggle: toggleCurrentPwd } = useTogglePassword();
  const { visible: newPwdVisible, toggle: toggleNewPwd } = useTogglePassword();

  // Helper function to check if password meets all requirements
  const isPasswordValid = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(pwd);
  };

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
    mode: 'onChange',
  });

  const watchPassword = passwordForm.watch('password'); // eslint-disable-line react-hooks/incompatible-library
  const watchPasswordConfirmation = passwordForm.watch('password_confirmation');

  const onAddressSubmit = async (data) => {
    try {
      const result = await editUserProfileAction(data);

      if (result.success) {
        toast({
          title: 'Contact information updated successfully',
        });
      } else {
        toast({
          variant: 'destructive',
          title: result.message || 'Failed to update contact information',
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
      const result = await changePasswordAction(data);

      if (result.success) {
        toast({
          title: 'Password changed successfully',
        });
        passwordForm.reset();
      } else {
        // Specifically check for current password error message
        const errorMessage = result.error === 'Current password is incorrect' ? 'Current password entered incorrect' : result.error || 'Failed to change password';

        toast({
          variant: 'destructive',
          title: errorMessage,
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
      <div className="flex gap-4">
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
                      <div className="relative">
                        <Input type={currentPwdVisible ? 'text' : 'password'} {...field} />
                        <button type="button" onClick={toggleCurrentPwd} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {currentPwdVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
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
                      <div className="relative">
                        <Input type={newPwdVisible ? 'text' : 'password'} placeholder="Min 8 characters" {...field} />
                        <button type="button" onClick={toggleNewPwd} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {newPwdVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />

                    {/* Password Requirements Checklist (Register Style) */}
                    {watchPassword && (
                      <div className="mt-2 space-y-1 text-xs">
                        <p className="text-gray-500 font-medium mb-1">Password must contain:</p>
                        <div className={`flex items-center gap-1 ${watchPassword.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                          {watchPassword.length >= 8 ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                          <span>At least 8 characters</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[A-Z]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[A-Z]/.test(watchPassword) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                          <span>One uppercase letter (A-Z)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[a-z]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[a-z]/.test(watchPassword) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                          <span>One lowercase letter (a-z)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[0-9]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[0-9]/.test(watchPassword) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                          <span>One number (0-9)</span>
                        </div>
                        <div className={`flex items-center gap-1 ${/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(watchPassword) ? 'text-green-600' : 'text-gray-400'}`}>
                          {/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(watchPassword) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                          <span>One special character</span>
                        </div>
                      </div>
                    )}
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
                      <div className="relative">
                        <Input type={newPwdVisible ? 'text' : 'password'} {...field} />
                        {watchPasswordConfirmation && (
                          <div className="absolute right-10 top-1/2 -translate-y-1/2">
                            {watchPassword === watchPasswordConfirmation ? <Check className="text-green-500 size-5" strokeWidth={3} /> : <X className="text-red-500 size-5" strokeWidth={2} />}
                          </div>
                        )}
                        <button type="button" onClick={toggleNewPwd} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {newPwdVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={passwordForm.formState.isSubmitting || !isPasswordValid(watchPassword)} className="bg-secondaryDark">
                {passwordForm.formState.isSubmitting ? 'Changing...' : 'Change Password'}
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
