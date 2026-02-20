import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { FormForgotPassword } from '@/app/components/Form/FormForgotPassword';

const ForgotPassword = async () => {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  return <FormForgotPassword />;
};

export default ForgotPassword;
