'use client';

import { signIn, getSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { AtSign, Eye, EyeOff, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { useIsClient } from '@/hooks/useIsClient';
import { useTogglePassword } from '@/hooks/useTogglePassword';
import { getSafeAuthReturnUrl } from '@/lib/auth/authRedirect';
import useAuthModalStore from '@/lib/store/useAuthModalStore';
import { X } from 'lucide-react';

const LOGIN_ERROR_TOASTS = {
  rate_limited: {
    title: 'Too many login attempts',
    description: 'The login rate limit is active. Please wait a minute and try again.',
  },
  account_locked: {
    title: 'Account temporarily locked',
    description: 'Please try again later or reset your password.',
  },
  login_unavailable: {
    title: 'Unable to log in right now',
    description: 'Please try again in a moment.',
  },
  credentials: {
    title: 'Email or Password Incorrect',
  },
};

export function getLoginErrorToast(result) {
  if (result?.error !== 'CredentialsSignin') {
    return {
      title: 'Unable to log in right now',
      description: 'Please try again in a moment.',
    };
  }

  return LOGIN_ERROR_TOASTS[result?.code] ?? LOGIN_ERROR_TOASTS.credentials;
}

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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
  });

  // const [error, setError] = useState("");
  const onSubmit = async (data) => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      // credentials error
      if (result?.error) {
        toast({
          variant: 'destructive',
          ...getLoginErrorToast(result),
        });
        return;
      }

      if (result?.ok) {
        // If onSuccess callback exists in store, don't redirect — AuthModalDialog handles it
        const { onSuccess } = useAuthModalStore.getState();
        if (onSuccess) {
          // Just show success toast, the AuthModalDialog effect will fire onSuccess
          toast({ title: 'Login successful!' });
          return;
        }

        // Close auth modal if open
        closeAuthModal();

        // Determine redirect target
        const targetUrl = getSafeAuthReturnUrl(storeRedirectTo) || getSafeAuthReturnUrl(customUrl);

        if (targetUrl) {
          // Use router.push or window.location.assign
          window.location.assign(targetUrl);
        } else {
          // Wait for session to update, then redirect based on role
          setTimeout(async () => {
            const currentSession = await getSession();

            if (currentSession?.user?.role) {
              const role = currentSession.user.role;
              const isCreator = currentSession.user.is_creator;
              if (role === 'super_admin' || role === 'admin') {
                window.location.href = '/dashboard/admin';
              } else if (isCreator) {
                window.location.href = '/dashboard/customer/overview';
              } else {
                window.location.href = '/dashboard/customer';
              }
            } else {
              window.location.href = '/dashboard';
            }
          }, 100);

          toast({
            title: 'Login successful! Redirecting...',
          });
        }
      }
    } catch {
      toast({
        variant: 'destructive',
        ...LOGIN_ERROR_TOASTS.login_unavailable,
      });
    }
  };
  if (isClient) {
    return (
      <div className={`relative w-full rounded-xl bg-weelp-auth-neu-surface ${isSubmitting && 'cursor-wait'}`}>
        {/* Custom Close Button */}
        {showCloseButton && (
          <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-background rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
            <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
          </button>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className={`space-y-4 bg-weelp-auth-neu-surface py-4`}>
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 px-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
            >
              <AtSign aria-hidden="true" className="text-copy size-4 shrink-0" />
              <input
                placeholder={'Email ID'}
                type="email"
                id="email"
                {...register('email')}
                aria-label="Email address"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'login-email-error' : undefined}
                autoComplete="email"
                className="mt-1 min-w-0 w-full !bg-weelp-auth-neu-surface px-3 py-2 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
              />
            </label>
            {errors.email && (
              <p id="login-email-error" role="alert" className="pt-2 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="relative flex min-w-0 items-center rounded-lg border border-weelp-sage-deep/25 bg-weelp-auth-neu-surface p-1 pl-2 focus-within:border-weelp-sage-deep focus-within:ring-2 focus-within:ring-weelp-sage-deep/30 dark:border-white/10"
            >
              <KeyRound aria-hidden="true" className="text-copy size-4 shrink-0" />
              <input
                type={visible ? 'text' : 'password'}
                id="password"
                placeholder="Password"
                {...register('password')}
                aria-label="Password"
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? 'login-password-error' : undefined}
                autoComplete="current-password"
                className="mt-1 min-w-0 w-full !bg-weelp-auth-neu-surface px-3 py-2 text-base placeholder:!bg-weelp-auth-neu-surface focus:outline-none"
              />
              <button
                type="button"
                onClick={toggle}
                aria-label={visible ? 'Hide password' : 'Show password'}
                aria-pressed={visible}
                className="size-11 shrink-0 rounded-md text-copy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-1"
              >
                {visible ? <EyeOff aria-hidden="true" className="mx-auto size-5" /> : <Eye aria-hidden="true" className="mx-auto size-5" />}
              </button>
            </label>
            {errors.password && (
              <p id="login-password-error" role="alert" className="p-2 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
          <NavigationLink className="inline-flex min-h-11 items-center pt-2" href="/user/forgot-password" onClick={closeAuthModal}>
            Forgot Password ?
          </NavigationLink>
          <Button
            type="submit"
            disabled={isSubmitting}
            className={`w-full h-auto py-3 rounded-lg text-base border border-weelp-sage-deep transition-colors duration-200 motion-reduce:transition-none ${isSubmitting ? 'bg-muted-foreground cursor-not-allowed border-border' : 'bg-background text-weelp-sage-deep hover:bg-weelp-sage-deep hover:text-white dark:bg-weelp-sage-deep dark:text-white dark:hover:bg-weelp-auth-neu-surface dark:hover:text-weelp-sage-deep'}`}
          >
            {isSubmitting ? 'Logging in...' : 'Continue'}
          </Button>
        </form>
        <div className="hidden">
          <div className="flex justify-center gap-4 items-center">
            <hr className="w-full" />
            <span className="text-sm text-nowrap text-muted-foreground">Or continue with</span>
            <hr className="w-full" />
          </div>

          <div className="flex items-center justify-around px-8 pb-8 gap-4 pt-4 font-semibold flex-wrap">
            <button onClick={() => signIn('google')} className="flex w-fit items-center rounded-md p-2 gap-4 shadow border px-8 text-foreground">
              <Image src="/assets/images/google.png" className="size-4" alt="google_logo" width={100} height={100} />
              Google
            </button>
            <button className="flex w-fit items-center rounded-md p-2 gap-4 shadow border px-8 text-foreground">
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
