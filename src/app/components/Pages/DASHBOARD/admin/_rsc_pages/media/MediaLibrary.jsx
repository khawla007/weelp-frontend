'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { usePathname } from 'next/navigation';
import { useMediaStore } from '@/lib/store/useMediaStore';
import { UploadImagesForm } from './ImageUploadForm';
import { ImagePreviewForm } from './ImagePreviewForm';
import { isEmpty } from 'lodash';
import { useAllMediaAdmin } from '@/hooks/api/admin/media';
import { useIsClient } from '@/hooks/useIsClient';

export function Medialibrary() {
  const isClient = useIsClient(); // hydration
  const [selectedImage, setSelectedImage] = useState({}); // Media Page View Popup
  const [selectedImages, setSelectedImages] = useState([]); // Selecting list of Images for store
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadImagePop, setUploadImagePopUp] = useState(false); // For Uploading Image Popup
  const pathname = usePathname();
  const { addMedia, selectedMedia } = useMediaStore();
  const isMediaPage = pathname === '/dashboard/admin/media';
  const { media: data = [], isLoading: loading, isValidating, error, mutate: mutateMedia } = useAllMediaAdmin(); // fetch media by swr
  const images = Array.isArray(data) ? data : []; // safe fallback

  // Select image Store Functionality
  const handleSelect = (image) => {
    setSelectedImages((prev) => (prev.some((img) => img.id === image.id) ? prev.filter((img) => img.id !== image.id) : [...prev, image])); //not match with previous
  };

  // Select image Dialog Functionality
  const handleSelectMedia = (image) => {
    setSelectedImage(image);
    setIsDialogOpen(true);
  };

  // Handle Store Images
  const selectedImagesHandleStore = () => {
    // Add Media Images to Store
    addMedia(selectedImages);
  };

  if (isClient) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Media</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => {
                setUploadImagePopUp(!uploadImagePop);
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
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
          ) : images.length === 0 ? (
            <div className={`flex items-center justify-center ${isMediaPage ? 'h-screen' : 'h-fit'}`}>Sorry, no images.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {images.map((image, index) => {
                const isSelected = selectedImages?.some((img) => img.id === image.id);
                return (
                  <Card
                    key={index}
                    className={`group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer  ${isMediaPage ? '' : selectedImages.some((img) => img.id === image.id) && 'border p-4 border-secondaryDark'} `}
                    onClick={() => (isMediaPage ? handleSelectMedia(image) : handleSelect(image))}
                  >
                    <img src={image?.url} alt={image?.alt_text} className="object-cover transition-all hover:scale-105 w-full h-full" />
                  </Card>
                );
              })}
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
