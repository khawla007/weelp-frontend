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
    // Creators go to their dashboard
    redirect('/dashboard/creator/overview');
  } else {
    // Customers go to their dashboard
    redirect('/dashboard/customer');
  }
};

export default DashboardPage;
