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
      hero_background_image_url: pageData?.hero_background_image_url || '',
      hero_heading: pageData?.hero_heading || '',
      hero_text: pageData?.hero_text || '',
      hero_button_label: pageData?.hero_button_label || '',
      hero_button_url: pageData?.hero_button_url || '',
      hero_overlay_color: pageData?.hero_overlay_color || '',
      hero_overlay_opacity: pageData?.hero_overlay_opacity ?? '',
      hero_content_vertical_position: pageData?.hero_content_vertical_position || '',
      hero_heading_size: pageData?.hero_heading_size || '',
      hero_heading_color: pageData?.hero_heading_color || '',
      hero_heading_align: pageData?.hero_heading_align || '',
      hero_heading_bold: Boolean(pageData?.hero_heading_bold),
      hero_heading_italic: Boolean(pageData?.hero_heading_italic),
      hero_heading_underline: Boolean(pageData?.hero_heading_underline),
      hero_text_size: pageData?.hero_text_size || '',
      hero_text_color: pageData?.hero_text_color || '',
      hero_text_align: pageData?.hero_text_align || '',
      hero_text_bold: Boolean(pageData?.hero_text_bold),
      hero_text_italic: Boolean(pageData?.hero_text_italic),
      hero_text_underline: Boolean(pageData?.hero_text_underline),
      hero_button_radius: pageData?.hero_button_radius || '',
      hero_button_border_width: pageData?.hero_button_border_width || '',
      hero_button_padding: pageData?.hero_button_padding || '',
      hero_button_margin: pageData?.hero_button_margin || '',
      hero_button_text_color: pageData?.hero_button_text_color || '',
      hero_button_bg_color: pageData?.hero_button_bg_color || '',
      hero_button_border_color: pageData?.hero_button_border_color || '',
      hero_button_text_size: pageData?.hero_button_text_size || '',
      hero_button_align: pageData?.hero_button_align || '',
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
      if (editPage) {
        router.refresh();
        methods.reset(data);
        return;
      }

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
