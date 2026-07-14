'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AtSign, Eye, EyeClosed, KeyRound, User, X, LoaderCircle, Check } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useTogglePassword } from '@/hooks/useTogglePassword';
import { useState, useEffect } from 'react';
import { OtpInput } from './OtpInput';
import { signIn } from 'next-auth/react';
import { getSafeAuthReturnUrl } from '@/lib/auth/authRedirect';
import useAuthModalStore from '@/lib/store/useAuthModalStore';

// Zod schema for validation
const schema = z
  .object({
    name: z.string().nonempty('Name is required').min(3, 'Name must be greater than 3 characters'),
    username: z
      .string()
      .nonempty('Username is required')
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be less than 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    email: z.string().nonempty('Email is required').email('Invalid email address'),
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
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export function RegisterForm({ customUrl, onCloseDialog, onSwitchToLogin, showCloseButton = true }) {
  const { visible: passwordVisible, toggle: togglePassword } = useTogglePassword();
  const { visible: confirmationVisible, toggle: toggleConfirmation } = useTogglePassword();
  const { toast } = useToast();
  const { redirectTo: storeRedirectTo, closeAuthModal } = useAuthModalStore();

  // Helper function to check if password meets all requirements
  const isPasswordValid = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&+=]/.test(pwd);
  };

  // Setup form with watch for real-time password match validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      password: '',
      password_confirmation: '',
    },
  });

  // Watch password fields for live validation
  const password = watch('password');
  const passwordConfirmation = watch('password_confirmation');
  const username = watch('username');

  const [step, setStep] = useState('info'); // 'info' | 'otp'
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState('');
  const [timeUntilResend, setTimeUntilResend] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [isOtpSubmitting, setIsOtpSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (step === 'otp' && timeUntilResend > 0) {
      const timer = setTimeout(() => {
        setTimeUntilResend((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeUntilResend]);

  // Check username availability with debounce
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (username && username.length >= 3) {
        setIsCheckingUsername(true);
        setUsernameError('');
        try {
          const response = await axios.get('/api/public/user/check-username', {
            params: { username },
          });
          if (!response.data.available) {
            setUsernameError('Already in use');
          }
        } catch (error) {
          console.error('Username check error:', error);
        } finally {
          setIsCheckingUsername(false);
        }
      } else {
        setUsernameError('');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username]);

  const onSubmitInfo = async (data) => {
    const { name, username, email, password, password_confirmation } = data;

    try {
      const response = await axios.post('/api/public/otp/send', {
        name,
        username,
        email,
        password,
        password_confirmation,
      });

      if (response.status === 201) {
        setFormData(data);
        setStep('otp');
        setTimeUntilResend(response.data.resend_cooldown || 30);

        toast({
          variant: 'success',
          title: 'OTP Sent!',
          description: 'Please check your email for the verification code.',
        });
      }
    } catch (error) {
      const response = error?.response;

      if (response?.status === 422) {
        const { error: errorTitle, message } = response?.data || {};
        toast({
          variant: 'destructive',
          title: errorTitle || 'Validation error',
          description: message,
        });
        return;
      }

      if (response?.status === 429) {
        const retryAfter = response?.data?.retry_after;
        const errorMessage = response?.data?.error || '';

        let description = 'Please try again later.';
        if (retryAfter) {
          const seconds = Math.ceil(retryAfter);
          description = `Please wait ${seconds} seconds before trying again.`;
        } else if (errorMessage.includes('Too many OTP requests')) {
          description = 'You have reached the maximum OTP requests. Please try again after 1 hour.';
        }

        toast({
          variant: 'destructive',
          title: 'Too many requests',
          description,
        });
        return;
      }

      const message = response?.data?.message || 'An unexpected error occurred. Please try again.';
      toast({
        variant: 'destructive',
        title: message,
      });
    }
  };

  const handleResendOtp = async () => {
    if (!formData || timeUntilResend > 0) return;

    setIsResending(true);
    setOtpError('');

    try {
      const response = await axios.post('/api/public/otp/send', {
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      });

      if (response.status === 201) {
        setTimeUntilResend(response.data.resend_cooldown || 30);
        setOtp('');

        toast({
          variant: 'success',
          title: 'OTP Resent!',
          description: 'Please check your email for the new verification code.',
        });
      }
    } catch (error) {
      const response = error?.response;

      if (response?.status === 429) {
        const retryAfter = response?.data?.retry_after;
        const errorMessage = response?.data?.error || '';

        let description = 'Please try again later.';
        if (retryAfter) {
          const seconds = Math.ceil(retryAfter);
          description = `Please wait ${seconds} seconds before trying again.`;
        } else if (errorMessage.includes('Too many OTP requests')) {
          description = 'You have reached the maximum OTP requests. Please try again after 1 hour.';
        }

        toast({
          variant: 'destructive',
          title: 'Too many requests',
          description,
        });
        return;
      }

      toast({
        variant: 'destructive',
        title: 'Failed to resend OTP',
        description: 'Please try again later',
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleOtpComplete = async (otpValue) => {
    setOtpError('');
    setIsOtpSubmitting(true);

    try {
      const response = await axios.post('/api/public/otp/verify', {
        email: formData.email,
        otp: otpValue,
      });

      if (response.status === 201) {
        // First toast: Account created
        toast({
          variant: 'success',
          title: 'Account created!',
        });

        // Auto-login using NextAuth
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          // If onSuccess callback exists in store, don't redirect — AuthModalDialog handles it
          const { onSuccess } = useAuthModalStore.getState();
          if (onSuccess) {
            toast({ variant: 'success', title: 'Welcome to Weelp!' });
            return;
          }

          // Close auth modal if open
          closeAuthModal();
          // Close any parent dialog
          onCloseDialog?.();

          toast({
            variant: 'success',
            title: 'Welcome to Weelp!',
          });

          // Redirect only to a same-origin target or fall back to the dashboard.
          const targetUrl = getSafeAuthReturnUrl(storeRedirectTo) || getSafeAuthReturnUrl(customUrl) || '/dashboard/customer';
          setTimeout(() => {
            window.location.href = targetUrl;
          }, 300);
        } else {
          // Fallback: redirect to login page
          toast({
            variant: 'success',
            title: 'Account created!',
            description: 'Please log in with your credentials.',
          });
          onCloseDialog?.();
          onSwitchToLogin?.();
        }
      }
    } catch (error) {
      const response = error?.response;

      if (response?.status === 404) {
        setOtpError('OTP expired. Please request a new one.');
        return;
      }

      if (response?.status === 422) {
        const attemptsRemaining = response?.data?.attempts_remaining;
        setOtpError(attemptsRemaining > 0 ? `Incorrect OTP. ${attemptsRemaining} attempts remaining.` : 'Maximum attempts exceeded. Please request a new OTP.');
        return;
      }

      if (response?.status === 429) {
        setOtpError('Maximum attempts exceeded. Please request a new OTP.');
        return;
      }

      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsOtpSubmitting(false);
    }
  };

  const handleBackToInfo = () => {
    setStep('info');
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="relative w-full min-w-0 space-y-4 rounded-xl bg-weelp-auth-neu-surface">
      {showCloseButton && (
        <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-background rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
          <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
        </button>
      )}

      {step === 'info' ? (
        <form onSubmit={handleSubmit(onSubmitInfo)} className="w-full min-w-0">
          <fieldset className={`w-full min-w-0 space-y-4 bg-weelp-auth-neu-surface py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
            {/* Name Input */}
            <div>
              <label
                htmlFor="name"
                className="flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 px-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
              >
                <User aria-hidden="true" className="text-copy size-4 shrink-0" />
                <input
                  placeholder="Full Name"
                  type="text"
                  id="name"
                  {...register('name')}
                  aria-label="Full name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? 'register-name-error' : undefined}
                  autoComplete="name"
                  className="mt-1 min-w-0 flex-1 !bg-weelp-auth-neu-surface px-3 py-2 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
                />
              </label>
              {errors.name && (
                <p id="register-name-error" role="alert" className="pt-2 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Username Input */}
            <div>
              <label
                htmlFor="username"
                className="relative flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 px-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
              >
                <User aria-hidden="true" className="text-copy size-4 shrink-0" />
                <input
                  placeholder="Username"
                  type="text"
                  id="username"
                  {...register('username')}
                  aria-label="Username"
                  aria-invalid={Boolean(errors.username || usernameError)}
                  aria-describedby={errors.username ? 'register-username-error' : usernameError ? 'register-username-availability-error' : undefined}
                  autoComplete="username"
                  className="mt-1 min-w-0 flex-1 !bg-weelp-auth-neu-surface px-3 py-2 pr-10 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
                />
                {/* Username availability indicator */}
                {username && username.length >= 3 && (
                  <div className="absolute right-10">
                    {isCheckingUsername ? (
                      <LoaderCircle className="text-muted-foreground size-5 animate-spin" />
                    ) : usernameError ? (
                      <X className="text-red-500 size-5" strokeWidth={3} />
                    ) : (
                      <Check className="text-green-500 size-5" strokeWidth={3} />
                    )}
                  </div>
                )}
              </label>
              {errors.username && (
                <p id="register-username-error" role="alert" className="pt-2 text-sm text-red-600">
                  {errors.username.message}
                </p>
              )}
              {usernameError && (
                <p id="register-username-availability-error" role="alert" className="pt-2 text-sm text-red-600">
                  {usernameError}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 px-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
              >
                <AtSign aria-hidden="true" className="text-copy size-4 shrink-0" />
                <input
                  placeholder="Email ID"
                  type="email"
                  id="email"
                  {...register('email')}
                  aria-label="Email address"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'register-email-error' : undefined}
                  autoComplete="email"
                  className="mt-1 min-w-0 flex-1 !bg-weelp-auth-neu-surface px-3 py-2 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
                />
              </label>
              {errors.email && (
                <p id="register-email-error" role="alert" className="pt-2 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative mb-4">
              <label
                htmlFor="password"
                className="relative flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 pl-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
              >
                <KeyRound aria-hidden="true" className="text-copy size-4 shrink-0" />
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  {...register('password')}
                  aria-label="Password"
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'register-password-error' : undefined}
                  autoComplete="new-password"
                  className="mt-1 min-w-0 flex-1 !bg-weelp-auth-neu-surface px-3 py-2 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
                />
                <button
                  type="button"
                  onClick={togglePassword}
                  aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                  aria-pressed={passwordVisible}
                  className="size-11 shrink-0 rounded-md text-copy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-1"
                >
                  {passwordVisible ? <EyeClosed aria-hidden="true" className="mx-auto size-5" /> : <Eye aria-hidden="true" className="mx-auto size-5" />}
                </button>
              </label>
              {errors.password && (
                <p id="register-password-error" role="alert" className="pt-2 text-sm text-red-600">
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
                className="relative flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 pl-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
              >
                <KeyRound aria-hidden="true" className="text-copy size-4 shrink-0" />
                <input
                  type={confirmationVisible ? 'text' : 'password'}
                  id="password_confirmation"
                  placeholder="Confirm Password"
                  {...register('password_confirmation')}
                  aria-label="Confirm password"
                  aria-invalid={Boolean(errors.password_confirmation)}
                  aria-describedby={errors.password_confirmation ? 'register-password-confirmation-error' : undefined}
                  autoComplete="new-password"
                  className="mt-1 min-w-0 flex-1 !bg-weelp-auth-neu-surface px-3 py-2 pr-8 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
                />
                {/* Live password match indicator */}
                {passwordConfirmation && (
                  <div className="absolute right-10">
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
                  {confirmationVisible ? <EyeClosed aria-hidden="true" className="mx-auto size-5" /> : <Eye aria-hidden="true" className="mx-auto size-5" />}
                </button>
              </label>
              {errors.password_confirmation && (
                <p id="register-password-confirmation-error" role="alert" className="pt-2 text-sm text-red-600">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* Submit Button - with added spacing */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-auto py-3 rounded-lg text-base border border-weelp-sage-deep transition-colors duration-200 motion-reduce:transition-none ${isSubmitting ? 'bg-muted-foreground cursor-not-allowed border-border' : 'bg-background text-weelp-sage-deep hover:bg-weelp-sage-deep hover:text-white dark:bg-weelp-sage-deep dark:text-white dark:hover:bg-weelp-auth-neu-surface dark:hover:text-weelp-sage-deep'}`}
              >
                {isSubmitting ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Continue'
                )}
              </Button>
            </div>
          </fieldset>
        </form>
      ) : (
        <fieldset className="w-full min-w-0 space-y-4 bg-weelp-auth-neu-surface py-4" disabled={isOtpSubmitting}>
          <div className="text-center">
            <h3 className="font-semibold text-xl">Verify Your Email</h3>
            <sub className="text-copy">
              We sent a 6-digit code to <strong>{formData?.email}</strong>
            </sub>
          </div>

          {/* OTP Input */}
          <div className="py-4">
            <OtpInput length={6} value={otp} onChange={setOtp} onComplete={handleOtpComplete} error={otpError} disabled={isOtpSubmitting} />
            {isOtpSubmitting && (
              <div className="flex items-center justify-center gap-2 pt-4 text-weelp-sage-deep">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span className="text-sm font-medium">Verifying your code...</span>
              </div>
            )}
            {otpError && !isOtpSubmitting && (
              <p role="alert" className="pt-4 text-center text-sm text-red-600">
                {otpError}
              </p>
            )}
          </div>

          {/* Resend Button */}
          <div className="text-center">
            <p className="text-sm text-copy mb-2">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timeUntilResend > 0 || isResending}
              className="inline-flex min-h-11 items-center rounded-sm text-sm font-semibold text-weelp-sage-deep hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2 disabled:text-muted-foreground disabled:no-underline"
            >
              {isResending ? 'Sending...' : timeUntilResend > 0 ? `Resend in ${timeUntilResend}s` : 'Resend OTP'}
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleBackToInfo}
              className="inline-flex min-h-11 items-center rounded-sm text-sm text-copy hover:text-weelp-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2"
            >
              ← Back to registration
            </button>
          </div>
        </fieldset>
      )}
    </div>
  );
}
