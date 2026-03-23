import React, { Suspense } from 'react';
import { FormVerifyEmail } from '@/app/components/Form/VerifyEmailForm';

const VerifyEmail = () => {
  return (
    <Suspense
      fallback={
        <div className="my-4 h-screen flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <FormVerifyEmail />
    </Suspense>
  );
};

export default VerifyEmail;
