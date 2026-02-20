'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Base HOC to protect any page or layout
 * @param {React.ComponentType} WrappedComponent
 * @returns {React.FC}
 */
export default function withAuth(WrappedComponent) {
  return function AuthProtected(props) {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status === 'unauthenticated') {
        router.replace('/user/login'); // redirect if not logged in
      }
    }, [status, router]);

    if (status === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="loader">Loading...</div>
        </div>
      );
    }

    if (!session) {
      return null; // Prevent flicker
    }

    return <WrappedComponent {...props} session={session} />;
  };
}
