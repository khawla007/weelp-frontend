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
    <div className={`space-y-4 bg-background border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8 ${isSubmitting && 'cursor-wait'}`}>
      <div className="bg-background rounded-t-xl border-b py-4 px-8">
        <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-background px-8 py-4">
        <div>
          <h3 className="font-semibold text-xl">
            Forgot password or back to{' '}
            <Link href={'/user/login'} className="underline">
              Login
            </Link>
          </h3>
          <sub className="text-copy">Enter your email to receive a password reset link.</sub>
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="flex items-center bg-background shadow-md border p-2 rounded-md w-full">
            <AtSign className="text-copy size-4" />
            <input
              placeholder="Email ID"
              type="email"
              id="email"
              {...register('email')}
              autoComplete="off"
              className="py-2 px-3 focus:outline-none bg-background placeholder:bg-background text-base w-full"
            />
          </label>
          {errors.email && <p className="text-sm text-red-600 pt-2">{errors.email.message}</p>}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-4 rounded-md ${isSubmitting ? 'bg-muted-foreground cursor-not-allowed' : 'bg-weelp-sage-deep hover:bg-weelp-sage-tint text-white'}`}
        >
          {isSubmitting ? 'Processing...' : 'Continue'}
        </Button>
      </form>
    </div>
  );
}
