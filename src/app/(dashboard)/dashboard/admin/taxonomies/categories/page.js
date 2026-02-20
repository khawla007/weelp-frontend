export const dynamic = 'force-dynamic';

import { isEmpty } from 'lodash';
import { notFound } from 'next/navigation';
import { getCategoriesAdmin } from '@/lib/services/global';
import { CategoryPageClient } from '@/app/components/Pages/DASHBOARD/admin/_rsc_pages/taxonomies/category/category';

const CategoriesPage = async () => {
  const { data: categoriesData = {} } = await getCategoriesAdmin();

  const { data: categories = [] } = categoriesData; // categories

  // 404 if api not working
  if (isEmpty(categories)) {
    notFound();
  }
  return <CategoryPageClient />;
};

export default CategoriesPage;
