'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Key } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import Image from 'next/image';
import { useIsClient } from '@/hooks/useIsClient';
import { Label } from '@/components/ui/label';

// Zod schema for validation
const schema = z.object({
  email: z
    .string()
    .min(8, 'Must be at least 8 characters long')
    .regex(/[A-Za-z]/, 'Must contain at least one letter')
    .regex(/[@#$%^&+=]/, 'Must contain at least one special character (@, #, $, etc.)')
    .nonempty('Email Required'),
});

export const FormRevalidateEmail = () => {
  const isClient = useIsClient(); // intialize client component
  const { toast } = useToast();

  //Create Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const { email } = data;

      const response = await axios.post('/api/public/user/email/revalidate-email', {
        email,
      });

      // show toast
      if (response.status === 200) {
        const { message } = response?.data;

        // on success
        toast({
          variant: 'success',
          title: message,
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
  if (isClient) {
    return (
      <div className={`space-y-4 bg-white border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8 ${isSubmitting && 'cursor-wait'}`}>
        <div className="bg-white rounded-t-xl border-b py-4 px-8">
          <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white px-8 py-4">
          <div>
            <h3 className="font-semibold text-xl">Enter Your Email to Revalidate </h3>
          </div>

          {/* Email Input */}
          <div>
            <Label htmlFor="email" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
              <Key className="text-[#5A5A5A] size-4" />
              <input
                placeholder="Enter your Email"
                type="email"
                id="email"
                {...register('email')}
                autoComplete="off"
                className="mt-1 py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base"
              />
            </Label>
            {errors.email && <p className="text-sm text-red-600 pt-2">{errors.email.message}</p>}
          </div>

          <Link href="/user/login" className="text-sm py-1">
            Click Here To Login
          </Link>
          {/* Submit Button */}
          <Button type="submit" disabled={isSubmitting} className={`w-full p-4 rounded-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondaryDark hover:bg-secondarylight text-white'}`}>
            {isSubmitting ? 'Processing...' : 'Continue'}
          </Button>
        </form>
      </div>
    );
  }
};
