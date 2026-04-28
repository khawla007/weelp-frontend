import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Controller, useFormContext } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { SelectInputTransfer2 } from '../components/SelectForm';

const currency = [
  { label: 'USD', value: 'USD' },
  { label: 'EUR', value: 'EUR' },
  { label: 'INR', value: 'INR' },
  { label: 'AED', value: 'AED' },
  { label: 'GBP', value: 'GBP' },
];

const priceType = [
  { label: 'Per Person', value: 'per_person' },
  { label: 'Per Vehicle', value: 'per_vehicle' },
];

const PricingTabAdmin = () => {
  const methods = useFormContext();
  const {
    register,
    control,
    formState: { errors },
  } = methods;

  return (
    <Card className="border-none shadow-none">
      <CardHeader className="py-4">
        <CardTitle className="text-base">Pricing Details</CardTitle>
        <CardDescription className="text-xs">Set up pricing for the transfer service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col space-y-2 w-full p-2 border-none">
            <Label htmlFor="transfer_price" className={errors?.transfer_price ? 'text-red-400' : 'text-black'}>
              Transfer Price <span className="text-red-500">*</span>
            </Label>
            <Input type="number" min="0" id="transfer_price" {...register('transfer_price', { required: 'Transfer price is required', valueAsNumber: true })} />
            {errors?.transfer_price && <p className="text-red-500 text-sm mt-1">{errors.transfer_price.message}</p>}
          </div>

          <div className="flex flex-col space-y-2 w-full p-2 border-none">
            <Label htmlFor="currency" className={errors?.currency ? 'text-red-400' : 'text-black'}>
              Currency <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="currency"
              control={control}
              rules={{ required: 'Currency is required' }}
              render={({ field }) => <SelectInputTransfer2 placeholder="Select Currency" options={currency} value={field.value} onChange={field.onChange} />}
            />
            {errors?.currency && <p className="text-red-500 text-sm mt-1">{errors.currency.message}</p>}
          </div>
        </div>

        <div className="flex flex-col space-y-2 w-full p-2 border-none">
          <Label htmlFor="price_type" className={errors?.price_type ? 'text-red-400' : 'text-black'}>
            Price Type <span className="text-red-500">*</span>
          </Label>
          <Controller
            name="price_type"
            control={control}
            rules={{ required: 'Price type is required' }}
            render={({ field }) => <SelectInputTransfer2 placeholder="Select Price Type" options={priceType} value={field.value} onChange={field.onChange} />}
          />
          {errors?.price_type && <p className="text-red-500 text-sm mt-1">{errors.price_type.message}</p>}
        </div>

        <div className="flex flex-col sm:flex-row">
          <div className="flex flex-col space-y-4 w-full p-2 border-none">
            <Label htmlFor="extra_luggage_charge">Per-Bag Luggage Rate</Label>
            <Input type="number" min="0" step="0.01" defaultValue="0" {...register('extra_luggage_charge', { valueAsNumber: true })} />
            <p className="text-xs text-[#5a5a5a]">Charged per extra bag selected by the customer.</p>
          </div>

          <div className="flex flex-col space-y-4 w-full p-2 border-none">
            <Label htmlFor="waiting_charge">Per-Minute Waiting Rate</Label>
            <Input type="number" min="0" step="0.01" defaultValue="0" {...register('waiting_charge', { valueAsNumber: true })} />
            <p className="text-xs text-[#5a5a5a]">Charged per minute of waiting requested by the customer.</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PricingTabAdmin;
