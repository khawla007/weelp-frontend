import React from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';

export default function SmartDropZone({ name, multiple = true }) {
  const { control } = useFormContext();
  const {
    field: { value = [], onChange },
  } = useController({
    name, // name of field
    control,
    defaultValue: [],
  });

  // ✅ useDropzone is at the top level — no rules violation
  const { getRootProps, getInputProps } = useDropzone({
    multiple, // prop multiple
    onDrop: (acceptedFiles) => {
      onChange([...value, ...acceptedFiles]);
    },
  });

  const removeFile = (indexToRemove) => {
    onChange(value.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Card>
      <CardContent {...getRootProps()} className="border-2 border-dashed border-gray-400 p-4 text-center cursor-pointer">
        <input {...getInputProps()} />
        {value.length > 0 ? (
          <ul className="list-none p-0 m-0">
            {value.map((file, index) => (
              <li key={file.path || index} className="flex items-center justify-between text-xs border-b py-1">
                <span>{file.path || file.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent opening file picker
                    removeFile(index);
                  }}
                  className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                >
                  <X size={14} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>Drag & drop files here, or click to select files</p>
        )}
      </CardContent>
    </Card>
  );
}
