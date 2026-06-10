'use client';

import { useFormContext } from 'react-hook-form';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';

export function PageFormHeader({ editPage = false }) {
  const {
    formState: { isSubmitting, isDirty },
  } = useFormContext();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold">{editPage ? 'Edit CMS Page' : 'Create CMS Page'}</h1>
        <p className="text-sm text-muted-foreground">Manage public CMS page content, publishing status, and SEO metadata.</p>
      </div>
      <FormActionButtons
        mode={editPage ? 'update' : 'create'}
        submitText="Page"
        isSubmitting={isSubmitting}
        isDisabled={editPage ? !isDirty : false}
        cancelHref="/dashboard/admin/pages"
        containerType="div"
        className="justify-end"
      />
    </div>
  );
}
