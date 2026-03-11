import { EditTransferForm } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/transfers/forms/EditTransferForm';
import { getSingleTransferAdmin } from '@/lib/services/transfers';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';

const EditTransferByVendorPage = async ({ params }) => {
  const { id } = await params;

  const transferData = await getSingleTransferAdmin(id); // retrive data from dynamic data

  if (isEmpty(transferData)) {
    return notFound(); // check if transfer is empty or wrong fallback
  }

  return <EditTransferForm transferData={transferData} />;
};

export default EditTransferByVendorPage;
