import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

/**
 * @typedef {Object} SelectOption
 * @property {number} id - The unique ID of the option
 * @property {string} name - The display name of the option
 */

/**
 * SelectInputTransfer Component
 * @param {Object} props
 * @param {SelectOption[]} props.options - Array of options with `id` and `name`
 * @param {any} props.value - Selected value
 * @param {function} props.onChange - Handler on value change
 * @param {string} [props.placeholder] - Placeholder text
 */
export function SelectInputTransfer({ value, onChange, options = [], placeholder = 'Select...' }) {
  const selected = options.find((val) => val.id === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item.id} value={String(item.id)}>
            {item.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * @typedef {Object} SelectOption2
 * @property {string} label - The Label of  option
 * @property {string} value - The value of the option
 */

/**
 * SelectInputTransfer Component
 * @param {Object} props
 * @param {SelectOption2[]} props.options - Array of options with `label` and `value`
 * @param {any} props.value - Selected value
 * @param {function} props.onChange - Handler on value change
 * @param {string} [props.placeholder] - Placeholder text
 */
export function SelectInputTransfer2({ value, onChange, options = [], placeholder = 'Select...' }) {
  const selected = options.find((val) => val.id === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((item) => (
          <SelectItem key={item.label} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
