import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMediaStore } from '@/lib/store/useMediaStore';
import _ from 'lodash';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Medialibrary } from './Pages/DASHBOARD/admin/_rsc_pages/media/MediaLibrary';
import { ImageTrashCard } from './Pages/DASHBOARD/admin/_rsc_pages/media/ImageTrashCard';

/**
 * MediaTab
 * @param {boolean} galleryThumbnail Selected Image Display in thumbnail or full
 * @param {string} buttonTitle Title of the Button for Open Gallery Default e.g Upload Media
 * @returns {React.Component} React Component to Display Selected Image Compnent
 */
export const MediaTab = ({ galleryThumbnail = false, buttonTitle = 'Upload Media' }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activityImages, setActivityImages] = useState([]); // all images intialize
  const { selectedMedia, resetMedia } = useMediaStore(); // Retrive images From Media

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const media_gallery = useWatch({
    name: 'media_gallery',
  });

  //  Hydarte First if there is already media exist
  useEffect(() => {
    if (media_gallery?.length > 0) {
      setActivityImages(media_gallery); // Sync from form to local state
    }
  }, []);

  // sideeffect for getting image from gallery popup
  useEffect(() => {
    if (selectedMedia.length > 0) {
      // 1. Transform selectedMedia (id → media_id) before adding
      const transformedMedia = selectedMedia.map((obj) => _.mapKeys(obj, (value, key) => (key === 'id' ? 'media_id' : key))); // update key to media id

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
      // setActivityImages(updatedImages);
      setTimeout(() => setValue('media_gallery', updatedImages), 0); //
      return updatedImages;
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="hidden">
        <Controller
          control={control}
          name="media_gallery"
          defaultValue={[]}
          rules={{
            validate: (val) => val?.length > 0 || 'Please upload at least 1 image.',
          }}
          render={() => ''}
        />
      </div>

      {/**Uploaded Media As Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-fit self-end">
            {buttonTitle}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-screen-xl">
          <DialogTitle className="sr-only">Upload Image</DialogTitle>
          <DialogDescription className="invisible">Upload Media </DialogDescription>
          <Medialibrary />
        </DialogContent>
      </Dialog>

      {/**Selected Media From Store */}
      {activityImages.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4 ">
          {activityImages.map((image, index) => {
            return <ImageTrashCard onDelete={handleDeleteImage} image={image} key={index} galleryThumbnail={galleryThumbnail} />;
          })}
        </div>
      ) : (
        <div className="w-full">{errors?.media_gallery && <p className="text-red-500 mt-1">{errors?.media_gallery?.message}</p>}</div>
      )}
    </div>
  );
};
