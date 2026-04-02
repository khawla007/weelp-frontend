import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/user/login');
  }

  // Redirect based on user role
  const userRole = session.user.role;
  const isCreator = session.user.is_creator;

  if (userRole === 'admin' || userRole === 'super_admin') {
    redirect('/dashboard/admin');
  } else if (isCreator) {
    // Creators land on Overview tab
    redirect('/dashboard/customer/overview');
  } else {
    // Customers land on Bookings tab
    redirect('/dashboard/customer');
  }
};

export default DashboardPage;
