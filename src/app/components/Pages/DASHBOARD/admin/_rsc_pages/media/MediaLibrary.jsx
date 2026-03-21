'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectableCardCheckbox } from '@/app/components/Checkbox/SelectableCardCheckbox';
import { Search, Upload, Check, Edit, Trash2 } from 'lucide-react';
import { MediaSelectionBadge } from '@/app/components/dashboard/shared/MediaSelectionBadge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { usePathname } from 'next/navigation';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { UploadImagesForm } from './ImageUploadForm';
import { ImagePreviewForm } from './ImagePreviewForm';
import { isEmpty } from 'lodash';
import { useAllMediaAdmin } from '@/hooks/api/admin/media';
import { useIsClient } from '@/hooks/useIsClient';
import { useToast } from '@/hooks/use-toast';
import { CustomPagination } from '@/app/components/Pagination';

export function Medialibrary({ closeDialog, alreadySelectedImages = [], onSelectionChange }) {
  const isClient = useIsClient(); // hydration
  const [selectedImage, setSelectedImage] = useState({}); // Media Page View Popup
  const [selectedImages, setSelectedImages] = useState([]); // Selecting list of Images for store
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadImagePop, setUploadImagePopUp] = useState(false); // For Uploading Image Popup
  const [selectedItems, setSelectedItems] = useState([]); // Selected media IDs for bulk delete
  const [currentPage, setCurrentPage] = useState(1); // Current pagination page
  const [isAllSelected, setIsAllSelected] = useState(false); // Track Select All toggle state
  const pathname = usePathname();
  const { toast } = useToast();
  const { addMedia, removeMedia, selectedMedia } = useMediaStore();
  const isMediaPage = pathname === '/dashboard/admin/media';

  // Handle page change - clears selections
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedItems([]);
    setIsAllSelected(false);
  };
  const { media: data = [], pagination, isLoading: loading, isValidating, error, mutate: mutateMedia } = useAllMediaAdmin(currentPage);
  const images = Array.isArray(data) ? data : []; // safe fallback
  const { currentPage: apiPage, perPage, total } = pagination;

  // Track if we've initialized with alreadySelectedImages (prevent re-initialization on re-renders)
  const initializedRef = useRef(false);
  const prevAlreadySelectedRef = useRef([]);

  // Create set of already-selected image IDs for O(1) lookup
  // alreadySelectedImages have media_id, but media library uses id
  const alreadySelectedIds = useMemo(() => new Set(alreadySelectedImages.map((img) => img.media_id || img.id).filter(Boolean)), [alreadySelectedImages]);

  // Computed images array: In popup, show already selected images first, max 10 total
  const displayImages = useMemo(() => {
    if (isMediaPage) {
      // On media page, show paginated images as-is
      return images;
    }

    const IMAGES_PER_PAGE = 10;

    // Transform already selected images
    const alreadySelectedImageData = alreadySelectedImages
      .map((img) => ({
        ...img,
        id: img.media_id || img.id,
      }))
      .filter((img) => img.id && alreadySelectedIds.has(img.id));

    // How many slots remaining after showing already selected?
    const remainingSlots = Math.max(0, IMAGES_PER_PAGE - alreadySelectedImageData.length);

    // If already selected fills or exceeds the limit, show only those (up to 10)
    if (remainingSlots === 0) {
      return alreadySelectedImageData.slice(0, IMAGES_PER_PAGE);
    }

    // Filter out already selected images from paginated results and take remaining slots
    const remainingImages = images.filter((img) => !alreadySelectedIds.has(img.id)).slice(0, remainingSlots);

    return [...alreadySelectedImageData, ...remainingImages];
  }, [isMediaPage, images, alreadySelectedImages, alreadySelectedIds]);

  // Initialize selectedImages with alreadySelectedImages on first render or when it changes
  // Note: We intentionally sync state with props here. This is a valid use case for showing
  // already-selected images in the media library dialog.
  useEffect(() => {
    // Only re-initialize if the alreadySelectedImages actually changed
    // Check by length first to avoid unnecessary updates for empty arrays
    const prevLength = prevAlreadySelectedRef.current.length;
    const currLength = alreadySelectedImages.length;

    if (prevLength !== currLength || (currLength > 0 && alreadySelectedImages !== prevAlreadySelectedRef.current)) {
      prevAlreadySelectedRef.current = alreadySelectedImages;

      // Transform alreadySelectedImages to match media library structure (id instead of media_id)
      const transformed = alreadySelectedImages.map((img) => ({
        ...img,
        id: img.media_id || img.id,
      }));
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Intentional sync with props
      setSelectedImages(transformed);
    }
  }, [alreadySelectedImages]);

  // Select image Store Functionality - normal toggle for all images
  const handleSelect = (image) => {
    setSelectedImages((prev) => (prev.some((img) => img.id === image.id) ? prev.filter((img) => img.id !== image.id) : [...prev, image]));
  };

  // Select image Dialog Functionality
  const handleSelectMedia = (image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  // Handle Store Images
  const selectedImagesHandleStore = () => {
    // Find newly selected images (not in alreadySelectedImages)
    const alreadySelectedIdsArray = Array.from(alreadySelectedIds);
    const newlySelected = selectedImages.filter((img) => !alreadySelectedIdsArray.includes(img.id));

    // Find unselected images (were in alreadySelectedImages but not in final selection)
    const finalSelectedIds = new Set(selectedImages.map((img) => img.id));
    const unselected = alreadySelectedImages.filter((img) => {
      const imgId = img.media_id || img.id;
      return !finalSelectedIds.has(imgId);
    });

    // Add newly selected images to store
    if (newlySelected.length > 0) {
      addMedia(newlySelected);
    }

    // Notify parent about selection changes (for handling removal)
    if (onSelectionChange) {
      onSelectionChange({
        added: newlySelected,
        removed: unselected,
      });
    }

    // Close parent dialog if callback provided
    if (closeDialog) {
      closeDialog();
    }
  };

  if (isClient) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Media</h2>
          </div>
          <div className="flex items-center gap-2">
            {isMediaPage && selectedItems.length > 0 ? (
              <>
                {/* Select All / Unselect All Button */}
                <Button
                  onClick={() => {
                    if (isAllSelected) {
                      setSelectedItems([]);
                    } else {
                      setSelectedItems(images.map((img) => img.id));
                    }
                    setIsAllSelected(!isAllSelected);
                  }}
                  variant="outline"
                  className="bg-secondaryDark text-black hover:bg-secondaryDark/90"
                >
                  {isAllSelected ? 'Unselect All' : `Select All (${images.length})`}
                </Button>

                {/* Delete Button */}
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      const { deleteMultipleMedia } = await import('@/lib/actions/media');
                      const result = await deleteMultipleMedia(selectedItems);

                      if (result.success) {
                        toast({
                          title: `${selectedItems.length} media deleted`,
                          variant: 'success',
                        });
                        mutateMedia();
                        setSelectedItems([]);
                        setIsAllSelected(false);
                      } else {
                        toast({
                          title: 'Delete failed',
                          description: result.error,
                          variant: 'destructive',
                        });
                      }
                    } catch (error) {
                      toast({
                        title: 'Delete failed',
                        description: error.message || 'An unexpected error occurred',
                        variant: 'destructive',
                      });
                    }
                  }}
                >
                  <Trash2 size={16} className="mr-2" />
                  Delete ({selectedItems.length})
                </Button>
              </>
            ) : (
              /* Upload Button - shown when no selection (on both Media page and popup) */
              <Button
                onClick={() => {
                  setUploadImagePopUp(!uploadImagePop);
                }}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 hidden">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search media..." className="pl-9" />
          </div>
        </div>

        {/* ✅ Media Gallery Section */}
        <div className="w-fulll">
          {isValidating ? (
            <div className="h-auto flex items-center justify-center">
              <span className="loader" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center text-red-500">Failed to load media.</div>
          ) : displayImages.length === 0 ? (
            <div className={`flex items-center justify-center ${isMediaPage ? 'h-screen' : 'h-fit'}`}>Sorry, no images.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {displayImages.map((image, index) => {
                const isSelected = selectedImages?.some((img) => img.id === image.id);
                const wasAlreadySelected = alreadySelectedIds.has(image.id);

                return (
                  <Card
                    key={index}
                    className={`group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer transition-all
                      ${isSelected ? 'border-4 border-[#568f7c]' : 'border border-gray-200'}
                    `}
                    onClick={() => {
                      if (isMediaPage) {
                        handleSelectMedia(image);
                      } else {
                        handleSelect(image);
                      }
                    }}
                  >
                    <img src={image?.url} alt={image?.alt_text} className="object-cover transition-all hover:scale-105 w-full h-full" />

                    {/* Selection Checkbox - Only on Media Page */}
                    {isMediaPage && (
                      <div className="absolute top-4 left-4 w-fit z-10" onClick={(e) => e.stopPropagation()}>
                        <SelectableCardCheckbox
                          checked={selectedItems.includes(image.id)}
                          onCheckedChange={(checked, id) => {
                            setSelectedItems((prev) => {
                              const newSelection = checked ? [...prev, id] : prev.filter((itemId) => itemId !== id);

                              // Update isAllSelected state
                              setIsAllSelected(newSelection.length === images.length);
                              return newSelection;
                            });
                          }}
                          itemId={image.id}
                        />
                      </div>
                    )}

                    {/* Dark overlay on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none" />

                    {/* Edit pencil icon - shown on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent Card click
                        handleSelectMedia(image);
                      }}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 pointer-events-auto"
                    >
                      <Edit size={20} className="text-gray-700" />
                    </button>

                    {/* Selection badge - shows in both selected and unselected states */}
                    {!isMediaPage && <MediaSelectionBadge isSelected={isSelected} />}
                  </Card>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {total > 0 && (
            <div className="flex justify-end mt-6">
              <CustomPagination totalItems={total} itemsPerPage={perPage} currentPage={apiPage} onPageChange={handlePageChange} />
            </div>
          )}
        </div>

        {/* Dialog to show selected image */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md min-h-fit h-fit">
            <DialogHeader>
              <DialogTitle>Image Preview</DialogTitle>
              <DialogDescription className="sr-only">{selectedImage?.alt}</DialogDescription>
            </DialogHeader>
            <ImagePreviewForm selectedImage={selectedImage} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} mutateMedia={mutateMedia} />
          </DialogContent>
        </Dialog>

        {/* Dialog to Upload image */}
        <Dialog open={uploadImagePop} onOpenChange={setUploadImagePopUp}>
          <DialogContent className="md:max-w-screen-lg max-w-md rounded-md">
            <DialogHeader>
              <DialogTitle>Upload Image</DialogTitle>
              <DialogDescription>Select an image from your computer to upload.</DialogDescription>
            </DialogHeader>
            <UploadImagesForm uploadImagePop={uploadImagePop} setUploadImagePopUp={setUploadImagePopUp} mutateMedia={mutateMedia} />
          </DialogContent>
        </Dialog>

        {/* If Images Are Selected Outside of the Media Library */}
        {!isMediaPage && !isEmpty(selectedImages) && (
          <Button onClick={selectedImagesHandleStore} className="bg-secondaryDark w-fit col-span-full">
            Select Images
          </Button>
        )}
      </div>
    );
  }
}
