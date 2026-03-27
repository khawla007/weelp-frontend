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
import { useRouter } from 'next/navigation';
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
      .regex(/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/, 'Must contain at least one special character'),
    password_confirmation: z.string().nonempty('Please confirm your password'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Passwords do not match',
  });

export function RegisterForm({ onCloseDialog, onSwitchToLogin, showCloseButton = true }) {
  const { visible, toggle } = useTogglePassword();
  const { toast } = useToast();
  const router = useRouter();
  const { redirectTo: storeRedirectTo, closeAuthModal } = useAuthModalStore();

  // Helper function to check if password meets all requirements
  const isPasswordValid = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(pwd);
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
          const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/check-username`, {
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

        console.log('SignIn result:', result);

        if (result?.ok) {
          // Close auth modal if open
          closeAuthModal();
          // Close any parent dialog
          onCloseDialog?.();

          toast({
            variant: 'success',
            title: 'Welcome to Weelp!',
          });

          // Redirect to store target or fallback to dashboard
          const targetUrl = storeRedirectTo || '/dashboard/customer';
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
    <div className="relative space-y-4 bg-white rounded-xl w-full">
      {showCloseButton && (
        <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
          <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
        </button>
      )}

      {step === 'info' ? (
        <form onSubmit={handleSubmit(onSubmitInfo)}>
          <fieldset className={`space-y-4 bg-white py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
                <User className="text-[#5A5A5A] size-4" />
                <input placeholder="Full Name" type="text" id="name" {...register('name')} autoComplete="name" className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base" />
              </label>
              {errors.name && <p className="text-sm text-red-600 pt-2">{errors.name.message}</p>}
            </div>

            {/* Username Input */}
            <div>
              <label htmlFor="username" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md relative">
                <User className="text-[#5A5A5A] size-4" />
                <input
                  placeholder="Username"
                  type="text"
                  id="username"
                  {...register('username')}
                  autoComplete="username"
                  className="mt-1 py-2 px-3 pr-10 focus:outline-none bg-white placeholder:bg-white text-base flex-1"
                />
                {/* Username availability indicator */}
                {username && username.length >= 3 && (
                  <div className="absolute right-10">
                    {isCheckingUsername ? (
                      <LoaderCircle className="text-gray-400 size-5 animate-spin" />
                    ) : usernameError ? (
                      <X className="text-red-500 size-5" strokeWidth={3} />
                    ) : (
                      <Check className="text-green-500 size-5" strokeWidth={3} />
                    )}
                  </div>
                )}
              </label>
              {errors.username && <p className="text-sm text-red-600 pt-2">{errors.username.message}</p>}
              {usernameError && <p className="text-sm text-red-600 pt-2">{usernameError}</p>}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
                <AtSign className="text-[#5A5A5A] size-4" />
                <input
                  placeholder="Email ID"
                  type="email"
                  id="email"
                  {...register('email')}
                  autoComplete="email"
                  className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
                />
              </label>
              {errors.email && <p className="text-sm text-red-600 pt-2">{errors.email.message}</p>}
            </div>

            {/* Password Input */}
            <div className="border relative mb-4">
              <label htmlFor="password" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md relative">
                <KeyRound className="text-[#5A5A5A] size-4" />
                <input
                  type={visible ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  {...register('password')}
                  autoComplete="new-password"
                  className="mt-1 py-2 px-3 pr-10 focus:outline-none bg-white placeholder:bg-white text-base flex-1"
                />
                {!visible ? <Eye size={20} className="absolute right-4 cursor-pointer" onClick={toggle} /> : <EyeClosed size={20} className="absolute right-4 cursor-pointer" onClick={toggle} />}
              </label>
              {errors.password && <p className="text-sm text-red-600 pt-2">{errors.password.message}</p>}

              {/* Password Requirements Checklist */}
              {password && (
                <>
                  <div className="mt-2 space-y-1 text-xs">
                    <p className="text-gray-500 font-medium mb-1">Password must contain:</p>
                    <div className={`flex items-center gap-1 ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                      {password.length >= 8 ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                      <span>At least 8 characters</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[A-Z]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                      <span>One uppercase letter (A-Z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[a-z]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                      <span>One lowercase letter (a-z)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[0-9]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                      <span>One number (0-9)</span>
                    </div>
                    <div className={`flex items-center gap-1 ${/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
                      {/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(password) ? <Check size={12} strokeWidth={3} /> : <X size={12} strokeWidth={2} />}
                      <span>One special character</span>
                    </div>
                  </div>
                  {/* Password strength message */}
                  {password.length > 0 && !isPasswordValid(password) && <p className="text-sm text-orange-500 mt-2">Please meet all password requirements</p>}
                </>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="password_confirmation" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md relative">
                <KeyRound className="text-[#5A5A5A] size-4" />
                <input
                  type={visible ? 'text' : 'password'}
                  id="password_confirmation"
                  placeholder="Confirm Password"
                  {...register('password_confirmation')}
                  autoComplete="new-password"
                  className="mt-1 py-2 px-3 pr-10 focus:outline-none bg-white placeholder:bg-white text-base flex-1"
                />
                {/* Live password match indicator */}
                {passwordConfirmation && (
                  <div className="absolute right-10">
                    {password === passwordConfirmation ? <Check className="text-green-500 size-5" strokeWidth={3} /> : <X className="text-red-500 size-5" strokeWidth={3} />}
                  </div>
                )}
                {!visible ? <Eye size={20} className="absolute right-4 cursor-pointer" onClick={toggle} /> : <EyeClosed size={20} className="absolute right-4 cursor-pointer" onClick={toggle} />}
              </label>
              {errors.password_confirmation && <p className="text-sm text-red-600 pt-2">{errors.password_confirmation.message}</p>}
            </div>

            {/* Submit Button - with added spacing */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className={`w-full h-auto py-3 rounded-lg text-base border border-[#568f7c] transition-all duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed border-gray-400' : 'bg-[#568f7c] text-white hover:bg-white hover:text-[#568f7c]'}`}
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
        <fieldset className={`space-y-4 bg-white py-4`} disabled={isOtpSubmitting}>
          <div className="text-center">
            <h3 className="font-semibold text-xl">Verify Your Email</h3>
            <sub className="text-[#5a5a5a]">
              We sent a 6-digit code to <strong>{formData?.email}</strong>
            </sub>
          </div>

          {/* OTP Input */}
          <div className="py-4">
            <OtpInput length={6} value={otp} onChange={setOtp} onComplete={handleOtpComplete} error={otpError} disabled={isOtpSubmitting} />
            {otpError && <p className="text-sm text-red-600 pt-4 text-center">{otpError}</p>}
          </div>

          {/* Resend Button */}
          <div className="text-center">
            <p className="text-sm text-[#5a5a5a] mb-2">Didn&apos;t receive the code?</p>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={timeUntilResend > 0 || isResending}
              className="text-sm font-semibold text-secondaryDark hover:underline disabled:text-gray-400 disabled:no-underline"
            >
              {isResending ? 'Sending...' : timeUntilResend > 0 ? `Resend in ${timeUntilResend}s` : 'Resend OTP'}
            </button>
          </div>

          {/* Back Button */}
          <div className="text-center pt-2">
            <button type="button" onClick={handleBackToInfo} className="text-sm text-[#5a5a5a] hover:text-secondaryDark">
              ← Back to registration
            </button>
          </div>
        </fieldset>
      )}
    </div>
  );
}
