'use client';

import React, { useEffect } from 'react';
import useMiniCartStore from '@/lib/store/useMiniCartStore';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useOrderThankyou } from '@/hooks/api/public/order/thankyou';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { formatCurrency } from '@/lib/utils';

const SucceceedPage = () => {
  const searchParams = useSearchParams(); // params serach

  const { clearCart, cartItems } = useMiniCartStore(); // store for itesm
  const { data: session } = useSession(); // prevent user to page

  const payment_intent = searchParams.get('payment_intent'); // retrieve session id
  const { orderData, isValidating, error } = useOrderThankyou(payment_intent); // retrieve data

  const { success, order = {} } = orderData;

  // cart cleared
  useEffect(() => {
    clearCart(); // clear cart
    sessionStorage.removeItem('clientSecret'); // clear client secret
    sessionStorage.removeItem('paymentIntent'); // clear intent
  }, []);

  // error handling
  if (error) {
    return <div className="my-4 border border-black h-full min-h-screen text-red-400">Something Went Wrong</div>;
  }

  // loading state
  if (isValidating) {
    return (
      <div className="my-4 h-screen flex items-center justify-center">
        <span className="loader"></span>
      </div>
    );
  }

  const { emergency_contact = {}, item = {}, payment = {}, user = {} } = order || {}; // destructure order data
  const dashboardUrl = session?.user?.role === 'super_admin' ? '/dashboard/admin' : '/dashboard/customer'; // use role send based on use link
  const amount = parseFloat(payment?.amount || 0);
  const currency = payment?.currency || 'USD';
  const priceAmount = formatCurrency(amount, currency);

  // console.log(priceAmount)

  return (
    <div className="min-h-[85vh] bg-gray-50 py-10 px-4 flex justify-center items-center">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl w-full">
        {/* Booking Summary */}
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader className="rounded-md space-y-2">
            <CardTitle>Booking Successful</CardTitle>
            <Alert variant="success">
              <AlertDescription>Congrats! Your order has been booked.</AlertDescription>
            </Alert>
          </CardHeader>
          <CardContent>
            <CardTitle>Booking Summary</CardTitle>
            <Table>
              <TableBody>
                {user?.name && (
                  <TableRow>
                    <TableCell className="font-semibold">Name</TableCell>
                    <TableCell>{user.name}</TableCell>
                  </TableRow>
                )}

                {user?.email && (
                  <TableRow>
                    <TableCell className="font-semibold">Email</TableCell>
                    <TableCell>{user.email}</TableCell>
                  </TableRow>
                )}

                <TableRow>
                  <TableCell className="font-semibold">Item</TableCell>
                  <TableCell>{item?.name}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Amount Paid</TableCell>
                  {/* <TableCell className="text-secondaryDark">{priceAmount}</TableCell> */}
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Travel Date</TableCell>
                  <TableCell>{order?.travel_date}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Preferred Time</TableCell>
                  <TableCell>{order?.preferred_time}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Adults</TableCell>
                  <TableCell>{order?.number_of_adults}</TableCell>
                </TableRow>

                <TableRow>
                  <TableCell className="font-semibold">Children</TableCell>
                  <TableCell>{order?.number_of_children}</TableCell>
                </TableRow>

                {order?.special_requirements && (
                  <TableRow>
                    <TableCell className="font-semibold">Special Requirements</TableCell>
                    <TableCell>{order.special_requirements}</TableCell>
                  </TableRow>
                )}

                {emergency_contact && (
                  <TableRow>
                    <TableCell className="font-semibold">Emergency Contact</TableCell>
                    <TableCell>
                      {emergency_contact.contact_name} ({emergency_contact.contact_phone})
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Navigation */}
            <div className="flex justify-between w-full mt-6">
              <Link href="/" className="bg-white text-black border p-2 rounded-2xl text-sm font-medium px-4">
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
            <h2 className="font-semibold text-lg">{item?.name}</h2>
          </CardHeader>
          <CardContent className="space-y-3 text-sm p-4">
            <div className="text-black flex w-full justify-between">
              <strong>Status:</strong> {payment?.payment_status}
            </div>
            <div className="text-black flex w-full justify-between">
              <strong>Method:</strong> {payment?.payment_method}
            </div>
            <div className="text-black flex w-full justify-between">
              <strong>Amount:</strong> {priceAmount}
            </div>
            <div className="text-black flex w-full justify-between font-bold border p-4 rounded-md">
              <strong>Total:</strong> {priceAmount}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SucceceedPage;
