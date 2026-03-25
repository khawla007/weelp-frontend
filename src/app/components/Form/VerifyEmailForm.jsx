'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useIsClient } from '@/hooks/useIsClient';
import { Button } from '@/components/ui/button';
import { CheckCircle, UserX } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { LoadingPage } from '../Animation/Cards';

export const FormVerifyEmail = () => {
  const isClient = useIsClient();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);

  const [response, setResponse] = useState({
    message: '',
    success: false,
    email: '',
  });

  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/user/login');
      return;
    }

    (async () => {
      try {
        const res = await axios.get(`/api/public/user/email/verify-email?token=${token}`);
        const data = res.data;
        setResponse((prev) => ({ ...prev, ...data }));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, router]);

  if (!isClient) {
    return null;
  }

  if (loading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-4 bg-white border rounded-xl shadow-md w-full max-w-fit sm:max-w-md pb-8">
      {response?.success && <EmailVerifiedCard emailaddress={response?.email} />}
      {!response?.success && <InvalidExpiredToken />}
    </div>
  );
};

function EmailVerifiedCard({ emailaddress = '' }) {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl p-8 text-center">
      <div className="flex items-center justify-center size-20 mx-auto rounded-full bg-secondaryDark mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Email Verified!</h2>
      <p className="text-gray-500 mb-6">Your Email has been successfully verified. </p>
      <p className="text-gray-500 mb-6 font-bold">{emailaddress}</p>
      <Button asChild>
        <Link href="/user/login" className="bg-secondaryDark">
          Click Here To Login
        </Link>
      </Button>
    </div>
  );
}

function InvalidExpiredToken() {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-2xl p-8 text-center">
      <div className="flex items-center justify-center size-20 mx-auto rounded-full bg-secondaryDark mb-6">
        <UserX className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Invalid or Expired Token!</h2>
      <Button asChild>
        <Link href="/user/email/revalidate" className="bg-secondaryDark">
          Click Here To Verify Your Email
        </Link>
      </Button>
    </div>
  );
}
