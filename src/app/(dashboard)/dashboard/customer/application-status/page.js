import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import NavigationLink from '@/app/components/Navigation/NavigationLink';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Hourglass, XCircle, CheckCircle2 } from 'lucide-react';
import { getAuthApi } from '@/lib/axiosInstance';

export const metadata = {
  title: 'Application Status - Weelp',
};

async function fetchApplication() {
  try {
    const api = await getAuthApi();
    const res = await api.get('/api/creator/application-status');
    return res.data?.data ?? null;
  } catch {
    return null;
  }
}

function Card({ icon: Icon, tone, title, children }) {
  const toneClass =
    {
      neutral: 'border-[#435a6742]',
      warning: 'border-amber-200 bg-amber-50/50',
      destructive: 'border-red-200 bg-red-50/50',
      success: 'border-green-200 bg-green-50/50',
    }[tone] || 'border-[#435a6742]';

  return (
    <div className={`bg-white rounded-xl border ${toneClass} p-6`}>
      <div className="flex items-center gap-3 mb-3">
        <Icon className="size-6 text-[#142A38]" />
        <h2 className="text-lg font-semibold text-[#142A38]">{title}</h2>
      </div>
      <div className="text-[#5A5A5A] space-y-1">{children}</div>
    </div>
  );
}

export default async function ApplicationStatusPage() {
  const session = await auth();
  if (!session?.user) redirect('/user/login');
  if (session.user.is_creator) redirect('/dashboard/customer/overview');

  const application = await fetchApplication();
  const status = application?.status ?? 'none';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#142A38]">Application Status</h1>
        <p className="text-[#5A5A5A] mt-1">Track your creator application.</p>
      </header>

      {status === 'none' && (
        <Card icon={ClipboardCheck} tone="neutral" title="You haven't applied yet">
          <p>Apply to become a Weelp creator and start sharing your itineraries.</p>
          <NavigationLink href="/become-a-creator">
            <Button className="mt-4 bg-secondaryDark hover:bg-secondaryDark/90">Apply Now</Button>
          </NavigationLink>
        </Card>
      )}

      {status === 'pending' && (
        <Card icon={Hourglass} tone="warning" title="Application under review">
          <p>Your application is being reviewed by our team. This usually takes 2–5 business days.</p>
          {application?.created_at && <p className="mt-2 text-sm text-[#5A5A5A]">Submitted {new Date(application.created_at).toLocaleDateString()}.</p>}
        </Card>
      )}

      {status === 'rejected' && (
        <Card icon={XCircle} tone="destructive" title="Application not approved">
          {application?.admin_notes && (
            <p className="mb-4">
              <strong>Notes:</strong> {application.admin_notes}
            </p>
          )}
          <p>You can re-apply with updated information.</p>
          <NavigationLink href="/become-a-creator">
            <Button className="mt-4 bg-secondaryDark hover:bg-secondaryDark/90">Re-apply</Button>
          </NavigationLink>
        </Card>
      )}

      {status === 'approved' && (
        <Card icon={CheckCircle2} tone="success" title="You're a creator!">
          <p>Your application was approved. Sign out and back in to see the creator dashboard.</p>
          <NavigationLink href="/dashboard/customer/overview">
            <Button className="mt-4 bg-secondaryDark hover:bg-secondaryDark/90">Go to Overview</Button>
          </NavigationLink>
        </Card>
      )}
    </div>
  );
}
