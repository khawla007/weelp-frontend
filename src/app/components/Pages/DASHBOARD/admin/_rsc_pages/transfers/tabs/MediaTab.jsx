'use client';

import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import _ from 'lodash';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash2, Star } from 'lucide-react';

const Medialibrary = dynamic(() => import('../../media/MediaLibrary').then((mod) => mod.Medialibrary), { ssr: false }); // dynamically import model

// Media Tab
const MediaTab = () => {
  const { control } = useFormContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityImages, setActivityImages] = useState([]); // all images intialize
  const { selectedMedia, resetMedia } = useMediaStore(); // Retrive images From Media

  const {
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();

  const media = useWatch({
    name: 'media_gallery',
  });

  // Derive featured image ID from media_gallery
  const featuredImageId = media?.find((img) => img.is_featured)?.media_id ?? null;

  // Handle Set Featured
  const handleSetFeatured = (mediaId) => {
    const isCurrentlyFeatured = featuredImageId === mediaId;
    const updatedGallery = activityImages.map((img) => ({
      ...img,
      is_featured: img.media_id === mediaId ? !isCurrentlyFeatured : false,
    }));
    setActivityImages(updatedGallery);
    setValue('media_gallery', updatedGallery);
  };

  //  Hydarte First if there is already media exist
  useEffect(() => {
    if (media?.length > 0) {
      setActivityImages(media); // Sync from form to local state
    }
  }, []);

  // sideeffect for getting image from gallery popup
  useEffect(() => {
    if (selectedMedia.length > 0) {
      // 1. Transform selectedMedia (id → media_id) before adding
      const transformedMedia = selectedMedia.map((obj) => ({
        ..._.mapKeys(obj, (value, key) => (key === 'id' ? 'media_id' : key)),
        is_featured: false,
      })); // update key to media id and add is_featured

      // 2. Push transformed data to local state
      setActivityImages((prev) => [...prev, ...transformedMedia]);
      resetMedia(); // runs immediately after set
      setDialogOpen(false);
    }
  }, [selectedMedia]);

  // sycn with form
  useEffect(() => {
    setValue('media_gallery', activityImages); // sync form
  }, [activityImages, setValue]);

  // handleDelteImage
  const handleDeleteImage = (image) => {
    setActivityImages((prev) => {
      const updatedImages = prev.filter((img) => img.url !== image.url);
      setTimeout(() => setValue('media_gallery', updatedImages), false);
      return updatedImages;
    });
  };

  // Handle selection changes from MediaLibrary (for unselection)
  const handleSelectionChange = ({ removed }) => {
    if (removed && removed.length > 0) {
      setActivityImages((prev) => {
        const removedIds = new Set(removed.map((img) => img.media_id || img.id));
        const updatedImages = prev.filter((img) => !removedIds.has(img.media_id || img.id));
        setValue('media_gallery', updatedImages);
        return updatedImages;
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="hidden">
        <Controller
          control={control}
          name="media_gallery"
          rules={{
            validate: (val) => val?.length > 0 || 'Please upload at least 1 image.',
          }}
          render={() => ''}
        />
      </div>

      <p className="text-sm text-gray-500">Click the star icon to mark an image as featured</p>

      {/**Uploaded Media As Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-fit self-end">
            Upload Media
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-screen-xl">
          <DialogTitle className="sr-only">Edit profile</DialogTitle>
          <DialogDescription className="invisible">Upload Media For Activity</DialogDescription>
          <Medialibrary
            closeDialog={() => setDialogOpen(false)}
            alreadySelectedImages={activityImages}
            onSelectionChange={handleSelectionChange}
          />
        </DialogContent>
      </Dialog>

      {/**Selected Media From Store */}
      {activityImages.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4">
          {activityImages.map((image, index) => {
            const isFeatured = featuredImageId === image.media_id;
            return (
              <div key={index} className="group/item relative rounded-md border cursor-pointer p-2 border-black">
                <img className="size-72 rounded-md border" src={image?.url} alt="activity_image" />

                {/* Featured Badge */}
                {isFeatured && (
                  <div className="absolute top-4 left-4 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">
                    Featured
                  </div>
                )}

                {/* Star Icon for Featured */}
                <Star
                  size={24}
                  fill={isFeatured ? '#568f7c' : 'white'}
                  strokeWidth={2}
                  onClick={() => handleSetFeatured(image.media_id)}
                  className={`absolute top-4 right-4 transition-all cursor-pointer drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)] ${
                    isFeatured ? 'text-[#568f7c]' : 'text-[#568f7c] hover:scale-110'
                  }`}
                />

                <Trash2 onClick={() => handleDeleteImage(image)} className="absolute bottom-8 right-8 size-0 group-hover/item:size-6 transition-all text-red-400 bg-white rounded-full shadow" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full">{errors.media && <p className="text-red-500 mt-1">{errors.media.message}</p>}</div>
      )}
    </div>
  );
};

export default MediaTab;
