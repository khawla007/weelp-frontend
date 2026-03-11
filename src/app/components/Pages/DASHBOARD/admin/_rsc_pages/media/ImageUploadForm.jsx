import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { uploadMedia } from '@/lib/actions/media-client';
import { useToast } from '@/hooks/use-toast';
import { X, FileImage } from 'lucide-react';

// Helper to truncate long filenames
const truncateFileName = (name, maxLength = 20) => {
  if (name.length <= maxLength) return name;
  const ext = name.slice(name.lastIndexOf('.'));
  const baseName = name.slice(0, name.lastIndexOf('.'));
  const truncated = baseName.slice(0, maxLength - ext.length - 3) + '...';
  return truncated + ext;
};

export const UploadImagesForm = ({ uploadImagePop, setUploadImagePopUp, mutateMedia }) => {
  const [files, setFiles] = useState([]); // For TotalFiles
  const [isloading, setLoading] = useState(false); // Any Error
  const { toast } = useToast(); // intialize toast

  // On Drop File
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  // Remove a single file from selection
  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
  };

  // intialize dropzone - no size limit, no file count limit
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'image/png': ['.png'],
      'image/jpeg': ['.jpg', '.jpeg'],
    },
    multiple: true,
  });

  // handle on upload Submit
  const handleSubmitImage = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (files.length === 0 || fileRejections.length > 0) return; // Ensure files are selected

    const formData = new FormData();

    for (const file of files) {
      formData.append('file[]', file);
    }

    // Debug: Log files being uploaded
    console.log(`[Upload] Sending ${files.length} file(s) to backend`);
    // Debug: Log FormData entries
    for (const [key, value] of formData.entries()) {
      console.log(`[Upload] FormData entry: ${key}`, value instanceof File ? value.name : value);
    }

    try {
      const res = await uploadMedia(formData); // uploading files
      if (res.success) {
        toast({
          title: 'Image Uploaded Successfully',
        });
        mutateMedia(); // trigger fetch
      } else {
        toast({
          title: 'Upload Failed',
          variant: 'destructive',
          description: res.error || 'Something went wrong.',
        });
      }

      // close popup on success
      setUploadImagePopUp(false);
      //setloading
      setLoading(false);
    } catch (error) {
      console.log('Error during upload:', error?.response || error);
      toast({
        title: 'Upload Failed',
        variant: 'destructive',
        description: error?.message || 'An error occurred while uploading.',
      });

      //setloading
      setLoading(false);
    }
  };

  // handle on upload cancel
  const handleUploadCancel = () => {
    setUploadImagePopUp(!uploadImagePop);
  };

  // Get input props and ensure multiple attribute is set correctly
  const inputProps = getInputProps();
  // Remove the empty-string multiple property and replace with proper boolean
  const { multiple: _removedMultiple, ...cleanInputProps } = inputProps;

  return (
    <div className="flex flex-col space-y-4">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...cleanInputProps} multiple />

        {/* Rejected Files */}
        {fileRejections.length > 0 &&
          fileRejections.map(({ file, errors }) => (
            <div key={file.path} className="flex items-center gap-2 text-red-600 mt-2">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  {file.path} - {Math.round(file.size / 1024)} KB File
                </p>
                <ul className="ml-4 list-disc text-sm">
                  {errors.map((e) => (
                    <li key={e?.code}>{e?.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}

        <div className="flex flex-col">
          <Button variant="outline" type="button" className={'w-fit'}>
            Choose Images
          </Button>
        </div>
      </div>

      {/* Selected Files Tags */}
      {files.length > 0 && (
        <div className="space-y-2">
          <span className="text-sm font-medium text-muted-foreground">
            {files.length} file{files.length > 1 ? 's' : ''} selected:
          </span>
          <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-2 bg-muted/50 rounded-md">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 bg-background border px-2 py-1 rounded-md text-sm max-w-[180px]"
                title={file.name}
              >
                <FileImage className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <span className="truncate flex-1">{truncateFileName(file.name)}</span>
                {!isloading && (
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`flex gap-4 ${isloading && ' cursor-wait'}`}>
        <Button type="button" className="bg-secondaryDark" onClick={handleSubmitImage} disabled={isloading || files.length === 0 || fileRejections.length > 0}>
          {isloading ? 'Uploading' : 'Upload'}
        </Button>
        {!isloading && (
          <Button type="button" variant="destructive" onClick={handleUploadCancel}>
            Cancel
          </Button>
        )}
      </div>
    </div>
  );
};
