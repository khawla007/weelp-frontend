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
    <div className="w-screen min-h-screen bg-[#F8F9F9] flex flex-col lg:flex-row -mx-6">
      {/* Left Side - Hero Image (50% on desktop, 35% on mobile) */}
      <div className="lg:w-1/2 h-[35vh] lg:h-auto relative bg-gradient-to-br from-[#588f7a]/20 to-[#b5d8cb]/20">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: 'url("/assets/images/auth-hero.jpg")' }} />
        <div className="relative z-10 flex flex-col items-center justify-center h-full p-8 text-center">
          <img src="/assets/images/SiteLogo.png" alt="Weelp" width={150} height={52} className="mb-4" />
          <h1 className="text-3xl lg:text-4xl font-semibold text-gray-900 mb-2">Welcome to Weelp</h1>
          <p className="text-gray-700">Your journey to amazing destinations starts here</p>
        </div>
      </div>

      {/* Right Side - Auth Form (50% on desktop, 65% on mobile) */}
      <div className="lg:w-1/2 flex items-center justify-center py-4 lg:py-8">
        <div className="w-full max-w-[35rem] bg-white rounded-2xl shadow-[6px_6px_12px_rgba(0,0,0,0.08),-6px_-6px_12px_rgba(255,255,255,0.9)] border border-gray-100 p-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img src="/assets/images/SiteLogo.png" alt="Weelp" width={122} height={42} />
          </div>

          {/* Tabs */}
          <div className="flex mb-6 gap-3">
            <button
              onClick={() => handleTabSwitch('login')}
              className={`flex-1 py-3 rounded-lg text-center font-medium border border-[#568f7c] transition-all duration-200 ${isLogin ? 'bg-[#568f7c] text-white hover:bg-white hover:text-[#568f7c]' : 'bg-white text-[#568f7c] hover:bg-[#568f7c] hover:text-white'}`}
            >
              Log In
            </button>
            <button
              onClick={() => handleTabSwitch('signup')}
              className={`flex-1 py-3 rounded-lg text-center font-medium border border-[#568f7c] transition-all duration-200 ${!isLogin ? 'bg-[#568f7c] text-white hover:bg-white hover:text-[#568f7c]' : 'bg-white text-[#568f7c] hover:bg-[#568f7c] hover:text-white'}`}
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
