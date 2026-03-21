import { useMediaStore } from '@/lib/store/useMediaStore';
import _ from 'lodash';
import { Trash2, Star } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Controller, useFormContext, useWatch } from 'react-hook-form';

// Media Tab
export const PostMedia = ({ setDialogOpen, onSelectionChange }) => {
  const { selectedMedia, resetMedia } = useMediaStore(); // Retrive images From Media

  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext();

  const media_gallery = useWatch({
    name: 'media_gallery',
  });

  // Find featured image
  const featuredImageId = media_gallery?.find((img) => img.is_featured)?.media_id ?? null;

  // Initialize with existing media from form (lazy initialization)
  const [activityImages, setActivityImages] = useState(() => media_gallery || []);

  // Track if we're updating from external source (to avoid infinite loops)
  const isExternalUpdateRef = useRef(false);

  // Sync activityImages with media_gallery when it changes externally (e.g., from handleSelectionChange)
  useEffect(() => {
    // Only sync if the change is external (not from our own setValue)
    if (media_gallery && !isExternalUpdateRef.current) {
      // Check if there's an actual difference to avoid unnecessary updates
      const currentIds = new Set(activityImages.map((img) => img.media_id || img.id));
      const galleryIds = new Set(media_gallery.map((img) => img.media_id || img.id));

      // Compare sets - if different, sync
      if (currentIds.size !== galleryIds.size || ![...currentIds].every((id) => galleryIds.has(id))) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync with form data
        setActivityImages(media_gallery);
      }
    }
    // Reset the flag after checking
    isExternalUpdateRef.current = false;
  }, [media_gallery]);

  // sideeffect for getting image from gallery popup
  useEffect(() => {
    if (selectedMedia.length > 0) {
      // 1. Transform selectedMedia (id → media_id) before adding
      const transformedMedia = selectedMedia.map((obj) => {
        const mapped = _.mapKeys(obj, (value, key) => (key === 'id' ? 'media_id' : key));
        return { ...mapped, is_featured: false }; // Explicitly set as NOT featured
      });

      // 2. Push transformed data to local state
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync with media store
      setActivityImages((prev) => [...prev, ...transformedMedia]);
      resetMedia(); // runs immediately after set
      if (setDialogOpen) {
        setDialogOpen(false);
      }
    }
  }, [selectedMedia, resetMedia, setDialogOpen]);

  // Sync with form (local state → form)
  useEffect(() => {
    // Mark this as our own update to prevent syncing back
    isExternalUpdateRef.current = true;
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

  // handleSetFeatured
  const handleSetFeatured = (mediaId) => {
    // Toggle: if clicking same image, deselect; otherwise, select new
    const isCurrentlyFeatured = featuredImageId === mediaId;
    const updatedGallery = activityImages.map((img) => ({
      ...img,
      is_featured: img.media_id === mediaId ? !isCurrentlyFeatured : false,
    }));

    setActivityImages(updatedGallery);
    setValue('media_gallery', updatedGallery, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
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

      {/**Selected Media From Store */}
      {activityImages.length > 0 ? (
        <div className="w-full flex flex-wrap gap-4 ">
          {activityImages.map((image, index) => {
            const isFeatured = featuredImageId === image.media_id;
            return (
              <div key={index} className="group/item relative rounded-md border cursor-pointer p-2 border-black">
                <img className="size-72 rounded-md border" src={image?.url} alt="activity_image" />

                {/* Featured Star - Top Right */}
                <Star
                  size={20}
                  fill={isFeatured ? '#568f7c' : 'white'}
                  strokeWidth={2}
                  onClick={() => handleSetFeatured(image.media_id)}
                  className={`absolute top-4 right-4 transition-all cursor-pointer drop-shadow-[0_2px_4px_rgba(86,143,124,0.3)] ${isFeatured ? 'text-[#568f7c]' : 'text-[#568f7c] hover:scale-110'}`}
                />

                {/* Featured Badge - Top Left */}
                {isFeatured && <div className="absolute top-4 left-4 bg-[#568f7c] text-white text-xs px-2 py-1 rounded-md font-medium">Featured</div>}

                {/* Trash - Bottom Right */}
                <Trash2 onClick={() => handleDeleteImage(image)} className="absolute bottom-4 right-4 size-0 group-hover/item:size-6 transition-all text-red-500 bg-white rounded-full shadow p-1" />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="w-full">{errors?.media_gallery && <p className="text-red-500 mt-1">{errors?.media_gallery?.message}</p>}</div>
      )}
    </>
  );
};
