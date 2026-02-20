'use client';

import React from 'react';
import { SelectField, SelectField2 } from '../components/SelectField';
import { useForm, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Rating } from '@/app/components/Ratings';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MediaComponent from '../components/MediaComponent';
import useSWR from 'swr';
import { fetcher } from '@/lib/fetchers';
import { createReview, updateReview } from '@/lib/actions/reviews';
import { useToast } from '@/hooks/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FORM_REVIEW_ITEM_TYPE, FORM_REVIEWS_VALUES_DEFAULT, REVIEW_STATUS } from '@/constants/forms/review';
import { useAllUsersAdmin } from '@/hooks/api/admin/users';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';

const ReviewForm = ({ reviewData = {}, id = '' }) => {
  const { users, isLoading: isLoadingUsers, error: isErrorUser } = useAllUsersAdmin(); // all users
  const { toast } = useToast(); // intialize toaster
  const router = useRouter(); // intialize route

  const ALL_USERS = users?.users ?? []; //destructure users data

  // default value in edit
  const user_id = reviewData?.user?.id ?? null;
  const item_type = reviewData?.item?.type || '';
  const item_id = reviewData?.item?.id || null;

  // intialize form
  const form = useForm({
    defaultValues: {
      ...FORM_REVIEWS_VALUES_DEFAULT,
      ...reviewData,
      user_id,
      item_type,
      item_id,
    },
    mode: 'onSubmit',
  });

  const {
    control,
    formState: { isSubmitting },
  } = form; // destructure form

  // watch itemType
  const watchItemType = useWatch({ control, name: 'item_type' });
  const { data: items, isLoading: isLoadingItems, error: isErrorItems } = useSWR(`/api/admin/reviews/items/${watchItemType}`, fetcher); // all items dynamic

  // submit form form
  const onSubmit = async (data) => {
    const payload = {
      ...data,
      media_gallery: data.media_gallery.map((media) => media.media_id || media.id),
    };

    // handle mutation
    try {
      let response;
      if (id) {
        console.log(payload);
        response = await updateReview(id, payload); // action for update reveiw
      } else {
        response = await createReview(payload); // action for create reveiw
      }

      if (response.success) {
        toast({
          title: response.message || 'Submited Succesfully',
          variant: 'default',
        });

        // close route
        router.back();
      }
    } catch (error) {
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <fieldset className={isSubmitting ? 'cursor-wait space-y-8' : 'cursor-auto space-y-8'}>
          {/* Display User */}
          {isLoadingUsers && <span className="loader"></span>}
          {!isLoadingUsers && !isErrorUser && (
            <FormField
              control={form.control}
              name="user_id"
              rules={{ required: 'Field Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select User</FormLabel>
                  <FormControl>
                    <SelectField2 placeholder="Select User" data={[...ALL_USERS]} value={field.value} onChange={(val) => field.onChange(Number(val))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {isErrorUser && <span className="text-red-400">User Api Failed</span>}

          {/* Dynamic Content Type */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="item_type"
              rules={{ required: 'Field Required' }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content type</FormLabel>
                  <FormControl>
                    <SelectField placeholder="Select Content Type" data={FORM_REVIEW_ITEM_TYPE} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dynamic Items */}
            {isLoadingItems && <span className="loader"></span>}
            {!isLoadingItems && !isErrorItems && (
              <FormField
                control={form.control}
                name="item_id"
                rules={{ required: 'Field Required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content Item</FormLabel>
                    <FormControl>
                      <SelectField2 placeholder="Select Item" data={items?.data || []} value={field.value} onChange={(val) => field.onChange(Number(val))} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {isErrorItems && <span className="text-red-400">Content Type Not Selected or Items api failed..</span>}
          </div>

          {/* Rating */}
          <FormField
            control={form.control}
            name="rating"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select User</FormLabel>
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
            defaultValue=""
            render={({ field }) => (
              <FormItem>
                <FormLabel>Review Text</FormLabel>
                <Textarea {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            rules={{ required: 'Field Required' }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <div className="flex gap-4">
                  {REVIEW_STATUS.map((val) => (
                    <FormControl key={val}>
                      <Label htmlFor={val} className="flex items-center space-x-2 capitalize ">
                        <Input id={val} type="radio" value={val} checked={field.value === val} onChange={field.onChange} />
                        <span>{val}</span>
                      </Label>
                    </FormControl>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Media Component */}
          <MediaComponent />

          <Button type="submit" disabled={isErrorItems || isErrorUser || isSubmitting}>
            {isSubmitting ? 'Submiting' : 'Submit'}
          </Button>
        </fieldset>
      </form>
    </Form>
  );
};

export default ReviewForm;
