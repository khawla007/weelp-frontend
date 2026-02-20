import React from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ComboboxMultiple } from '@/components/ui/combobox_multi';
import { Label } from '@/components/ui/label';
import { useAddOnOptionsAdmin } from '@/hooks/api/admin/addon';

const SmartAddOnMultiSelect = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Fetch add-on options internally
  const { data, error, isLoading } = useAddOnOptionsAdmin();

  const apiData = data?.data || [];

  if (isLoading) return <div className="loader"></div>;
  if (error) return <div className="text-red-400">Error loading add-ons</div>;

  return (
    <div className="space-y-4">
      <Label htmlFor="addons" className="text-base font-bold">
        Select Add On
      </Label>
      <Controller
        control={control}
        name={'addons'}
        rules={{ required: 'Add On Required' }}
        render={({ field: { value, onChange } }) => <ComboboxMultiple id="addons" type="Add On" items={apiData} value={value || []} onChange={onChange} />}
      />

      {/* Error */}
      {errors?.add?.message && <span className="text-red-400 px-2">{errors?.add?.message}</span>}
    </div>
  );
};

export default SmartAddOnMultiSelect;
