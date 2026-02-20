import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/app/components/Form/LoginForm';

const LoginPage = async () => {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return <LoginForm />;
};

export default LoginPage;
