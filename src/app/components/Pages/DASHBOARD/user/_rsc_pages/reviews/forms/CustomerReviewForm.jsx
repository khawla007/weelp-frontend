'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import SmartDropzone from '../../../../admin/_rsc_pages/media/SmartDropZone';
import SmartGallery from '../../../../admin/_rsc_pages/media/SmartGallery';
import { CUSTOMER_REVIEW_VALUES_DEFAULT } from '@/constants/forms/review';
import { useRouter } from 'next/navigation';
import { createReviewByCustomer, editReviewByCustomer } from '@/lib/actions/customer/reviews'; // actions

const RATING_VALUES = [1, 2, 3, 4, 5];

function ReviewRatingInput({ field, ...props }) {
  const selectedRating = Number(field.value);

  return (
    <div role="radiogroup" aria-label="Select rating" className="flex gap-1" {...props}>
      {RATING_VALUES.map((ratingValue) => (
        <label key={ratingValue} className="cursor-pointer rounded-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
          <input
            type="radio"
            className="sr-only"
            name={field.name}
            value={ratingValue}
            checked={selectedRating === ratingValue}
            onBlur={field.onBlur}
            onChange={() => field.onChange(ratingValue)}
            aria-label={`${ratingValue} ${ratingValue === 1 ? 'star' : 'stars'}`}
          />
          <Star className={`size-7 ${ratingValue <= selectedRating ? 'fill-yellow-300 text-yellow-300' : 'text-muted-foreground'}`} aria-hidden="true" />
        </label>
      ))}
    </div>
  );
}

function showResponseErrors(form, response, toast) {
  Object.entries(response?.errors || {}).forEach(([fieldName, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : messages;
    form.setError(fieldName, { type: 'server', message: String(message) });
  });

  toast({
    title: response?.message || 'Something went wrong',
    variant: 'destructive',
  });
}

const CustomerReviewForm = ({ reviewData = {}, onClose, onSaved }) => {
  const { toast } = useToast();

  const review = reviewData?.review ?? false; // check review for action

  // destructure data
  const { id: order_id, item_id } = reviewData;
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
      order_id,
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
      let response;

      // check is edit or create action
      if (review) {
        response = await editReviewByCustomer(payload, reviewId); // action
      } else {
        response = await createReviewByCustomer(payload); // action
      }

      // handle Reponse
      if (response.success) {
        toast({
          title: response.message || 'Submitted successfully',
          variant: 'default',
        });

        onClose?.(false);
        Promise.resolve()
          .then(() => onSaved?.())
          .catch(() => undefined);
      } else {
        showResponseErrors(form, response, toast);
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
                  <ReviewRatingInput field={field} />
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
  const { toast } = useToast();
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
          title: response.message || 'Submitted successfully',
          variant: 'default',
        });
        return;
      }
      showResponseErrors(form, response, toast);
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
                  <ReviewRatingInput field={field} />
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
