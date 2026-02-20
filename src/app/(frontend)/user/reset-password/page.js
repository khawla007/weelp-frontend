import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { FormResetPassword } from '@/app/components/Form/FormResetPassword';

const ResetPassword = async () => {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  return <FormResetPassword />;
};

export default ResetPassword;
