import React from 'react';
import { Card } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { deleteMediaImageById, updateMediaImage } from '@/lib/actions/media';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';
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

// schema for name
const formSchema = z.object({
  name: z.string().min(3, {
    message: 'Username must be at least 3 characters.',
  }),
  alt_text: z.string().optional(), // alt_text is optional, but if provided, it must be a string
  id: z.number().optional(), // id is also optional and a string
});

export const ImagePreviewForm = ({ isDialogOpen, setIsDialogOpen, selectedImage = {}, mutateMedia }) => {
  const { toast } = useToast();
  console.log(selectedImage);

  const { id = '', name = '', alt_text = '' } = selectedImage;

  // intialize form
  const form = useForm({
    defaultValues: {
      id,
      name,
      alt_text,
    },
    resolver: zodResolver(formSchema),
  });

  const {
    formState: { isSubmitting },
  } = form;
  const onSubmit = async (formData) => {
    try {
      // update iamge
      const res = await updateMediaImage(formData);

      if (res.success) {
        toast({
          title: 'Image Updated Successfully',
        });

        // close dialog
        setIsDialogOpen(!isDialogOpen);
        mutateMedia('/api/dashboard/media'); // trigger fetch
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
        description: error?.message || 'An error occurred while uupdating.',
      });
    }
  };

  // deltee image handle
  const handleDeleteImage = async (id) => {
    try {
      // delete image
      const res = await deleteMediaImageById(id);
      if (!res?.success) {
        return;
      }

      // delete message toast
      toast({
        title: 'Image deleted Successfully',
      });

      // close dialog
      setIsDialogOpen(!isDialogOpen);
      mutateMedia('/api/dashboard/media'); // trigger fetch
    } catch (error) {
      console.log('Error during update:', error?.response || error);
      toast({
        title: 'Updating Failed',
        description: error?.message || 'An error occurred while uupdating.',
      });
    }
  };

  return (
    <div>
      {selectedImage ? (
        <Card className="w-full aspect-video rounded-lg flex flex-col shadow-none border-none">
          <img src={selectedImage?.url} alt={selectedImage?.alt_text} className="w-full h-full object-cover" />

          <Form {...form}>
            <form onSubmit={form?.handleSubmit(onSubmit)} className="space-y-4">
              <fieldset className={`${isSubmitting ? 'cursor-wait' : 'cursor-pointer'}`} disabled={isSubmitting}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="shadcn" {...field} />
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
                        <Input placeholder="shadcn" {...field} />
                      </FormControl>
                      <FormDescription>This is image alt name.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between items-center">
                  <Button type="submit" className="bg-secondaryDark">
                    {isSubmitting ? 'Submitting' : 'Submit'}
                  </Button>

                  {/* Delete Photo */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="border-none">
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
                            handleDeleteImage(id);
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
        </Card>
      ) : (
        <p>No image selected</p>
      )}
    </div>
  );
};
