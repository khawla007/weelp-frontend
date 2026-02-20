'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, buttonVariants } from '@/components/ui/button';
import { Key } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { LoadingPage } from '../Animation/Cards';
import axios from 'axios';
import Image from 'next/image';

// Zod schema for validation
const schema = z
  .object({
    password: z
      .string()
      .min(8, 'Must be at least 8 characters long')
      .regex(/[A-Za-z]/, 'Must contain at least one letter')
      .regex(/[@#$%^&+=]/, 'Must contain at least one special character (@, #, $, etc.)')
      .regex(/\d/, 'Must contain at least one number')
      .nonempty('Password Required'),

    password_confirmation: z
      .string()
      .min(8, 'Must be at least 8 characters long')
      .regex(/[A-Za-z]/, 'Must contain at least one letter')
      .regex(/[@#$%^&+=]/, 'Must contain at least one special character (@, #, $, etc.)')
      .regex(/\d/, 'Must contain at least one number')
      .nonempty('Password Required'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'], // Error will be associated with password_confirmation
  });

export const FormResetPassword = () => {
  const [intialize, setInitialize] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const [error, setError] = useState('');
  const token = searchParams.get('token');

  //Create Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  //check first token
  useEffect(() => {
    // check token
    if (!token) {
      router.push('/user/forgot-password'); // Redirect to the forgot password page
    }

    // intialize form
    setInitialize(true);
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

        // on success
        toast({
          variant: 'success',
          title: message,
          action: (
            <Link className={`${buttonVariants()}`} href={'/user/login'}>
              Back to Login
            </Link>
          ),
        });

        reset();
      }
    } catch (error) {
      const {
        response: { data },
      } = error;

      const { message } = data || {};

      // handle error for forgot password
      toast({
        variant: 'destructive',
        title: message || 'Something Went Wrong',
      });
    }
  };
  if (intialize) {
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
            <sub className="text-[#5a5a5a]">Login into your account using your email.</sub>
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="password" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
              <Key className="text-[#5A5A5A] size-4" />
              <input
                placeholder="Password"
                type="password"
                id="password"
                {...register('password')}
                autoComplete="off"
                className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
              />
            </label>
            {errors.password && <p className="text-sm text-red-600 pt-2">{errors.password.message}</p>}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label htmlFor="password_confirmation" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
              <Key className="text-[#5A5A5A] size-4" />
              <input
                placeholder="Confirm Password"
                type="password_confirmation"
                id="password_confirmation"
                {...register('password_confirmation')}
                autoComplete="off"
                className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
              />
            </label>
            {errors.password_confirmation && <p className="text-sm text-red-600 pt-2">{errors.password_confirmation.message}</p>}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className={`w-full p-4 rounded-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondaryDark hover:bg-secondarylight text-white'}`}>
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </form>
      </div>
    );
  }
};
