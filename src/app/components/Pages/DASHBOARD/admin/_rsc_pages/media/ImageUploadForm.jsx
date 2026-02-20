import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useDropzone } from 'react-dropzone';
import { uploadMedia } from '@/lib/actions/media';
import { useToast } from '@/hooks/use-toast';

export const UploadImagesForm = ({ uploadImagePop, setUploadImagePopUp, mutateMedia }) => {
  const [files, setFiles] = useState([]); // For TotalFiles
  const [isloading, setLoading] = useState(false); // Any Error
  const { toast } = useToast(); // intialize toast

  // On Drop File
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
  }, []);

  const maxSize = 500 * 1024; //500kb

  // intialize dropzone
  const { getRootProps, getInputProps, fileRejections } = useDropzone({
    onDrop,
    maxSize,
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
      setUploadImagePopUp(!uploadImagePop);
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

  return (
    <div className="flex flex-col space-y-4">
      <div {...getRootProps()} className="cursor-pointer">
        <input {...getInputProps()} />

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
          <span className="text-sm font-bold">Max File Size 500KB {files?.length > 0 && <b>: {files?.length} File</b>}</span>
          <Button variant="outline" type="button" className={'w-fit'}>
            Choose Images
          </Button>
        </div>
      </div>

      <div className={`flex gap-4 ${isloading && ' cursor-wait'}`}>
        <Button type="submit" className="bg-secondaryDark" onClick={handleSubmitImage} disabled={isloading || files.length === 0 || fileRejections.length > 0}>
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
