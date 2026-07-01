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
    <div className="relative bg-weelp-auth-neu-surface border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8">
      {/* Close Button */}
      <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-weelp-auth-neu-surface rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
        <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
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
      <div className="px-8">
        {/* Header with switch link */}
        <div className="pt-4 pb-2">
          {view === 'login' ? (
            <>
              <h3 className="font-semibold text-xl">
                Log In or{' '}
                <button type="button" onClick={switchToSignup} className="underline">
                  Sign Up
                </button>
              </h3>
              <sub className="text-copy">Login into your account using your email.</sub>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-xl">
                Sign Up or{' '}
                <button type="button" onClick={switchToLogin} className="underline">
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
          <RegisterForm showCloseButton={false} onCloseDialog={onCloseDialog} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    </div>
  );
}
