import { EditTransferFormByAdmin } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/forms/EditTransferFormByAdmin';
import { getSingleTransferAdmin } from '@/lib/services/transfers';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';

const EditTransferByAdminPage = async ({ params }) => {
  const { id } = await params;

  const transferData = await getSingleTransferAdmin(id); // retrive data from dynamic data

  if (isEmpty(transferData)) {
    return notFound(); // check if transfer is empty or wrong fallback
  }

  return <EditTransferFormByAdmin transferData={transferData} />;
};

export default EditTransferByAdminPage;
