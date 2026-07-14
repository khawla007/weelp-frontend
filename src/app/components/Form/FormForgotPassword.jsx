'use client';

import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AtSign } from 'lucide-react';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import NavigationLink from '@/app/components/Navigation/NavigationLink';

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
    <div className={`w-full min-w-0 max-w-fit space-y-4 rounded-xl border bg-background pb-8 shadow-md sm:max-w-md ${isSubmitting && 'cursor-wait'}`}>
      <div className="bg-background rounded-t-xl border-b py-4 px-8">
        <Image src="/assets/images/SiteLogo.png" alt="Site Logo" width={122} height={42} />
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-background px-8 py-4">
        <div>
          <h3 className="font-semibold text-xl">
            Forgot password or back to{' '}
            <NavigationLink
              href="/user/login"
              className="inline-flex min-h-11 items-center rounded-sm underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2"
            >
              Login
            </NavigationLink>
          </h3>
          <sub className="text-copy">Enter your email to receive a password reset link.</sub>
        </div>

        {/* Email Input */}
        <div>
          <label
            htmlFor="email"
            className="flex w-full min-w-0 items-center rounded-md border bg-background p-2 shadow-md focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30"
          >
            <AtSign aria-hidden="true" className="text-copy size-4 shrink-0" />
            <input
              placeholder="Email ID"
              type="email"
              id="email"
              {...register('email')}
              aria-label="Email address"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'forgot-email-error' : undefined}
              autoComplete="email"
              className="min-w-0 w-full bg-background px-3 py-2 text-base placeholder:bg-background focus:outline-none"
            />
          </label>
          {errors.email && (
            <p id="forgot-email-error" role="alert" className="pt-2 text-sm text-red-600">
              {errors.email.message}
            </p>
          )}
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
