'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthModal({ customUrl, onCloseDialog }) {
  const [view, setView] = useState('login'); // 'login' | 'signup'

  const switchToSignup = () => setView('signup');
  const switchToLogin = () => setView('login');

  return (
    <div className="relative bg-white border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8">
      {/* Close Button */}
      <button onClick={onCloseDialog} className="absolute -top-3 -right-3 bg-white rounded-full p-1.5 shadow-md hover:bg-red-50 transition-colors z-10" aria-label="Close">
        <X className="text-red-500 w-5 h-5" strokeWidth={2.5} />
      </button>

      {/* Logo */}
      <div className="bg-white rounded-t-xl border-b py-4 px-8 pr-12">
        <Image width={122} height={42} alt="form_logo" src="/assets/images/SiteLogo.png" />
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
              <sub className="text-[#5a5a5a]">Login into your account using your email.</sub>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-xl">
                Sign Up or{' '}
                <button type="button" onClick={switchToLogin} className="underline">
                  Back to Login
                </button>
              </h3>
              <sub className="text-[#5a5a5a]">Create your account using your email.</sub>
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
