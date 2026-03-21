'use client';

import { MediaTab } from '@/app/components/Media';
import React, { useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useAllCategoriesOptionsAdmin } from '@/hooks/api/admin/categories';
import { useAlltagsOptionsAdmin } from '@/hooks/api/admin/tags';
import { WidgetCard } from './components/WidgetCard';
import { Textarea } from '@/components/ui/textarea';
import dynamic from 'next/dynamic';

const Select = dynamic(() => import('react-select').then((mod) => mod.default), { ssr: false });
import { PostMedia } from './PostMedia';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Medialibrary } from '../media/MediaLibrary';
import { Upload } from 'lucide-react';

const BlogSidebar = () => {
  const { control, setValue } = useFormContext(); // conext provider
  const { categoriesList, error: isCategoryError, isLoading: isCategoryLoading } = useAllCategoriesOptionsAdmin();
  const { tagList, error: isTagError, isLoading: isTagLoading } = useAlltagsOptionsAdmin();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Get media_gallery from form state
  const media_gallery = useWatch({
    name: 'media_gallery',
  });

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

  // Handle selection changes from MediaLibrary (for unselection)
  const handleSelectionChange = ({ removed }) => {
    if (removed && removed.length > 0) {
      const removedIds = new Set(removed.map((img) => img.media_id || img.id));
      const updatedGallery = media_gallery.filter((img) => !removedIds.has(img.media_id || img.id));
      setValue('media_gallery', updatedGallery);
    }
  };

  return (
    <div className="space-y-6">
      {/* Excerpt */}
      <WidgetCard cardTitle="Excerpt">
        <Controller
          name="excerpt"
          control={control}
          rules={{ required: 'Field Required', maxLength: { value: 300, message: 'Excerpt too long (max 300 characters)' } }}
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

      {/* Media Gallery */}
      <WidgetCard
        cardTitle="Media Gallery"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Select Media
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-screen-xl">
              <DialogTitle className="sr-only">Edit profile</DialogTitle>
              <DialogDescription className="invisible">Upload Media For Blog</DialogDescription>
              <Medialibrary closeDialog={() => setDialogOpen(false)} alreadySelectedImages={media_gallery || []} onSelectionChange={handleSelectionChange} />
            </DialogContent>
          </Dialog>
        }
      >
        <PostMedia setDialogOpen={setDialogOpen} />
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
      </WidgetCard>
    </div>
  );
};

export default BlogSidebar;
