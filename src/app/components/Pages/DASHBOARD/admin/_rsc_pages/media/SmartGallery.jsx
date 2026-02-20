import { Card } from '@/components/ui/card';
import { Trash2, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

export default function SmartGallery({ name, defaultImages = [] }) {
  const { control, setValue } = useFormContext();

  // Watch the field in form
  const images = useWatch({ control, name }) || [];

  // Initialize form field with default images once
  useEffect(() => {
    setValue(name, defaultImages);
  }, [defaultImages, name, setValue]);

  // Remove image handler
  const removeImage = (index) => {
    const updated = images.filter((_, i) => i !== index);
    setValue(name, updated);
  };

  if (!images || images.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-4">
      {images.map((file, index) => (
        <div key={index} className="relative size-24 group border rounded-md">
          <img src={file.url || file.path || file.preview} alt={`gallery-${index}`} className="w-full h-full object-cover rounded-md" />

          <button type="button" onClick={() => removeImage(index)}>
            <Trash2 className="absolute  hidden group-hover:block top-3/4 left-3/4 p-1 -m-2 bg-white text-black border-none rounded-md  size-6 cursor-pointer" size={15} />
          </button>
        </div>
      ))}
    </div>
  );
}
