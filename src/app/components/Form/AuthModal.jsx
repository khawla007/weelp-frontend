'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { getLogoUrl } from '@/lib/config/brand';

export function AuthModal({ customUrl, onCloseDialog }) {
  const [view, setView] = useState('login'); // 'login' | 'signup'

  const switchToSignup = () => setView('signup');
  const switchToLogin = () => setView('login');

  return (
    <div className="relative max-h-[calc(100dvh-2rem)] w-full min-w-0 max-w-full overflow-y-auto rounded-xl border bg-weelp-auth-neu-surface pb-8 shadow-md sm:max-w-md">
      {/* Close Button */}
      <button
        type="button"
        onClick={onCloseDialog}
        className="absolute right-2 top-2 z-10 size-11 rounded-full bg-weelp-auth-neu-surface shadow-md transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep"
        aria-label="Close"
      >
        <X aria-hidden="true" className="mx-auto size-5 text-red-500" strokeWidth={2.5} />
      </button>

      {/* Logo */}
      <div className="bg-weelp-auth-neu-surface rounded-t-xl border-b py-4 px-8 pr-12">
        <div className="inline-flex items-center gap-3">
          <img src={getLogoUrl()} alt="Weelp" className="h-9 w-auto" />
          <span className="text-[18px] font-semibold leading-none text-foreground" style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}>
            Weelp.
          </span>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-4 sm:px-8">
        {/* Header with switch link */}
        <div className="pt-4 pb-2">
          {view === 'login' ? (
            <>
              <h3 className="font-semibold text-xl">
                Log In or{' '}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="inline-flex min-h-11 items-center rounded-sm underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2"
                >
                  Sign Up
                </button>
              </h3>
              <sub className="text-copy">Login into your account using your email.</sub>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-xl">
                Sign Up or{' '}
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="inline-flex min-h-11 items-center rounded-sm underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep focus-visible:ring-offset-2"
                >
                  Back to Login
                </button>
              </h3>
              <sub className="text-copy">Create your account using your email.</sub>
            </>
          )}
        </div>

        {/* Form */}
        {view === 'login' ? (
          <LoginForm customUrl={customUrl} showCloseButton={false} onCloseDialog={onCloseDialog} onSwitchToSignup={switchToSignup} />
        ) : (
          <RegisterForm customUrl={customUrl} showCloseButton={false} onCloseDialog={onCloseDialog} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
}
