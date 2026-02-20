import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export const DiscountBlock = ({ title, description, prefix, register, setValue, watch }) => {
  const enabled = watch(`${prefix}.enabled`);

  return (
    <div className="space-y-4 border-b pb-6">
      <div className="flex items-center gap-2">
        <Switch checked={enabled} className="data-[state=checked]:bg-secondaryDark" onCheckedChange={(checked) => setValue(`${prefix}.enabled`, checked)} />

        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {enabled && (
        <div className="space-y-4 ml-8">
          <div>
            <Label>Days Before Start</Label>
            <Input
              placeholder="e.g., 30"
              type="number"
              required={true}
              min={1}
              {...register(`${prefix}.days_before_start`, {
                valueAsNumber: true,
              })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Discount Amount</Label>
              <Input
                placeholder="e.g., 15"
                type="number"
                required={true}
                min={1}
                {...register(`${prefix}.discount_amount`, {
                  valueAsNumber: true,
                })}
              />
            </div>

            <div>
              <Label>Discount Type</Label>
              <Select defaultValue="percentage" onValueChange={(val) => setValue(`${prefix}.discount_type`, val)} value={watch(`${prefix}.discount_type`)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
