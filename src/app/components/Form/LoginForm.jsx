'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AtSign, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import Image from 'next/image';
import { useIsClient } from '@/hooks/useIsClient';
import { useTogglePassword } from '@/hooks/useTogglePassword';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { X } from 'lucide-react';

// Zod schema for validation
const schema = z.object({
  email: z.string().email('Invalid email address').nonempty('Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters').nonempty('Password is required'),
});

export function LoginForm({ customUrl, onCloseDialog, onSwitchToSignup, showCloseButton = true }) {
  const { toast } = useToast();
  const isClient = useIsClient(); // custom hook for hydration
  const { visible, toggle } = useTogglePassword(); // toggle password hook
  const { redirectTo: storeRedirectTo, closeAuthModal } = useAuthModalStore();
  const { data: session, update: updateSession } = useSession(); // get session after login

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // const [error, setError] = useState("");
  const router = useRouter();

  const onSubmit = async (data) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      // credentials error
      if (result?.error) {
        if (result?.error === 'CredentialsSignin') {
          toast({
            variant: 'destructive',
            title: 'Email or Password Incorrect',
          });
        }
        return;
      }

      if (result?.ok) {
        // Close auth modal if open
        closeAuthModal();

        // Determine redirect target
        const targetUrl = storeRedirectTo || customUrl;

        if (targetUrl) {
          // Use router.push or window.location.assign
          window.location.assign(targetUrl);
        } else {
          // Wait for session to update, then redirect based on role
          setTimeout(async () => {
            const currentSession = await updateSession();

            if (currentSession?.user?.role) {
              const role = currentSession.user.role;
              if (role === 'super_admin' || role === 'admin') {
                router.push('/dashboard/admin');
              } else if (role === 'customer') {
                router.push('/dashboard/customer');
              } else {
                router.push('/dashboard');
              }
            } else {
              router.push('/dashboard');
            }
          }, 100);

          toast({
            title: 'Login successful! Redirecting...',
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
  };
  if (isClient) {
    return (
      <div className={`relative bg-white rounded-xl w-full ${isSubmitting && 'cursor-wait'}`}>
        {/* Custom Close Button */}
        {showCloseButton && (
          <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
            <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 bg-white py-4`}>
          {/* Email Input */}
          <div>
            <label htmlFor="email" className=" flex items-center bg-white shadow-md border p-1 px-2 rounded-md">
              <AtSign className="text-[#5A5A5A] size-4" />
              <input
                placeholder={'Email ID'}
                type="email"
                id="email"
                {...register('email')}
                autoComplete="off"
                className="mt-1  py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base w-full"
              />
            </label>
            {errors.email && <p className="text-sm text-red-600 pt-2">{errors.email.message}</p>}
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="flex items-center bg-white shadow-md border p-1 px-2 rounded-md relative">
              <KeyRound className="text-[#5A5A5A] size-4" />
              <input
                type={visible ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                {...register('password')}
                autoComplete="off"
                className="mt-1  py-2 px-3 focus:outline-none bg-white placeholder:bg-white text-base w-full"
              />

              {visible ? (
                <EyeOff onClick={toggle} className="text-[#5A5A5A] size-5 absolute right-6 cursor-pointer" />
              ) : (
                <Eye onClick={toggle} className="text-[#5A5A5A] size-5 absolute right-6 cursor-pointer" />
              )}
            </label>
            {errors.password && <p className="text-sm text-red-600 p-2">{errors.password.message}</p>}
          </div>
          <Link className="pt-2 block" href={'/user/forgot-password'}>
            Forgot Password ?
          </Link>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-auto py-3 rounded-lg text-base border border-[#568f7c] transition-all duration-200 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed border-gray-400' : 'bg-[#568f7c] text-white hover:bg-white hover:text-[#568f7c]'}`}
          >
            {isSubmitting ? 'Logging in...' : 'Continue'}
          </Button>
        </form>
        <div className="hidden">
          <div className="flex justify-center gap-4 items-center">
            <hr className="w-full" />
            <span className="text-sm text-nowrap text-[#667085]">Or continue with</span>
            <hr className="w-full" />
          </div>

          <div className="flex items-center justify-around px-8 pb-8 gap-4 pt-4 font-semibold flex-wrap">
            <button onClick={() => signIn('google')} className="flex w-fit items-center rounded-md p-2 gap-4 shadow border px-8 text-Nileblue">
              <Image src="/assets/images/google.png" className="size-4" alt="google_logo" width={100} height={100} />
              Google
            </button>
            <button className="flex w-fit items-center rounded-md p-2 gap-4 shadow border px-8 text-Nileblue">
              <Image src="/assets/images/facebook.png" className="size-4" alt="facebook_logo" width={100} height={100} />
              Facebook
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
