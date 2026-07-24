'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useIsClient } from '@/hooks/useIsClient';
import { getSafeAuthReturnUrl } from '@/lib/auth/authRedirect';
import { getLogoUrl } from '@/lib/config/brand';

const AuthBrandLogo = ({ size = 'default', className = '' }) => {
  const markClass = size === 'large' ? 'h-10 sm:h-12 lg:h-[52px]' : 'h-9 sm:h-[42px]';
  const textClass = size === 'large' ? 'text-2xl sm:text-[30px] lg:text-[34px]' : 'text-[22px] sm:text-[24px]';

  return (
    <div className={`inline-flex items-center justify-center gap-3 ${className}`}>
      <img src={getLogoUrl()} alt="Weelp" className={`${markClass} w-auto`} />
      <span className={`${textClass} font-semibold leading-none text-foreground`} style={{ fontFamily: 'var(--font-interTight), Inter Tight, sans-serif' }}>
        Weelp.
      </span>
    </div>
  );
};

export function AuthPageClient({ defaultTab = 'login', returnUrl = null }) {
  const isClient = useIsClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const safeReturnUrl = getSafeAuthReturnUrl(returnUrl);

  if (!isClient) {
    return null;
  }

  const isLogin = activeTab === 'login';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    const params = new URLSearchParams({ tab });
    if (safeReturnUrl) {
      params.set('return', safeReturnUrl);
    }
    router.replace(`/user/login?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="flex min-h-[calc(100svh-5rem)] w-[calc(100%+3rem)] -mx-6 flex-col bg-weelp-sage-wash sm:min-h-[calc(100svh-6rem)] lg:min-h-screen lg:flex-row">
      {/* Left Side - Hero Image */}
      <div className="relative h-[190px] sm:h-[240px] md:h-[300px] lg:h-auto lg:w-1/2 bg-gradient-to-br from-weelp-sage-deep/20 to-weelp-sage-tint/20">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("/assets/images/auth-hero.jpg")' }} />
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 py-6 text-center sm:px-8">
          <AuthBrandLogo size="large" className="mb-3 sm:mb-4" />
          <h1 className="mb-1.5 text-2xl font-semibold text-foreground sm:text-3xl lg:mb-2 lg:text-4xl">Welcome to Weelp</h1>
          <p className="max-w-[18rem] text-sm text-copy sm:max-w-none sm:text-base">Your journey to amazing destinations starts here</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex flex-1 items-start justify-center bg-weelp-auth-neu-surface px-5 py-8 sm:px-8 sm:py-10 lg:w-1/2 lg:items-center lg:p-8">
        <div className="w-full max-w-[29rem] rounded-[24px] bg-weelp-auth-neu-surface p-5 shadow-[18px_18px_36px_rgba(183,198,190,0.72),-9px_-9px_22px_rgba(255,255,255,0.82)] sm:max-w-[32rem] sm:p-7 md:max-w-[35rem] md:rounded-[30px] md:p-9 lg:p-10 dark:shadow-[18px_18px_36px_rgba(4,6,5,0.46),-9px_-9px_22px_rgba(62,77,69,0.32)]">
          {/* Logo */}
          <div className="mb-5 flex justify-center sm:mb-6">
            <AuthBrandLogo />
          </div>

          {/* Tabs */}
          <div className="mb-5 flex gap-2 sm:mb-6 sm:gap-3">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`min-h-11 flex-1 rounded-lg border border-weelp-sage-deep py-2.5 text-center text-sm font-medium transition-colors duration-200 motion-reduce:transition-none sm:py-3 sm:text-base ${
                isLogin
                  ? 'bg-weelp-sage-deep text-white hover:bg-background hover:text-weelp-sage-text dark:hover:bg-weelp-auth-neu-surface dark:hover:text-white'
                  : 'bg-background text-weelp-sage-text hover:bg-weelp-sage-deep hover:text-white dark:bg-weelp-auth-neu-surface dark:text-white dark:hover:bg-weelp-sage-deep dark:hover:text-white'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`min-h-11 flex-1 rounded-lg border border-weelp-sage-deep py-2.5 text-center text-sm font-medium transition-colors duration-200 motion-reduce:transition-none sm:py-3 sm:text-base ${
                !isLogin
                  ? 'bg-weelp-sage-deep text-white hover:bg-background hover:text-weelp-sage-text dark:hover:bg-weelp-auth-neu-surface dark:hover:text-white'
                  : 'bg-background text-weelp-sage-text hover:bg-weelp-sage-deep hover:text-white dark:bg-weelp-auth-neu-surface dark:text-white dark:hover:bg-weelp-sage-deep dark:hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {isLogin ? (
            <LoginForm showCloseButton={false} onSwitchToSignup={() => handleTabSwitch('signup')} customUrl={safeReturnUrl} />
          ) : (
            <RegisterForm showCloseButton={false} onSwitchToLogin={() => handleTabSwitch('login')} customUrl={safeReturnUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
