import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { AuthPageClient } from '@/app/components/Form/AuthPageClient';

const LoginPage = async ({ searchParams }) => {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  // Determine default tab from URL param, default to 'login'
  const params = await searchParams;
  const defaultTab = params.tab === 'signup' ? 'signup' : 'login';

  return <AuthPageClient defaultTab={defaultTab} />;
};

export default LoginPage;
