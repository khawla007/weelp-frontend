import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * @param {Object} props
 * @param {AddOnSelectOption[]} [props.data] - Array of options -> [{label,value}]
 * @param {string} [props.placeholder] - Placeholder text
 * @param {string} [props.value] - Currently selected value
 * @param {(value: string) => void} [props.onChange] - Callback when value changes
 */
export const SelectField = ({ data = [], placeholder = 'Select...', value, onChange }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {data.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
