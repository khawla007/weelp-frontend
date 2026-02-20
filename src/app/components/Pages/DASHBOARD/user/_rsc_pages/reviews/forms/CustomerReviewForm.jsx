'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Rating } from '@/app/components/Ratings';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import SmartDropzone from '../../../../admin/_rsc_pages/media/SmartDropZone';
import SmartGallery from '../../../../admin/_rsc_pages/media/SmartGallery';
import { CUSTOMER_REVIEW_VALUES_DEFAULT } from '@/constants/forms/review';
import { useSWRConfig } from 'swr';
import { useRouter } from 'next/navigation';
import { createReviewByCustomer, editReviewByCustomer } from '@/lib/actions/customer/reviews'; // actions

const CustomerReviewForm = ({ reviewData = {}, onClose }) => {
  const { mutate } = useSWRConfig(); // intialize swr
  const { toast } = useToast(); // intialize toaster

  const review = reviewData?.review ?? false; // check review for action

  // destructure data
  const { item_id } = reviewData;
  const media_gallery = reviewData?.review?.media_gallery ?? []; // get existing images
  const item_type = reviewData?.item?.item_type ?? '';
  const rating = reviewData?.review?.rating ?? '';
  const reviewId = reviewData?.review?.id ?? '';
  const review_text = reviewData?.review?.review_text ?? '';

  // intialize form
  const form = useForm({
    defaultValues: {
      ...CUSTOMER_REVIEW_VALUES_DEFAULT,
      item_type,
      item_id,
      existing_media_ids: media_gallery,
      rating,
      review_text,
    },
    mode: 'onSubmit',
  });

  // destructure form
  const {
    control,
    formState: { isSubmitting },
  } = form;

  // submit form form
  const onSubmit = async (data) => {
    const { existing_media_ids } = data; // existing media map

    // prepare payload
    const payload = {
      ...data,
      existing_media_ids: existing_media_ids?.map((media) => media?.id),
    };

    try {
      // intialize response
      let response;

      // check is edit or create action
      if (review) {
        console.log(payload);
        response = await editReviewByCustomer(payload, reviewId); // action
      } else {
        response = await createReviewByCustomer(payload); // action
      }

      // handle Reponse
      if (response.success) {
        toast({
          title: response.message || 'Submited Succesfully',
          variant: 'default',
        });

        mutate('/api/customer/orders');
        onClose(false); // dialog close
      }
    } catch (error) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className={isSubmitting ? 'cursor-wait space-y-8' : 'cursor-auto space-y-8'}>
          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Rating</FormLabel>
                <FormControl>
                  <Rating value={field.value} max={5} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Review Text */}
          <FormField
            control={form.control}
            name="review_text"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Text</FormLabel>
                <Textarea {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <SmartDropzone name="file" multiple={true} />

          {/* Smart Gallery */}
          <SmartGallery name="existing_media_ids" defaultImages={media_gallery} />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submiting' : 'Submit'}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
};

export const CustomerEditReviewForm = ({ reviewData = {} }) => {
  const { toast } = useToast(); // intialize toaster
  const router = useRouter();

  // destructure data
  const { id: reviewId, item_id, media_gallery = [], item_type = '', rating = '', review_text = '' } = reviewData;

  // intialize form
  const form = useForm({
    defaultValues: {
      ...CUSTOMER_REVIEW_VALUES_DEFAULT,
      item_type,
      item_id,
      existing_media_ids: media_gallery,
      rating,
      review_text,
    },
    mode: 'onSubmit',
  });

  // destructure form
  const {
    control,
    formState: { isSubmitting },
  } = form;

  // submit form form
  const onSubmit = async (data) => {
    const { existing_media_ids } = data; // existing media map

    // prepare payload
    const payload = {
      ...data,
      existing_media_ids: existing_media_ids?.map((media) => media?.id),
    };

    try {
      const response = await editReviewByCustomer(payload, reviewId); // action

      // handle Reponse
      if (response.success) {
        toast({
          title: response.message || 'Submited Succesfully',
          variant: 'default',
        });
        return;
      }
    } catch (error) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className={isSubmitting ? 'cursor-wait space-y-8' : 'cursor-auto space-y-8'}>
          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Rating</FormLabel>
                <FormControl>
                  <Rating value={field.value} max={5} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Review Text */}
          <FormField
            control={form.control}
            name="review_text"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Text</FormLabel>
                <Textarea {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <SmartDropzone name="file" multiple={true} />

          {/* Smart Gallery */}
          <SmartGallery name="existing_media_ids" defaultImages={media_gallery} />

          <div className="flex gap-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submiting' : 'Submit'}
            </Button>

            <Button
              disabled={isSubmitting}
              type="button"
              variant="destructive"
              onClick={() => {
                router.back();
              }}
            >
              Cancel
            </Button>
          </div>
        </fieldset>
      </form>
    </Form>
  );
};
export default CustomerReviewForm;
