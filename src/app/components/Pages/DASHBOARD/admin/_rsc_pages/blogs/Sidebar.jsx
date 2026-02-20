import { MediaTab } from '@/app/components/Media';
import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ActionForm } from './actionform/BlogActions'; // blog action component
import { useAllCategoriesOptionsAdmin } from '@/hooks/api/admin/categories';
import { useAlltagsOptionsAdmin } from '@/hooks/api/admin/tags';
import { WidgetCard } from './components/WidgetCard';
import { Textarea } from '@/components/ui/textarea';
import Select from 'react-select';

const BlogSidebar = () => {
  const { control } = useFormContext(); // conext provider
  const { categoriesList, error: isCategoryError, isLoading: isCategoryLoading, mutate: mutateCategories } = useAllCategoriesOptionsAdmin();
  const { tagList, error: isTagError, isLoading: isTagLoading, mutate: mutateTag } = useAlltagsOptionsAdmin();

  // Options For categories
  const categoriesOptions =
    categoriesList.length > 0
      ? categoriesList.map((cat) => ({
          label: cat.name,
          value: cat.id,
        }))
      : [];

  // Options For Tags
  const tagOptions =
    tagList.length > 0
      ? tagList.map((tag) => ({
          label: tag.name,
          value: tag.id,
        }))
      : [];

  return (
    <div className="space-y-6">
      {/* Excerpt */}
      <WidgetCard cardTitle="Excerpt">
        <Controller
          name="excerpt"
          control={control}
          rules={{ required: 'Field Required', maxLength: { value: 70, message: 'Too Much Loog' } }}
          render={({ field, fieldState: { error } }) => {
            return (
              <>
                <Textarea {...field} />
                {error?.message && <span className="text-red-400">{error?.message}</span>}
              </>
            );
          }}
        />
      </WidgetCard>

      {/* Media Tab */}
      <WidgetCard cardTitle="Featured Image">
        <Controller
          name="media_gallery"
          control={control}
          render={({ field }) => {
            return <MediaTab {...field} galleryThumbnail buttonTitle="Set Featured Images" />;
          }}
        />
      </WidgetCard>

      {/* { categories */}
      <WidgetCard cardTitle="Categories">
        {isCategoryLoading && <span className="loader"></span>}
        {!isCategoryError && (
          <Controller
            name="categories"
            control={control}
            rules={{ required: 'Field Required' }}
            render={({ field, fieldState: { error } }) => {
              return (
                <>
                  <Select isMulti {...field} placeholder="Select Categories" options={categoriesOptions} />
                  {error?.message && <span className="text-red-400">{error?.message}</span>}
                </>
              );
            }}
          />
        )}

        <ActionForm type={'category'} placeholder="Add a category" onSuccess={mutateCategories} />
      </WidgetCard>

      {/* Tags */}
      <WidgetCard cardTitle="Tags">
        {isTagLoading && <span className="loader"></span>}
        {!isTagError && (
          <Controller
            name="tags"
            control={control}
            rules={{ required: 'Field Required' }}
            defaultValue={[]}
            render={({ field, fieldState: { error } }) => {
              return (
                <>
                  <Select isMulti {...field} placeholder="Select tags" options={tagOptions} />
                  {error?.message && <span className="text-red-400">{error?.message}</span>}
                </>
              );
            }}
          />
        )}

        {/* Actions */}
        <ActionForm type="tag" placeholder="Add a tag" onSuccess={mutateTag} />
      </WidgetCard>
    </div>
  );
};

export default BlogSidebar;
