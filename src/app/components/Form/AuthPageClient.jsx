'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { useIsClient } from '@/hooks/useIsClient';

export function AuthPageClient({ defaultTab = 'login' }) {
  const isClient = useIsClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(defaultTab);

  if (!isClient) {
    return null;
  }

  const isLogin = activeTab === 'login';

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    router.replace(`/user/login?tab=${tab}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#F8F9F9] flex flex-col lg:flex-row">
      {/* Left Side - Hero Image (50% on desktop, 35% on mobile) */}
      <div className="lg:w-1/2 h-[35vh] lg:h-auto relative bg-gradient-to-br from-[#588f7a]/20 to-[#b5d8cb]/20">
        <div className="absolute inset-0 bg-cover bg-center opacity-30"
             style={{ backgroundImage: 'url("/assets/images/auth-hero.jpg")' }} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">
            Welcome to Weelp
          </h1>
          <p className="text-gray-700">
            Your journey to amazing destinations starts here
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form (50% on desktop, 65% on mobile) */}
      <div className="lg:w-1/2 flex items-center justify-center p-4 lg:p-8">
        <div className="w-full max-w-md bg-white rounded-lg shadow-[0_2.8px_7.2px_rgba(0,0,0,0.05)] border border-gray-200 p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/assets/images/SiteLogo.png" alt="Weelp" width={122} height={42} />
          </div>

          {/* Tabs */}
          <div className="flex mb-6 border-b border-gray-200">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 pb-3 text-center font-medium transition-colors duration-200 ${
                isLogin
                  ? 'text-[#588f7a] border-b-2 border-[#588f7a]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 pb-3 text-center font-medium transition-colors duration-200 ${
                !isLogin
                  ? 'text-[#588f7a] border-b-2 border-[#588f7a]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          {isLogin ? (
            <LoginForm showCloseButton={false} onSwitchToSignup={() => handleTabSwitch('signup')} />
          ) : (
            <RegisterForm showCloseButton={false} onSwitchToLogin={() => handleTabSwitch('login')} />
          )}
        </div>
      </div>
    </div>
  );
}
