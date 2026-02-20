import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/app/components/Form/RegisterForm';

const SignUpPage = async () => {
  const session = await auth();

  if (session?.user) {
    redirect('/dashboard');
  }

  return <RegisterForm />;
};

export default SignUpPage;
