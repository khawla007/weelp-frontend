'use client';

import React, { useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { createPage, updatePage } from '@/lib/actions/pages';
import { defaultSeoValues, parseSeoSchemaData } from '../../shared/SeoFields';
import { getRecommendedSchemaType } from '@/lib/seo/schemaGenerator';
import { getPageStatus, PAGE_STATUS } from '@/lib/pages/normalizers';
import { PageFormHeader } from '../PageFormHeader';
import { PageMain } from '../PageMain';
import { PageSidebar } from '../PageSidebar';

export function PageForm({ editPage = false, data: pageData, mutate }) {
  const { toast } = useToast();
  const router = useRouter();
  const sourceSeo = pageData?.seo || pageData || {};

  const methods = useForm({
    defaultValues: {
      title: pageData?.title || pageData?.name || '',
      slug: pageData?.slug || '',
      status: getPageStatus(pageData || { status: PAGE_STATUS.draft }),
      excerpt: pageData?.excerpt || '',
      content: pageData?.content || '',
      seo: {
        ...defaultSeoValues,
        ...(pageData?.seo || {
          meta_title: sourceSeo?.meta_title,
          meta_description: sourceSeo?.meta_description,
          keywords: sourceSeo?.keywords,
          og_image_url: sourceSeo?.og_image_url,
          canonical_url: sourceSeo?.canonical_url,
          schema_type: sourceSeo?.schema_type,
          head_code: sourceSeo?.head_code,
          body_code: sourceSeo?.body_code,
          footer_code: sourceSeo?.footer_code,
        }),
        schema_type: sourceSeo?.schema_type || getRecommendedSchemaType('page'),
        schema_data: parseSeoSchemaData(sourceSeo?.schema_data),
      },
    },
    mode: 'onTouched',
  });

  const hasResetRef = useRef(false);
  useEffect(() => {
    if (editPage && !hasResetRef.current) {
      methods.reset(methods.getValues(), { keepValues: true });
      hasResetRef.current = true;
    }
  }, [editPage, methods]);

  const onSubmit = async (data) => {
    try {
      const response = editPage && pageData?.id ? await updatePage(pageData.id, data) : await createPage(data);

      if (!response.success) {
        toast({ title: response?.message || 'Something went wrong', variant: 'destructive' });
        return;
      }

      toast({ title: response?.message || 'Page saved successfully' });
      mutate?.();
      router.push('/dashboard/admin/pages');
    } catch (error) {
      console.error(error);
      toast({ title: 'Unexpected error', variant: 'destructive' });
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="flex flex-col space-y-4">
        <PageFormHeader editPage={editPage} />

        <div className="flex flex-col md:flex-row w-full gap-4">
          <PageMain />

          <div className="flex-1">
            <PageSidebar />
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
