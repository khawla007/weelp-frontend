'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useBookingData } from '@/hooks/api/public/checkout';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get('session_id'); // retrieve session id
  const { clearCart } = useMiniCartStore(); // clear cart
  const session = useSession(); // prevent user to page

  const { bookingData, loading, error } = useBookingData(session_id); // retrieve data

  // successfull payment
  useEffect(() => {
    if (!loading && bookingData) {
      clearCart(); // clear cart after successful booking
    }
  }, [loading, bookingData, clearCart]);

  if (!session_id) {
    return <div className="text-center text-red-500 mt-10">No Session Found</div>;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <span className="loader"></span>
      </div>
    );
  }

  if (error || !bookingData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center text-red-500 mt-10">Something went wrong.</div>
      </div>
    );
  }

  const { user_detail = {}, item_detail = {}, order = {} } = bookingData?.data || {}; // destructuring data
  const dashboardUrl = session?.user?.role === 'admin' ? '/dashboar/admin' : '/dashboard/user'; // session based linking
  const amount = parseFloat(order?.payment.amount || 0);
  const currency = order?.payment?.currency || '';
  const priceAmount = formatCurrency(amount, currency); // actuall price amount
  const tableRowClass = ''; // table row class

  return (
    <div className="min-h-[85vh] bg-gray-50 py-10 px-4 flex justify-center items-center">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl w-full">
        {/* Booking Summary */}
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader className="rounded-md  space-y-2">
            <CardTitle>Booking Successfull</CardTitle>
            <Alert variant="success">
              <AlertDescription>Congrats Your Order has been booked</AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            <CardTitle>Booking Summary</CardTitle>
            <Table>
              <TableBody className="">
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

            {/* Navigation */}
            <div className="flex justify-between w-full">
              <Link href="/" className={'bg-white text-black border p-2 rounded-2xl text-sm font-medium px-4'}>
                Back to Home
              </Link>
              <Link href={dashboardUrl} className="bg-[#163b4e] text-white border p-2 px-4 rounded-2xl text-sm font-medium">
                Go To Bookings
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Payment Info */}
        <Card className="h-fit rounded-md border">
          <CardHeader className="bg-[#163b4e] text-white rounded-md">
            <CardTitle>Payment Info</CardTitle>
            <h2 className=" font-semibold text-lg">{item_detail?.item_name}</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm p-4">
            <div className="text-black flex w-full justify-between">
              <strong>Status:</strong> {order.payment.payment_status}
            </div>
            <div className="text-black flex w-full justify-between">
              <strong>Method:</strong> {order.payment.payment_method}
            </div>
            <div className="text-black flex w-full justify-between">
              <strong>Amount:</strong> {priceAmount}
            </div>
            <div className="text-black flex w-full justify-between font-bold border p-4 ">
              <strong>Total:</strong> {priceAmount}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
