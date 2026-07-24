'use client';

import React, { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import Image from 'next/image';
import { useTogglePassword } from '@/hooks/useTogglePassword';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

// Zod schema for validation - matching RegisterForm requirements
const schema = z
  .object({
    password: z
      .string()
      .nonempty('Password Required')
      .min(8, 'Must be at least 8 characters long')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter (A-Z)')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter (a-z)')
      .regex(/\d/, 'Must contain at least one number (0-9)')
      .regex(/[@#$%^&+=]/, 'Must contain at least one special character (@#$%^&+=)'),

    password_confirmation: z.string().nonempty('Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'], // Error will be associated with password_confirmation
  });

export const FormResetPassword = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState('');
  const { visible: passwordVisible, toggle: togglePassword } = useTogglePassword();
  const { visible: confirmationVisible, toggle: toggleConfirmation } = useTogglePassword();

  // Helper function to check if password meets all requirements
  const isPasswordValid = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&+=]/.test(pwd);
  };

  //Create Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Watch password fields for live validation
  // eslint-disable-next-line react-hooks/incompatible-library
  const password = watch('password');

  const passwordConfirmation = watch('password_confirmation');

  if (!token) {
    return (
      <div role="alert" className="w-full min-w-0 max-w-md space-y-4 rounded-xl border bg-background p-6 shadow-md">
        <h2 className="text-xl font-semibold">Reset link is missing or invalid</h2>
        <p className="text-sm text-copy">Request a new password reset link to continue, or return to login.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <NavigationLink href="/user/forgot-password" className="inline-flex min-h-11 items-center justify-center rounded-md bg-weelp-sage-deep px-4 text-sm font-medium text-white">
            Request a new reset link
          </NavigationLink>
          <NavigationLink href="/user/login" className="inline-flex min-h-11 items-center justify-center rounded-md border px-4 text-sm font-medium">
            Back to login
          </NavigationLink>
        </div>
      </div>
    );
  }

  const onSubmit = async (data) => {
    setServerError('');

    try {
      const { password, password_confirmation } = data;

      const response = await axios.post('/api/public/user/reset', {
        password,
        password_confirmation,
        token,
      });

      // show toast
      if (response.status === 200) {
        const { message } = response?.data;

        // on success - show toast and redirect to login
        toast({
          variant: 'success',
          title: message,
        });

        // Redirect to login page after showing toast
        setTimeout(() => {
          router.push('/user/login');
        }, 1500);

        reset();
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Something Went Wrong';
      setServerError(message);
      toast({
        variant: 'destructive',
        title: message,
      });
    }
  };
  return (
    <div className={`w-full min-w-0 max-w-fit space-y-4 rounded-xl border bg-background pb-8 shadow-md sm:max-w-md ${isSubmitting && 'cursor-wait'}`}>
      <div className="bg-background rounded-t-xl border-b py-4 px-8">
        <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="min-w-0 space-y-4 bg-background px-8 py-4">
        <div>
          <h3 className="font-semibold text-xl">
            Reset Password or back to{' '}
            <NavigationLink
              href="/user/login"
              className="inline-flex min-h-11 items-center rounded-sm underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2"
            >
              Login
            </NavigationLink>
          </h3>
          <sub className="text-copy">Enter your new password below.</sub>
        </div>

        {serverError && (
          <div role="alert" className="space-y-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-foreground">
            <p>{serverError}</p>
            <NavigationLink href="/user/forgot-password" className="inline-flex min-h-11 items-center font-medium text-weelp-sage-text underline">
              Request a new reset link
            </NavigationLink>
          </div>
        )}

        {/* Password Input */}
        <div className="relative mb-4 min-w-0 border">
          <label
            htmlFor="password"
            className="relative flex min-w-0 items-center rounded-md border bg-background p-1 pl-2 shadow-md focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30"
          >
            <Key aria-hidden="true" className="text-copy size-4 shrink-0" />
            <input
              placeholder="New password"
              type={passwordVisible ? 'text' : 'password'}
              id="password"
              {...register('password')}
              aria-label="New password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'reset-password-error' : undefined}
              autoComplete="new-password"
              className="mt-1 min-w-0 flex-1 bg-background px-3 py-2 text-base placeholder:bg-background focus:outline-none"
            />
            <button
              type="button"
              onClick={togglePassword}
              aria-label={passwordVisible ? 'Hide password' : 'Show password'}
              aria-pressed={passwordVisible}
              className="size-11 shrink-0 rounded-md text-copy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-1"
            >
              {passwordVisible ? <EyeOff aria-hidden="true" className="mx-auto size-5" /> : <Eye aria-hidden="true" className="mx-auto size-5" />}
            </button>
          </label>
          {errors.password && (
            <p id="reset-password-error" role="alert" className="pt-2 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}

          {/* Password Requirements Checklist */}
          {password && (
            <>
              <div className="mt-2 space-y-1 text-xs">
                <p className="text-muted-foreground font-medium mb-1">Password must contain:</p>
                <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {password.length >= 8 ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                  <span>At least 8 characters</span>
                </div>
                <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {/[A-Z]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                  <span>One uppercase letter (A-Z)</span>
                </div>
                <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {/[a-z]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                  <span>One lowercase letter (a-z)</span>
                </div>
                <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {/[0-9]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                  <span>One number (0-9)</span>
                </div>
                <div className={`flex items-center gap-1 ${/[@#$%^&+=]/.test(password) ? 'text-green-600' : 'text-muted-foreground'}`}>
                  {/[@#$%^&+=]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                  <span>One special character (@#$%^&amp;+=)</span>
                </div>
              </div>
              {/* Password strength message */}
              {password.length > 0 && !isPasswordValid(password) && <p className="text-sm text-orange-500 mt-2">Please meet all password requirements</p>}
            </>
          )}
        </div>

        {/* Confirm Password Input */}
        <div>
          <label
            htmlFor="password_confirmation"
            className="relative flex min-w-0 items-center rounded-md border bg-background p-1 px-2 shadow-md focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30"
          >
            <Key aria-hidden="true" className="text-copy size-4 shrink-0" />
            <input
              placeholder="Confirm new password"
              type={confirmationVisible ? 'text' : 'password'}
              id="password_confirmation"
              {...register('password_confirmation')}
              aria-label="Confirm new password"
              aria-invalid={Boolean(errors.password_confirmation)}
              aria-describedby={errors.password_confirmation ? 'reset-password-confirmation-error' : undefined}
              autoComplete="new-password"
              className="mt-1 min-w-0 flex-1 bg-background px-3 py-2 pr-8 text-base placeholder:bg-background focus:outline-none"
            />
            {/* Live password match indicator */}
            {passwordConfirmation && (
              <div aria-hidden="true" className="absolute right-12">
                {password === passwordConfirmation ? <Check className="text-green-500 size-5" strokeWidth={3} /> : <X className="text-red-500 size-5" strokeWidth={3} />}
              </div>
            )}
            <button
              type="button"
              onClick={toggleConfirmation}
              aria-label={confirmationVisible ? 'Hide password confirmation' : 'Show password confirmation'}
              aria-pressed={confirmationVisible}
              className="size-11 shrink-0 rounded-md text-copy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-1"
            >
              {confirmationVisible ? <EyeOff aria-hidden="true" className="mx-auto size-5" /> : <Eye aria-hidden="true" className="mx-auto size-5" />}
            </button>
          </label>
          {errors.password_confirmation && (
            <p id="reset-password-confirmation-error" role="alert" className="pt-2 text-sm text-red-600">
              {errors.password_confirmation.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting || !password || !isPasswordValid(password) || password !== passwordConfirmation}
          className={`w-full p-4 rounded-md ${
            isSubmitting || !password || !isPasswordValid(password) || password !== passwordConfirmation
              ? 'bg-muted-foreground cursor-not-allowed'
              : 'bg-weelp-sage-deep hover:bg-weelp-sage-tint text-white'
          }`}
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
};
