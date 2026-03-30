import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';

const DashboardPage = async () => {
  const session = await auth();

  if (!session?.user) {
    redirect('/user/login');
  }

  // Redirect based on user role
  const userRole = session.user.role;

  if (userRole === 'admin' || userRole === 'super_admin') {
    redirect('/dashboard/admin');
  } else if (userRole === 'customer') {
    redirect('/dashboard/customer');
  } else {
    // Default fallback
    redirect('/dashboard/customer');
  }
};

export default DashboardPage;
