import { Button } from '@/components/ui/button';
import { ArrowLeft, ExternalLink, Eye } from 'lucide-react';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { hasEditorContent } from '../../shared/richTextContent';
import { isBlogCreateReady } from './blogReadiness';

export { isBlogCreateReady } from './blogReadiness';

const previewStorageKey = 'weelp:blog-preview';

const mapOptionsToLabels = (items = []) =>
  Array.isArray(items)
    ? items.map((item) => ({
        id: item.value ?? item.id,
        name: item.label ?? item.name ?? item.tag_name ?? item.category_name ?? '',
        slug: item.slug,
      }))
    : [];

export const BlogHeader = ({ editPage = false, blogData }) => {
  const router = useRouter();

  const {
    control,
    getValues,
    formState: { isSubmitting, isValid, isDirty },
  } = useFormContext();

  // Watch required fields for create mode validation
  const nameValue = useWatch({ control, name: 'name' });
  const slugValue = useWatch({ control, name: 'slug' });
  const contentValue = useWatch({ control, name: 'content' });
  const excerptValue = useWatch({ control, name: 'excerpt' });
  const mediaGalleryValue = useWatch({ control, name: 'media_gallery' });
  const categoriesValue = useWatch({ control, name: 'categories' });
  const tagsValue = useWatch({ control, name: 'tags' });

  const hasContent = hasEditorContent(contentValue || blogData?.content);

  // Create: enabled only when the payload can pass backend create validation.
  // Edit: enabled when any field is changed (dirty)
  const isCreateValid = isBlogCreateReady({
    name: nameValue,
    slug: slugValue,
    content: contentValue || blogData?.content,
    excerpt: excerptValue,
    mediaGallery: mediaGalleryValue,
    categories: categoriesValue,
    tags: tagsValue,
  });
  const computedDisabled = editPage ? !isDirty : !isCreateValid;
  const originalSlug = blogData?.slug;

  const handlePreview = () => {
    const values = getValues();
    const payload = {
      id: blogData?.id,
      name: values.name || blogData?.name || 'Blog preview',
      title: values.name || blogData?.name || 'Blog preview',
      slug: values.slug || blogData?.slug || '',
      excerpt: values.excerpt || blogData?.excerpt || '',
      content: values.content || blogData?.content || '',
      publish: values.publish ?? blogData?.publish ?? false,
      categories: mapOptionsToLabels(values.categories),
      tags: mapOptionsToLabels(values.tags),
      media_gallery: values.media_gallery || blogData?.media_gallery || [],
      original_url: originalSlug ? `/blogs/${originalSlug}` : null,
    };

    window.localStorage.setItem(previewStorageKey, JSON.stringify(payload));
    window.open('/preview/blog', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-4 flex-wrap">
        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="size-8" />
        </Button>
        <h1 className="text-2xl font-bold">{editPage ? 'Edit Blog Post' : 'Create New Blog Post'}</h1>
      </div>

      {/* On Submit Control */}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={handlePreview} disabled={!hasContent}>
          <Eye className="size-4" />
          Preview
        </Button>

        {editPage && originalSlug && (
          <Button type="button" variant="outline" asChild>
            <a href={`/blogs/${originalSlug}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              View Original
            </a>
          </Button>
        )}

        <Controller
          control={control}
          name="publish"
          render={({ field }) => (
            <div className="flex items-center space-x-2">
              <Label htmlFor="publish">Publish</Label>
              <Switch id="publish" checked={field.value} onCheckedChange={field.onChange} />
            </div>
          )}
        />

        <FormActionButtons
          mode={editPage ? 'update' : 'create'}
          isSubmitting={isSubmitting}
          isDisabled={computedDisabled}
          cancelAlwaysEnabled={true}
          cancelHref="/dashboard/admin/blogs"
          showCancel={true}
          containerType="none"
          className="flex gap-2"
        />
      </div>
    </div>
  );
};
