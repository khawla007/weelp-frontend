import React, { Suspense } from 'react';
import { PageSkeleton } from '@/app/components/Animation/Cards';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { FormResetPassword } from '@/app/components/Form/FormResetPassword';

const ResetPassword = async () => {
  const session = await auth();
  if (session?.user) {
    redirect('/dashboard');
  }
  return (
    <Suspense
      fallback={
        <div className="my-4 h-screen flex items-center justify-center">
          <PageSkeleton />
        </div>
      }
    >
      <FormResetPassword />
    </Suspense>
  );
};

export default ResetPassword;
