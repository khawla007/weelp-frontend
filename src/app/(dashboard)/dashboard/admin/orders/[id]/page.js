import { getSingleOrderAdmin } from '@/lib/services/orders';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import EditOrderForm from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/orders/EditOrderForm';

const EditOrder = async ({ params }) => {
  const { id } = await params;

  // Guard clause for missing ID
  if (!id) return notFound();

  const response = await getSingleOrderAdmin(id);

  if (isEmpty(response)) {
    return notFound(); // 404 page
  }

  return <EditOrderForm order={response?.data} />; // Pass the order data to form if needed
};

export default EditOrder;
