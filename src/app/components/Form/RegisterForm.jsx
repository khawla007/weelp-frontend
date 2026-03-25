'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AtSign, Eye, EyeClosed, KeyRound, User, X, LoaderCircle } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useTogglePassword } from '@/hooks/useTogglePassword';
import { useState, useEffect } from 'react';
import { OtpInput } from './OtpInput';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
      .regex(/[A-Za-z]/, 'Must contain at least one letter')
      .regex(/\d/, 'Must contain at least one number')
      .regex(/[@#$%^&+=]/, 'Must contain at least one special character (@, #, $, etc.)'),
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

  const [step, setStep] = useState('info'); // 'info' | 'otp'
  const [formData, setFormData] = useState(null);
  const [otp, setOtp] = useState('');
  const [timeUntilResend, setTimeUntilResend] = useState(30);
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState('');

  const {
    register,
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Countdown timer for resend button
  useEffect(() => {
    if (step === 'otp' && timeUntilResend > 0) {
      const timer = setTimeout(() => {
        setTimeUntilResend((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [step, timeUntilResend]);

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
        toast({
          variant: 'destructive',
          title: 'Too many requests',
          description: response?.data?.error || 'Please try again later',
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
        toast({
          variant: 'destructive',
          title: 'Too many requests',
          description: response?.data?.error || 'Please try again later',
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

    try {
      const response = await axios.post('/api/public/otp/verify', {
        email: formData.email,
        otp: otpValue,
      });

      if (response.status === 201) {
        // Auto-login using NextAuth
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          toast({
            variant: 'success',
            title: 'Account created!',
            description: 'Welcome to Weelp!',
          });

          // Close dialog and redirect to dashboard
          onCloseDialog?.();
          router.push('/dashboard/customer');
          router.refresh();
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
    }
  };

  const handleBackToInfo = () => {
    setStep('info');
    setOtp('');
    setOtpError('');
  };

  return (
    <div className="relative space-y-4 bg-white border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8">
      {showCloseButton && (
        <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
          <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
        </button>
      )}
      <div className="bg-white rounded-t-xl border-b py-4 px-8 pr-12">
        <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
      </div>

      {step === 'info' ? (
        <form onSubmit={handleSubmit(onSubmitInfo)}>
          <fieldset className={`space-y-4 bg-white px-8 py-4 ${isSubmitting && 'cursor-wait'}`} disabled={isSubmitting}>
            <div>
              <h3 className="font-semibold text-xl">
                Sign Up or{' '}
                <button type="button" onClick={onSwitchToLogin} className="underline">
                  Back to Login
                </button>
              </h3>
              <sub className="text-[#5a5a5a]">Create your account using your email.</sub>
            </div>

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
              <label htmlFor="username" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
                <User className="text-[#5A5A5A] size-4" />
                <input
                  placeholder="Username"
                  type="text"
                  id="username"
                  {...register('username')}
                  autoComplete="username"
                  className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
                />
              </label>
              {errors.username && <p className="text-sm text-red-600 pt-2">{errors.username.message}</p>}
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
            <div className="border relative">
              <label htmlFor="password" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
                <KeyRound className="text-[#5A5A5A] size-4" />
                <input
                  type={visible ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  {...register('password')}
                  autoComplete="new-password"
                  className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
                />
                {!visible ? <Eye size={20} className="absolute right-4" onClick={toggle} /> : <EyeClosed size={20} className="absolute right-4" onClick={toggle} />}
              </label>
              {errors.password && <p className="text-sm text-red-600 pt-2">{errors.password.message}</p>}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="password_confirmation" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
                <KeyRound className="text-[#5A5A5A] size-4" />
                <input
                  type={visible ? 'text' : 'password'}
                  id="password_confirmation"
                  placeholder="Confirm Password"
                  {...register('password_confirmation')}
                  autoComplete="new-password"
                  className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
                />
              </label>
              {errors.password_confirmation && <p className="text-sm text-red-600 pt-2">{errors.password_confirmation.message}</p>}
            </div>

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className={`w-full p-4 rounded-md ${isSubmitting ? 'bg-gray-400' : 'bg-secondaryDark hover:bg-secondarylight text-white'}`}>
              {isSubmitting ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue'
              )}
            </Button>
          </fieldset>
        </form>
      ) : (
        <fieldset className={`space-y-4 bg-white px-8 py-4`} disabled={isSubmitting}>
          <div>
            <h3 className="font-semibold text-xl text-center">Verify Your Email</h3>
            <sub className="text-[#5a5a5a]">
              We sent a 6-digit code to <strong>{formData?.email}</strong>
            </sub>
          </div>

          {/* OTP Input */}
          <div className="py-4">
            <OtpInput length={6} value={otp} onChange={setOtp} onComplete={handleOtpComplete} error={otpError} disabled={isSubmitting} />
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
