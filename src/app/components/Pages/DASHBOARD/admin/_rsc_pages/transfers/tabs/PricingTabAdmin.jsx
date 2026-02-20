import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { SelectInputTransfer2 } from '../components/SelectForm';

const PricingTabAdmin = () => {
  // Form Pricing
  const methods = useFormContext(); // intialize context

  const {
    control,
    register,
    getValues,
    watch,
    formState: { errors },
  } = methods;

  // select currency
  const currency = [
    { label: 'USD', value: 'usd' },
    { label: 'EUR', value: 'eur' },
    { label: 'GBP', value: 'gbp' },
  ];

  // price type
  const priceType = [
    { label: 'Per Person', value: 'per_person' },
    { label: 'Per Vehicle', value: 'per_vehicle' },
  ];

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="py-4">
        <CardTitle className="text-base">Pricing Details</CardTitle>
        <CardDescription className="text-xs">Set up pricing for the transfer service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row">
          {/* Pricing Tier Data */}
          <div className="flex flex-col space-y-4 w-full p-2 border-none">
            <Label htmlFor="base_price">Base Price</Label>
            <Input
              type="number"
              min="1"
              placeholder="Enter Base Price"
              {...register('base_price', {
                required: 'Field Required',
                valueAsNumber: true,
              })}
            />
            {errors?.base_price && <p className="text-red-500 text-sm mt-1">{errors?.base_price?.message}</p>}
          </div>

          {/* Pricing Tier Data */}
          <div className="flex flex-col space-y-4 w-full p-2 border-none">
            <Label htmlFor="currency">Currency</Label>
            <Controller
              control={control}
              rules={{ required: 'Currency Required' }}
              name="currency"
              render={({ field }) => <SelectInputTransfer2 options={currency} onChange={field.onChange} value={field.value} placeholder="Select Currency" />}
            />
            {errors?.currency && <p className="text-red-500 text-sm mt-1">{errors?.currency?.message}</p>}
          </div>
        </div>

        {/* Price Type */}
        <div className="flex flex-col space-y-4 w-full p-2 border-none">
          <Label htmlFor="price_type">Price Type</Label>
          <Controller
            control={control}
            rules={{ required: 'Price Type Required' }}
            name="price_type"
            render={({ field }) => <SelectInputTransfer2 options={priceType} onChange={field.onChange} value={field.value} placeholder="Select Price Type" />}
          />
          {errors?.currency && <p className="text-red-500 text-sm mt-1">{errors?.currency?.message}</p>}
        </div>

        {/* Additional Charges Fields */}
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col space-y-4 w-full p-2 border-none">
            <Label htmlFor="extra_luggage_charge">Extra Luggage Charge</Label>
            <Input type="number" min="0" defaultValue="0" {...register('extra_luggage_charge', { valueAsNumber: true })} />
          </div>

          <div className="flex flex-col space-y-4 w-full p-2 border-none">
            <Label htmlFor="waiting_charge">Waiting Charge</Label>
            <Input type="number" min="0" defaultValue="0" {...register('waiting_charge', { valueAsNumber: true })} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTabAdmin;
