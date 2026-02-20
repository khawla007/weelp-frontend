export const dynamic = 'force-dynamic';

import { AttributePageClient } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/taxonomies/attributes/attributes';
import { getAllAttributesAdmin } from '@/lib/services/global';
import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';

const AttributesPage = async () => {
  const { data: attributesData = {} } = await getAllAttributesAdmin();

  const { data: attributes = [] } = attributesData; // for attributes

  if (isEmpty(attributes)) {
    notFound();
  }
  return <AttributePageClient />;
};

export default AttributesPage;
