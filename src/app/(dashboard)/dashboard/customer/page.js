import { CustomerBookingsList } from '@/app/components/Pages/DASHBOARD/user/_rsc_pages/booking/CustomerBookingsList';
import React from 'react';
import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

// Use dynamic import to skip SSR and prevent hydration mismatch
// This is necessary because Radix UI Select generates random IDs that differ between server and client
export const dynamic = 'force-dynamic';

const BookingsPage = async () => {
  const session = await auth();

  // Redirect admin/super_admin users to admin dashboard
  if (session?.user?.role === 'admin' || session?.user?.role === 'super_admin') {
    redirect('/dashboard/admin');
  }

  return <CustomerBookingsList />;
};

export default BookingsPage;
