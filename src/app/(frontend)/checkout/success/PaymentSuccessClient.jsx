'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useBookingData } from '@/hooks/api/public/checkout';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSuccessClient({ sessionId }) {
  const { clearCart } = useMiniCartStore();
  const { data: session } = useSession();
  const { bookingData, loading, error } = useBookingData(sessionId);

  useEffect(() => {
    if (!loading && bookingData) {
      clearCart();
    }
  }, [loading, bookingData, clearCart]);

  if (!sessionId) {
    return <div className="mt-10 text-center text-red-500">No Session Found</div>;
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="mt-10 text-center text-red-500">Something went wrong.</div>
      </div>
    );
  }

  const { user_detail = {}, item_detail = {}, order = {} } = bookingData?.data || {};
  const dashboardUrl = session?.user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';
  const amount = parseFloat(order?.payment?.amount || 0);
  const currency = order?.payment?.currency || '';
  const priceAmount = formatCurrency(amount, currency);
  const tableRowClass = '';

  return (
    <div className="flex min-h-[85vh] items-center justify-center bg-gray-50 px-4 py-10">
      <div className="grid w-full max-w-7xl grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="space-y-4 lg:col-span-2">
          <CardHeader className="space-y-2 rounded-md">
            <CardTitle>Booking Successfull</CardTitle>
            <Alert variant="success">
              <AlertDescription>Congrats Your Order has been booked</AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            <CardTitle>Booking Summary</CardTitle>
            <Table>
              <TableBody>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Name</TableCell>
                  <TableCell>{user_detail?.name}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Email</TableCell>
                  <TableCell>{user_detail?.email}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Item</TableCell>
                  <TableCell>{item_detail?.item_name}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Amount Paid</TableCell>
                  <TableCell className="text-secondaryDark">{priceAmount}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Travel Date</TableCell>
                  <TableCell>{order?.travel_date}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Preferred Time</TableCell>
                  <TableCell>{order?.preferred_time}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Adults</TableCell>
                  <TableCell>{order?.number_of_adults}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Children</TableCell>
                  <TableCell>{order?.number_of_children}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Special Requirements</TableCell>
                  <TableCell>{order?.special_requirements}</TableCell>
                </TableRow>
                <TableRow className={tableRowClass}>
                  <TableCell className="font-semibold">Emergency Contact</TableCell>
                  <TableCell>
                    {order?.emergency_contact?.contact_name} ({order?.emergency_contact?.contact_phone})
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div className="flex w-full justify-between">
              <Link href="/" className="rounded-2xl border bg-white p-2 px-4 text-sm font-medium text-black">
                Back to Home
              </Link>
              <Link href={dashboardUrl} className="rounded-2xl border bg-[#163b4e] p-2 px-4 text-sm font-medium text-white">
                Go To Bookings
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit rounded-md border">
          <CardHeader className="rounded-md bg-[#163b4e] text-white">
            <CardTitle>Payment Info</CardTitle>
            <h2 className="text-lg font-semibold">{item_detail?.item_name}</h2>
          </CardHeader>
          <CardContent className="space-y-3 p-4 text-sm">
            <div className="flex w-full justify-between text-black">
              <strong>Status:</strong> {order?.payment?.payment_status}
            </div>
            <div className="flex w-full justify-between text-black">
              <strong>Method:</strong> {order?.payment?.payment_method}
            </div>
            <div className="flex w-full justify-between text-black">
              <strong>Amount:</strong> {priceAmount}
            </div>
            <div className="flex w-full justify-between border p-4 font-bold text-black">
              <strong>Total:</strong> {priceAmount}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
