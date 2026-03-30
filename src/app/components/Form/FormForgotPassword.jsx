'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AtSign } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// Zod schema for validation
const schema = z.object({
  email: z.string().email('Invalid email address').nonempty('Email is required'),
});

export function FormForgotPassword() {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    const { email } = data;
    try {
      const response = await axios.post('/api/public/user/forgot', {
        email,
      });

      // show toast
      if (response.status === 200) {
        const { success, message } = response?.data;

        // on success
        if (success) {
          toast({
            variant: 'success',
            title: message,
          });
        } else {
          toast({
            variant: 'destructive',
            title: message,
          });
        }
      }

      // reset password
      reset();
    } catch (error) {
      const message = error?.response?.data?.message || 'An unexpected error occurred. Please try again.';
      toast({
        variant: 'destructive',
        title: message,
      });
    }
  };

  return (
    <div className={`space-y-4 bg-white border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8 ${isSubmitting && 'cursor-wait'}`}>
      <div className="bg-white rounded-t-xl border-b py-4 px-8">
        <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white px-8 py-4">
        <div>
          <h3 className="font-semibold text-xl">
            Forgot password or back to{' '}
            <Link href={'/user/login'} className="underline">
              Login
            </Link>
          </h3>
          <sub className="text-[#5a5a5a]">Enter your email to receive a password reset link.</sub>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="flex items-center bg-white shadow-md border p-2 rounded-md w-full">
            <AtSign className="text-[#5A5A5A] size-4" />
            <input placeholder="Email ID" type="email" id="email" {...register('email')} autoComplete="off" className="py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base w-full" />
          </label>
          {errors.email && <p className="text-sm text-red-600 pt-2">{errors.email.message}</p>}
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={isSubmitting} className={`w-full p-4 rounded-md ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondaryDark hover:bg-secondarylight text-white'}`}>
          {isSubmitting ? 'Processing...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}
