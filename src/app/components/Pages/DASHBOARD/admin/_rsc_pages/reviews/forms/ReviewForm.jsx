'use client';

import React from 'react';
import { SelectField, SelectField2 } from '../components/SelectField';
import { useForm, useWatch } from 'react-hook-form';
import { Rating } from '@/app/components/Ratings';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
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
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { FormActionButtons } from '@/app/components/Button/FormActionButtons';

const ReviewForm = ({ reviewData = {}, id = '' }) => {
  const { users, isLoading: isLoadingUsers, error: isErrorUser } = useAllUsersAdmin(); // all users
  const { toast } = useToast(); // intialize toaster
  const router = useRouter(); // intialize route

  const ALL_USERS = users?.data?.users ?? []; //destructure users data

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
    formState: { isSubmitting, isValid, isDirty },
  } = form; // destructure form

  // watch itemType
  const watchItemType = useWatch({ control, name: 'item_type' });
  const shouldFetchItems = Boolean(watchItemType);
  const { data: items, isLoading: isLoadingItems, error: isErrorItems } = useSWR(shouldFetchItems ? `/api/admin/reviews/items/${watchItemType}` : null, fetcher); // all items dynamic

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
    <Card className="border-none">
      <CardTitle>{id ? 'Edit Review' : 'Create Review'}</CardTitle>
      <CardDescription>{id ? 'Update the review details below.' : 'Create the review details below.'}</CardDescription>
      <CardContent className="p-0 py-8">
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
                    <FormLabel>Rating</FormLabel>
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
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value} defaultValue={field.value} className="flex gap-4">
                        {REVIEW_STATUS.map((val) => (
                          <FormItem key={val} className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value={val} id={`status-${val}`} />
                            </FormControl>
                            <Label htmlFor={`status-${val}`} className="capitalize cursor-pointer">
                              {val}
                            </Label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Featured Toggle */}
              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured Review</FormLabel>
                      <p className="text-sm text-muted-foreground">Show this review in the featured reviews section on public pages.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Media Component */}
              <MediaComponent />

              <FormActionButtons
                mode={id ? 'update' : 'create'}
                cancelHref="/dashboard/admin/reviews"
                isSubmitting={isSubmitting}
                isDisabled={id ? !isValid || !isDirty || isErrorItems || isErrorUser : !isValid || isErrorItems || isErrorUser}
                containerType="div"
                className="justify-end"
              />
            </fieldset>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ReviewForm;
