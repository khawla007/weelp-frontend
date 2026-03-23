import _ from 'lodash';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { Star, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { Medialibrary } from '../../media/MediaLibrary';

// Media Tab
const MediaTab = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { selectedMedia, resetMedia } = useMediaStore(); // Retrive images From Media

  const {
    setValue,
    control,
    formState: { errors },
  } = useFormContext();

  const media_gallery =
    useWatch({
      name: 'media_gallery',
      control,
    }) || [];

  // Derive featured image ID from media_gallery
  const featuredImageId = media_gallery.find((img) => img.is_featured)?.media_id ?? null;

  // Effect for adding images from the media library selection
  useEffect(() => {
    if (selectedMedia.length > 0) {
      // 1. Transform selectedMedia (id → media_id)
      const transformedMedia = selectedMedia.map((obj) => _.mapKeys(obj, (value, key) => (key === 'id' ? 'media_id' : key)));

      // 2. Add to existing gallery and sync to form
      const updatedGallery = [...media_gallery, ...transformedMedia];
      setValue('media_gallery', updatedGallery, { shouldDirty: true, shouldValidate: true });

      resetMedia();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDialogOpen(false);
    }
  }, [selectedMedia, media_gallery, setValue, resetMedia]);

  // handleDeleteImage
  const handleDeleteImage = (imageToDelete) => {
    const updatedGallery = media_gallery.filter((img) => img.url !== imageToDelete.url);
    setValue('media_gallery', updatedGallery, { shouldDirty: true, shouldValidate: true });
  };

  // handleSetFeatured
  const handleSetFeatured = (mediaId) => {
    // Toggle: if clicking same image, deselect; otherwise, select new
    const isCurrentlyFeatured = featuredImageId === mediaId;
    const updatedGallery = media_gallery.map((img) => ({
      ...img,
      is_featured: img.media_id === mediaId ? !isCurrentlyFeatured : false,
    }));

    setValue('media_gallery', updatedGallery, { shouldDirty: true, shouldValidate: true });
  };

  // Handle selection changes from MediaLibrary (for unselection)
  const handleSelectionChange = ({ removed }) => {
    if (removed && removed.length > 0) {
      const removedIds = new Set(removed.map((img) => img.media_id || img.id));
      const updatedGallery = media_gallery.filter((img) => !removedIds.has(img.media_id || img.id));
      setValue('media_gallery', updatedGallery, { shouldDirty: true, shouldValidate: true });
    }
  };

  return (
    <div className="flex flex-col gap-4">
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
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">Click the star icon to mark an image as featured</p>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-fit">
              <Upload className="h-4 w-4 mr-2" />
              Select Media
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-screen-xl">
            <DialogTitle className="sr-only">Edit profile</DialogTitle>
            <DialogDescription className="invisible">Upload Media For Activity</DialogDescription>
            <Medialibrary closeDialog={() => setDialogOpen(false)} alreadySelectedImages={media_gallery} onSelectionChange={handleSelectionChange} />
          </DialogContent>
        </Dialog>
      </div>

      {/**Selected Media From Store */}
      {media_gallery.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4 ">
          {media_gallery.map((image, index) => {
            const isFeatured = image.media_id == featuredImageId;
            return (
              <div key={index} className="group/item relative rounded-md border cursor-pointer p-2 border-black">
                <img className="size-72 rounded-md border" src={image?.url} alt="activity_image" />
                {/* Featured Star - Top Right */}
                <Star
                  size={24}
                  fill={isFeatured ? '#568f7c' : 'white'}
                  strokeWidth={2}
                  onClick={() => handleSetFeatured(image.media_id)}
                  className={`absolute top-4 right-4 transition-all cursor-pointer drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)] ${isFeatured ? 'text-[#568f7c]' : 'text-[#568f7c] hover:scale-110'}`}
                />
                {isFeatured && <div className="absolute top-4 left-4 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>}
                <Trash2 onClick={() => handleDeleteImage(image)} className="absolute bottom-4 right-4 size-0 group-hover/item:size-6 transition-all text-red-500 bg-white rounded-full shadow p-1" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full">{errors.media_gallery && <p className="text-red-500 mt-1">{errors.media_gallery.message}</p>}</div>
      )}
    </div>
  );
};

export default MediaTab;
