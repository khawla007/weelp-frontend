'use client';

import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';

export function AuthModal({ customUrl, onCloseDialog }) {
  const [view, setView] = useState('login'); // 'login' | 'signup'

  const switchToSignup = () => setView('signup');
  const switchToLogin = () => setView('login');

  return (
    <>
      {view === 'login' ? (
        <LoginForm customUrl={customUrl} onCloseDialog={onCloseDialog} onSwitchToSignup={switchToSignup} />
      ) : (
        <RegisterForm onCloseDialog={onCloseDialog} onSwitchToLogin={switchToLogin} />
      )}
    </>
  );
}
