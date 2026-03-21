import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * @typedef {Object} SelectOption
 * @property {number} id - The unique ID of the option
 * @property {string} name - The display name of the option
 */

/**
 * SelectInputTransfer Component - Searchable combobox for places
 * @param {Object} props
 * @param {SelectOption[]} props.options - Array of options with `id` and `name`
 * @param {any} props.value - Selected value
 * @param {function} props.onChange - Handler on value change
 * @param {string} [props.placeholder] - Placeholder text
 */
export function SelectInputTransfer({ value, onChange, options = [], placeholder = 'Select...' }) {
  const [open, setOpen] = useState(false);
  const selected = options.find((val) => String(val.id) === String(value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          {selected ? selected.name : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search place..." />
          <CommandList>
            <CommandEmpty>No place found.</CommandEmpty>
            <CommandGroup>
              {options.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(String(item.id));
                    setOpen(false);
                  }}
                >
                  {item.name}
                  <Check className={cn('ml-auto h-4 w-4', String(value) === String(item.id) ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
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
