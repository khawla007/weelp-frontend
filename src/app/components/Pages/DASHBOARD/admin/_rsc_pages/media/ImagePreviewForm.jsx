import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { deleteMediaImageById, updateMediaImage } from '@/lib/actions/media';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
import { formatFileSize } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// schema for name - validation only on submit
const formSchema = z.object({
  name: z.string().transform(val => val || '').refine(
    val => val.length >= 3 || val.length === 0,
    { message: 'Name must be at least 3 characters when provided.' }
  ),
  alt_text: z.string().optional(),
  id: z.number().optional(),
});

export const ImagePreviewForm = ({ isDialogOpen, setIsDialogOpen, selectedImage = {}, mutateMedia }) => {
  const { toast } = useToast();

  const form = useForm({
    defaultValues: {
      id: undefined,
      name: '',
      alt_text: '',
    },
    resolver: zodResolver(formSchema),
    mode: 'onSubmit', // Only validate on submit, not on change
  });

  // Reset form when selectedImage.id changes
  useEffect(() => {
    if (selectedImage?.id) {
      form.reset({
        id: selectedImage.id,
        name: selectedImage.name || '',
        alt_text: selectedImage.alt_text || '',
      });
    }
  }, [selectedImage?.id, form]);

  const {
    formState: { isSubmitting },
  } = form;

  const onSubmit = async (formData) => {
    try {
      const res = await updateMediaImage(formData);

      if (res.success) {
        toast({
          title: 'Image Updated Successfully',
        });
        setIsDialogOpen(false);
        mutateMedia('/api/dashboard/media');
      } else {
        toast({
          title: 'Updating Failed',
          description: res.error || 'Something went wrong.',
        });
      }
    } catch (error) {
      console.log('Error during update:', error?.response || error);
      toast({
        title: 'Updating Failed',
        description: error?.message || 'An error occurred while updating.',
      });
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      const res = await deleteMediaImageById(imageId);
      if (!res?.success) {
        toast({
          title: 'Delete Failed',
          description: res.error || 'Something went wrong.',
        });
        return;
      }

      toast({
        title: 'Image deleted Successfully',
      });
      setIsDialogOpen(false);
      mutateMedia('/api/dashboard/media');
    } catch (error) {
      console.log('Error during delete:', error?.response || error);
      toast({
        title: 'Delete Failed',
        description: error?.message || 'An error occurred while deleting.',
      });
    }
  };

  if (!selectedImage?.url) {
    return <p>No image selected</p>;
  }

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="relative rounded-lg overflow-hidden border">
        <img
          src={selectedImage.url}
          alt={selectedImage.alt_text}
          className="w-full h-auto max-h-[400px] object-contain bg-muted"
        />
        {/* Metadata Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 py-3">
          <div className="flex justify-between items-center text-white text-sm">
            <span className="font-medium">{formatFileSize(selectedImage.file_size)}</span>
            {(selectedImage.width || selectedImage.height) && (
              <span className="text-white/90">
                {selectedImage.width || '?'} × {selectedImage.height || '?'} px
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <fieldset className={isSubmitting ? 'cursor-wait' : 'cursor-pointer'} disabled={isSubmitting}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Image name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="alt_text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alt Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Alt text for image" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center pt-6">
              <Button type="submit" className="bg-secondaryDark">
                {isSubmitting ? 'Submitting' : 'Submit'}
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button type="button" variant="outline" className="border-none">
                    <Trash2 className="text-red-400" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>The Image Will Be Deleted From Library.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-secondaryDark"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDeleteImage(selectedImage.id);
                      }}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </fieldset>
        </form>
      </Form>
    </div>
  );
};
