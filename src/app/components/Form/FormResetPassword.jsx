'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Key, Eye, EyeOff, Check, X } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { LoadingPage } from '../Animation/Cards';
import axios from 'axios';
import Image from 'next/image';
import { useTogglePassword } from '@/hooks/useTogglePassword';

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
      .regex(/[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/, 'Must contain at least one special character'),

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
  const [initialize] = useState(() => true); // Lazy initialization - no useEffect needed
  const { visible, toggle } = useTogglePassword(); // toggle password hook

  // Helper function to check if password meets all requirements
  const isPasswordValid = (pwd) => {
    return pwd.length >= 8 && /[A-Z]/.test(pwd) && /[a-z]/.test(pwd) && /\d/.test(pwd) && /[@#$%^&+=!*?(),.<>{}[\]|/\\~`_-]/.test(pwd);
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
  const password = watch('password');
  const passwordConfirmation = watch('password_confirmation');

  //check first token
  useEffect(() => {
    // check token
    if (!token) {
      router.push('/user/forgot-password'); // Redirect to the forgot password page
    }
  }, [token, router]);

  // handle if token available
  if (!token) {
    return <LoadingPage />;
  }

  const onSubmit = async (data) => {
    // setError("");

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
      toast({
        variant: 'destructive',
        title: message,
      });
    }
  };
  if (initialize) {
    return (
      <div className={`space-y-4 bg-white border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8 ${isSubmitting && 'cursor-wait'}`}>
        <div className="bg-white rounded-t-xl border-b py-4 px-8">
          <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white px-8 py-4">
          <div>
            <h3 className="font-semibold text-xl">
              Reset Password or back to{' '}
              <Link href={'/user/login'} className="underline">
                Login
              </Link>
            </h3>
            <sub className="text-[#5a5a5a]">Enter your new password below.</sub>
          </div>

          {/* Password Input */}
          <div className="border relative mb-4">
            <label htmlFor="password" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md relative">
              <Key className="text-[#5A5A5A] size-4" />
              <input
                placeholder="New password"
                type={visible ? 'text' : 'password'}
                id="password"
                {...register('password')}
                autoComplete="off"
                className="mt-1 py-2 px-3 pr-10 focus:outline-none bg-white placeholder:bg-white text-base flex-1"
              />
              {visible ? (
                <EyeOff onClick={toggle} className="text-[#5A5A5A] size-5 absolute right-4 cursor-pointer" />
              ) : (
                <Eye onClick={toggle} className="text-[#5A5A5A] size-5 absolute right-4 cursor-pointer" />
              )}
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
              <Key className="text-[#5A5A5A] size-4" />
              <input
                placeholder="Confirm new password"
                type="password"
                id="password_confirmation"
                {...register('password_confirmation')}
                autoComplete="off"
                className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base flex-1"
              />
              {/* Live password match indicator */}
              {passwordConfirmation && (
                <div className="absolute right-6">
                  {password === passwordConfirmation ? <Check className="text-green-500 size-5" strokeWidth={3} /> : <X className="text-red-500 size-5" strokeWidth={3} />}
                </div>
              )}
            </label>
            {errors.password_confirmation && <p className="text-sm text-red-600 pt-2">{errors.password_confirmation.message}</p>}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !password || !isPasswordValid(password) || password !== passwordConfirmation}
            className={`w-full p-4 rounded-md ${
              isSubmitting || !password || !isPasswordValid(password) || password !== passwordConfirmation ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondaryDark hover:bg-secondarylight text-white'
            }`}
          >
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </form>
      </div>
    );
  }
};
