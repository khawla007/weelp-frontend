'use client';
import React, { useEffect, useState } from 'react';
import { useForm, FormProvider, useFormContext, Controller, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { NavigationOrder } from './orders_shared';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn, generateSlug } from '@/lib/utils';
import { useAllUsersAdmin } from '@/hooks/api/admin/users';
import { useAllActivitiesAdmin } from '@/hooks/api/admin/activities';
import { Combobox } from '@/components/ui/combobox';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select'; // update path based on your setup
import { useAllItinerariesAdmin } from '@/hooks/api/admin/itineraries';
import { useAllPackagesAdmin } from '@/hooks/api/admin/packages';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, Minus, Plus } from 'lucide-react';
import { constructNow, format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { createOrder } from '@/lib/actions/orders';
import { useToast } from '@/hooks/use-toast';

const CreateOrderForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const { toast } = useToast();
  const router = useRouter();

  const methods = useForm({
    defaultValues: {
      user_id: '',
      orderable_type: 'activity',
      orderable_id: '',
      travel_date: '',
      number_of_adults: 1,
      number_of_children: 0,
      status: 'pending',
      payment: {
        payment_status: '',
        payment_method: '',
        total_amount: '',
        is_custom_amount: false,
        custom_amount: '',
      },
      emergency_contact: {
        contact_name: 'John Doe',
        contact_phone: '+1234567890',
        relationship: 'Brother',
      },
    },
  });

  // custom hooks
  const { users = [], isLoading: isLoadingUsers, isValidating: isValidatingUsers, error: userErrors, mutate: mutateUsers } = useAllUsersAdmin(); // users
  const { activities = [], isLoading: isLoadingActivities, isValidating: isValidatingActivities, error: userActivities, mutate: mutateActivities } = useAllActivitiesAdmin(); // activities
  const { itineraries = [], isLoading: isLoadingItineraries, isValidating: isValidatingItineraries, error: itinerariesError, mutate: mutateItineraries } = useAllItinerariesAdmin(); // itineraries
  const { packages = [], isLoading: isLoadingPackages, isValidating: isValidatingPackages, error: packageErrors, mutate: mutatePackages } = useAllPackagesAdmin(); // pacakges

  const allUsers = users?.users || []; // extract users
  const allActivities = activities?.data?.data || []; // extract activities
  const allItineraries = itineraries?.data?.data || []; // extract itineraries
  const allPackages = packages?.data?.data || []; // extract itineraries

  const { formState } = methods; //state
  const { isValid, isSubmitting } = formState; // access property

  // step information
  const steps = [
    { id: 1, title: 'Customer' },
    { id: 2, title: 'Payment Information' },
    { id: 3, title: 'Contact Information' },
  ];

  const CustomerTab = () => {
    const {
      register,
      control,
      getValues,
      watch,
      formState: { errors },
      setValue,
    } = useFormContext();

    // static order type
    const OrderType = [
      { id: 1, name: 'Activity', value: 'activity' },
      { id: 2, name: 'Itinerary', value: 'itinerary' },
      { id: 3, name: 'Holiday Package', value: 'package' },
    ];

    // static status
    const OrderStatus = [
      { id: 1, name: 'Pending', value: 'pending' },
      { id: 2, name: 'Confirmed', value: 'confirmed' },
      { id: 3, name: 'Cancelled', value: 'cancelled' },
    ];

    const watchOrderType = useWatch({ control, name: 'orderable_type' });
    const watchStatusType = useWatch({ control, name: 'status' });
    const watchNumberAdults = useWatch({ control, name: 'number_of_adults' });
    const watchNumberChildren = useWatch({
      control,
      name: 'number_of_children',
    });

    // decrement number
    const handleDecrement = (type) => {
      // check if type hai
      if (!type) {
        return;
      }
      // type adult
      if (type === 'adult') {
        // set value decrement
        if (watchNumberAdults <= 1) return; // prevent to 1
        setValue('number_of_adults', watchNumberAdults - 1);
        return;
      }

      // type children
      if (type === 'children') {
        if (watchNumberChildren <= 0) return;

        setValue('number_of_children', watchNumberChildren - 1);
        return;
      }
    };

    // increment number
    const handleIncrement = (type) => {
      // check if type hai
      if (!type) {
        return;
      }

      // type adult
      if (type === 'adult') {
        // set value increment
        setValue('number_of_adults', watchNumberAdults + 1);
        return;
      }

      // type children
      if (type === 'children') {
        // set value increment
        setValue('number_of_children', watchNumberChildren + 1);
        return;
      }
    };

    return (
      <div className="space-y-4 py-2">
        <div>
          <h3 className="text-base font-semibold text-[#09090B]">Basic Information</h3>
          <span className="text-sm text-[#71717A]">Enter the customer details</span>
        </div>

        {/* Customer  & Order Type */}
        <div className="pb-2 space-x-4 flex flex-col md:flex-row">
          <div className="w-full pb-2 space-y-2">
            <Label htmlFor="user_id" className={`block text-sm font-medium ${errors?.user_id ? 'text-red-400' : 'text-gray-700'}`}>
              Customer
            </Label>
            <Controller
              name="user_id"
              control={control}
              rules={{ required: 'Field Required' }}
              render={({ field }) => <Combobox placeholder="Select Customer" value={field.value} onChange={field.onChange} data={allUsers} />}
            />
            {errors?.user_id && <p className="text-red-500 text-sm mt-1">{errors?.user_id?.message}</p>}
          </div>

          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="orderable_type" className={`block text-sm font-medium ${errors?.orderable_type ? 'text-red-400' : 'text-black'}`}>
              Order Type
            </Label>
            <Controller
              name="orderable_type"
              control={control}
              rules={{ required: 'Select Order Type' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Order Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {OrderType.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.orderable_type && <p className="text-red-500 text-sm mt-1">{errors?.orderable_type?.message}</p>}
          </div>
        </div>

        {/* Selection */}
        <div className="pb-2 space-y-2">
          {/* Condition Based Rendering */}
          {/* For Activity */}
          {watchOrderType === 'activity' && (
            <Label htmlFor="orderable_id" className={`flex flex-col gap-2 text-sm space-y-4 font-medium  ${errors?.orderable_id ? 'text-red-400' : 'text-gray-700'}`}>
              Activity
              <Controller
                name="orderable_id"
                control={control}
                rules={{ required: 'Field Required' }}
                render={({ field }) => <Combobox placeholder="Select Activity" value={field.value} onChange={field.onChange} data={allActivities} />}
              />
            </Label>
          )}

          {/* For Transfer */}
          {watchOrderType === 'itinerary' && (
            <Label htmlFor="orderable_id" className={`flex flex-col gap-2 text-sm space-y-4 font-medium  ${errors?.orderable_id ? 'text-red-400' : 'text-gray-700'}`}>
              Itinerary
              <Controller
                name="orderable_id"
                control={control}
                rules={{ required: 'Field Required' }}
                render={({ field }) => <Combobox placeholder="Select Itinerary" value={field.value} onChange={field.onChange} data={allItineraries} />}
              />
            </Label>
          )}

          {/* For Package */}
          {watchOrderType === 'package' && (
            <Label htmlFor="orderable_id" className={`flex flex-col gap-2 text-sm space-y-4 font-medium  ${errors?.orderable_id ? 'text-red-400' : 'text-gray-700'}`}>
              Package
              <Controller
                name="orderable_id"
                control={control}
                rules={{ required: 'Field Required' }}
                render={({ field }) => <Combobox placeholder="Select Package" value={field.value} onChange={field.onChange} data={allPackages} />}
              />
            </Label>
          )}

          {errors?.orderable_id && <p className="text-red-500 text-sm mt-1">{errors.orderable_id.message}</p>}
        </div>

        {/* Date Selection */}
        <div className="pb-2 space-x-4 flex flex-col md:flex-row">
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="travel_date" className={`block text-sm font-medium ${errors?.travel_date ? 'text-red-400' : 'text-gray-700'}`}>
              Travel Date
            </Label>
            <Controller
              control={control}
              name="travel_date"
              rules={{ required: 'Date Required' }}
              render={({ field }) => {
                return (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant={'outline'} className={cn('w-full justify-start text-left font-normal', !field.value && 'text-muted-foreground')}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, 'yyyy-MM-dd') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value ? new Date(field.value) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'yyyy-MM-dd')); // format before storing
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                );
              }}
            />
            {errors?.travel_date && <p className="text-red-500 text-sm mt-1">{errors.travel_date.message}</p>}
          </div>

          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="preferred_time" className={`block text-sm font-medium ${errors?.preferred_time ? 'text-red-400' : 'text-gray-700'}`}>
              Preferred Time
            </Label>
            <Input
              type="time"
              id="preferred_time"
              {...register('preferred_time', {
                required: 'Time Required',
                onBlur: (e) => {
                  const value = e.target.value; // e.g., "14:30"
                  if (value) {
                    console.log(value);
                    const formatted = `${value}:00`; // → "14:30:00"
                    setValue('preferred_time', formatted);
                  }
                },
              })}
            />

            {errors?.preferred_time && <p className="text-red-500 text-sm mt-1">{errors?.preferred_time?.message}</p>}
          </div>
        </div>

        {/* Adults & Children  */}
        <div className="flex items-center space-x-2 flex-col md:flex-row">
          {/* Adults */}
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="number_of_adults" className="text-sm font-medium text-gray-700 flex flex-col gap-2">
              Number of Adults
              <div className="flex gap-2">
                <Minus className="text-lg size-10 p-2 border rounded-md " onClick={() => handleDecrement('adult')} />

                <Input type="number" min={1} id="number_of_adults" className="w-full" {...register('number_of_adults', { valueAsNumber: true })} />
                <Plus className="text-lg size-10 p-2 border rounded-md " onClick={() => handleIncrement('adult')} />
              </div>
            </Label>
          </div>

          {/* Children */}
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="number_of_children" className="text-sm font-medium text-gray-700 flex flex-col gap-2">
              Number of Children
              <div className="flex gap-2">
                <Minus className="text-lg size-10 p-2 border rounded-md " onClick={() => handleDecrement('children')} />
                <Input type="number" min={0} id="number_of_children" className="w-full" {...register('number_of_children', { valueAsNumber: true })} />
                <Plus className="text-lg size-10 p-2 border rounded-md " onClick={() => handleIncrement('children')} />
              </div>
            </Label>
          </div>
        </div>

        {/* Status  */}
        <div className="pb-2 space-y-2 w-full">
          <Label htmlFor="status" className={`block text-sm font-medium ${errors?.status ? 'text-red-400' : 'text-black'}`}>
            Status
          </Label>
          <Controller
            name="status"
            control={control}
            rules={{ required: 'Select an order status' }}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={field.onChange}
                onBlur={field.onBlur} // Optional, but good for validation triggering
              >
                <SelectTrigger aria-label="Order Status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {OrderStatus.map((status) => (
                    <SelectItem key={status.id} value={status.value}>
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors?.status && <p className="text-red-500 text-sm mt-1">{errors?.status?.message}</p>}
        </div>

        {/* Specia requirements  */}
        <div className="pb-2 space-y-2 w-full">
          <Label htmlFor="special_requirements" className={`block text-sm font-medium ${errors?.special_requirements ? 'text-red-400' : 'text-black'}`}>
            Special Requirements
          </Label>
          <Textarea
            id="special_requirements"
            {...register('special_requirements', {
              required: 'Field Required',
            })}
          />
          {errors?.special_requirements && <p className="text-red-500 text-sm mt-1">{errors?.special_requirements?.message}</p>}
        </div>
      </div>
    );
  };

  const PaymentInformationTab = () => {
    const {
      register,
      control,
      getValues,
      watch,
      formState: { errors },
      setValue,
    } = useFormContext();

    // static method type
    const PaymentMethod = [
      { id: 1, name: 'Credit Card', value: 'credit_card' },
      { id: 2, name: 'Debit Card', value: 'debit_card' },
      { id: 3, name: 'Bank Transfer', value: 'bank_transfer' },
      { id: 4, name: 'Cash', value: 'cash' },
    ];

    // static status
    const PaymentStatus = [
      { id: 1, name: 'Partial', value: 'partial' },
      { id: 2, name: 'Pending', value: 'pending' },
      { id: 3, name: 'Paid', value: 'paid' },
      { id: 4, name: 'Refunded', value: 'refunded' },
    ];

    const watchedCustomAmount = useWatch({
      control,
      name: 'payment.is_custom_amount',
    }); //watched switch custom amount

    //check if is enabled custom amount switch
    useEffect(() => {
      if (!watchedCustomAmount) {
        setValue('payment.custom_amount', '');
      }
    }, [watchedCustomAmount]);

    return (
      <div className="space-y-4 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#09090B]">Payment Information</h3>
          <span className="text-sm text-[#71717A]">Enter the customer payment details</span>
        </div>

        <div className="pb-2 space-x-4 flex flex-col md:flex-row">
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="payment.payment_status" className={`block text-sm font-medium ${errors?.payment?.payment_status ? 'text-red-400' : 'text-black'}`}>
              Payment Status
            </Label>
            <Controller
              name="payment.payment_status"
              control={control}
              rules={{ required: 'Select Payment Type' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {PaymentStatus.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.payment?.payment_status && <p className="text-red-500 text-sm mt-1">{errors?.payment?.payment_status?.message}</p>}
          </div>

          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="payment.payment_method" className={`block text-sm font-medium ${errors?.payment?.payment_method ? 'text-red-400' : 'text-black'}`}>
              Payment Method
            </Label>
            <Controller
              name="payment.payment_method"
              control={control}
              rules={{ required: 'Select Payment Method' }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PaymentMethod.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors?.payment?.payment_method && <p className="text-red-500 text-sm mt-1">{errors?.payment?.payment_method?.message}</p>}
          </div>
        </div>

        {/* Payment Information Row */}
        <div className="pb-2 space-x-4 flex flex-col md:flex-row">
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="payment.total_amount" className={`block text-sm font-medium ${errors?.payment?.total_amount ? 'text-red-400' : 'text-black'}`}>
              Total Amount
            </Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter Amount"
              {...register('payment.total_amount', {
                required: 'Field Required',
                valueAsNumber: true,
              })}
            />
            {errors?.payment?.total_amount && <p className="text-red-500 text-sm mt-1">{errors?.payment?.total_amount?.message}</p>}
          </div>

          {/* Switches Row */}
          <div className="flex items-center space-x-2 w-full">
            <Label id="payment.is_custom_amount" className="text-sm font-medium text-gray-700">
              Custom Amount
            </Label>
            <Controller
              name="payment.is_custom_amount"
              control={control}
              render={({ field }) => (
                <Switch
                  id="payment.is_custom_amount"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="group relative inline-flex h-6 w-11 items-center rounded-full transition bg-gray-300 data-[state=checked]:bg-secondaryDark"
                >
                  <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition-transform group-data-[state=checked]:translate-x-5" />
                </Switch>
              )}
            />
          </div>
        </div>

        {/* Custom Amount condition based */}
        {watchedCustomAmount && (
          <div className="flex items-center  space-x-2 w-full">
            <Label htmlFor="payment.custom_amount" className={` text-sm font-medium w-full flex flex-col gap-2  ${errors?.payment?.custom_amount ? 'text-red-400' : 'text-black'}`}>
              Custom Amount
              <Input
                type="number"
                min="1"
                placeholder="Enter Amount"
                {...register('payment.custom_amount', {
                  required: 'Amount Required Required',
                  valueAsNumber: true,
                })}
              />
              {errors?.payment?.custom_amount && <p className="text-red-500 text-sm mt-1">{errors?.payment?.custom_amount?.message}</p>}
            </Label>
          </div>
        )}
      </div>
    );
  };

  const ContactInformationTab = () => {
    const {
      register,
      control,
      getValues,
      watch,
      formState: { errors },
      setValue,
    } = useFormContext();

    return (
      <div className="space-y-4 py-4">
        <div>
          <h3 className="text-base font-semibold text-[#09090B]">Emergency Contact</h3>
          <span className="text-sm text-[#71717A]">Add Emergency Contact Information</span>
        </div>

        {/* Payment Information Row */}
        <div className="pb-2 space-x-4 flex flex-col items-center">
          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="emergency_contact.contact_name" className={`block text-sm font-medium ${errors?.emergency_contact?.contact_name ? 'text-red-400' : 'text-black'}`}>
              Contact Name
            </Label>
            <Input
              id="emergency_contact.contact_name"
              type="text"
              placeholder="Enter Emergency Contact Name"
              {...register('emergency_contact.contact_name', {
                required: 'Contact Name Required',
              })}
            />
            {errors?.emergency_contact?.contact_name && <p className="text-red-500 text-sm mt-1">{errors?.emergency_contact?.contact_name?.message}</p>}
          </div>

          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="emergency_contact.contact_phone" className={`block text-sm font-medium ${errors?.emergency_contact?.contact_phone ? 'text-red-400' : 'text-black'}`}>
              Contact Phone
            </Label>
            <Input
              id="emergency_contact.contact_phone"
              type="number"
              min="1"
              placeholder="Enter Emergency Contact Phone"
              {...register('emergency_contact.contact_phone', {
                required: 'Phone Number Required',
              })}
            />
            {errors?.emergency_contact?.contact_name && <p className="text-red-500 text-sm mt-1">{errors?.emergency_contact?.contact_name?.message}</p>}
          </div>

          <div className="pb-2 space-y-2 w-full">
            <Label htmlFor="emergency_contact.relationship" className={`block text-sm font-medium ${errors?.emergency_contact?.relationship ? 'text-red-400' : 'text-black'}`}>
              Relationship
            </Label>
            <Input
              id="emergency_contact.relationship"
              type="text"
              placeholder="Enter Relationsihp to customer"
              {...register('emergency_contact.relationship', {
                required: 'Field Required',
              })}
            />
            {errors?.emergency_contact?.relationship && <p className="text-red-500 text-sm mt-1">{errors?.emergency_contact?.relationship?.message}</p>}
          </div>
        </div>
      </div>
    );
  };

  // redering step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <CustomerTab />;
      case 2:
        return <PaymentInformationTab />;
      case 3:
        return <ContactInformationTab />;
      case 4:
        return;
    }
  };

  // on handle submit
  const onSubmit = async (data) => {
    //  prevent user from submit
    if (currentStep < 3) {
      // Go to next step
      setCurrentStep((prev) => prev + 1);
      return;
    }

    // Final step: submit the form
    try {
      const res = await createOrder(data);
      if (res.success) {
        toast({ title: res.message || 'Data submitted successfully' });

        // Optionally reset or show success message
        router.back();
      } else {
        toast({ title: 'Please Try Again', variant: 'destructive' });
      }
    } catch (error) {
      // Optionally show an error message to the user
      toast({ title: 'Something went wrong', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 py-4 sm:px-6 lg:px-8">
      <NavigationOrder title="New Order" desciption="Create a new order" />

      <div className="w-full mx-auto space-y-4 rounded-lg  ">
        <div className="w-full">
          <ul className="w-fit flex justify-between items-center flex-wrap sm:flex-nowrap">
            {steps &&
              steps.map((step) => (
                <li
                  key={step.id}
                  className={`flex flex-col items-center w-full space-y-1 cursor-pointer group relative p-4 duration-300 ease-in-out group hover:bg-gray-100 ${currentStep == step?.id && ' bg-gradient-to-t from-[#c7ffc02e] to-slate-50 border-b-secondaryDark border-b-2'}`}
                >
                  <div
                    className={`text-sm font-medium pt-2 w-full text-nowrap duration-300 ease-in-out ${!currentStep == step?.id && ' group-hover:text-gray-800'} ${currentStep == step?.id ? 'text-secondaryDark ' : 'text-grayDark'}`}
                  >
                    {step.title}
                  </div>
                </li>
              ))}
          </ul>
          <Separator className="" />
        </div>

        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4 w-full  bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <fieldset className={`space-y-6 ${isSubmitting && ' cursor-wait'}`} disabled={isSubmitting}>
              {renderStep()}

              <div className="flex justify-between pt-4 ">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Previous
                  </Button>
                )}

                {/* Display Cancel Button */}
                {currentStep < 2 && (
                  <Button
                    type="button"
                    onClick={() => {
                      router.back();
                    }}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </Button>
                )}

                <div className="flex gap-4">
                  {/* Display Cancel Button */}
                  {currentStep === 3 && (
                    <Button
                      type="button"
                      onClick={() => {
                        router.back();
                      }}
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Cancel
                    </Button>
                  )}

                  <Button
                    type="submit"
                    onClick={() => {
                      isValid && currentStep < 3 && setCurrentStep(currentStep + 1);
                    }}
                    disabled={isSubmitting}
                    className={`ml-auto py-2 px-4 shadow-sm text-sm font-medium rounded-md text-white bg-secondaryDark cursor-pointer`}
                  >
                    {isSubmitting ? (currentStep === 3 ? 'Submitting...' : 'Submit') : currentStep === 3 ? 'Submit' : 'Next'}
                  </Button>
                </div>
              </div>
            </fieldset>
          </form>
        </FormProvider>
      </div>
    </div>
  );
};

export default CreateOrderForm;
