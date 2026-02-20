import * as React from 'react';
import { Check, ChevronsUpDown, Tags, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * Combobox Multiple Data Select  **Individual**
 */
export function ComboboxMultipleAttribute({ attributes, value = [], onChange }) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (attrId, attrValue) => {
    const exists = value.some((s) => s.attribute_id === attrId && s.attribute_value === attrValue);

    const newSelection = exists ? value.filter((s) => !(s.attribute_id === attrId && s.attribute_value === attrValue)) : [...value, { attribute_id: attrId, attribute_value: attrValue }];

    onChange(newSelection);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {(value || []).length > 0 ? (
            <span className="flex items-center gap-2">
              <Tags size={14} />
              {(value || []).length} Attributes Selected
            </span>
          ) : (
            'Select attributes...'
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 h-[150px]">
        <Command>
          <CommandInput placeholder="Search attributes..." className="h-9" />
          <CommandList>
            <CommandEmpty>No attributes found.</CommandEmpty>
            {attributes.map((attr) => (
              <CommandGroup key={attr.id} heading={attr.name}>
                {attr.values.split(',').map((attrValue) => {
                  const trimmedValue = attrValue.trim();
                  const isSelected = value.some((s) => s.attribute_id === attr.id && s.attribute_value === trimmedValue);

                  return (
                    <CommandItem key={`${attr.id}-${trimmedValue}`} value={trimmedValue} onSelect={() => handleSelect(attr.id, trimmedValue)}>
                      {trimmedValue}
                      <Check className={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

/**
 * Combobox Multiple Select **Same Pattern data**
 */
export function ComboboxMultiple({ items, type, value = [], onChange }) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (item) => {
    const isSelected = value.includes(item.id);
    const newValue = isSelected ? value.filter((id) => id !== item.id) : [...value, item.id];

    onChange(newValue);
  };

  const handleRemove = (id) => {
    onChange(value.filter((selectedId) => selectedId !== id));
  };

  return (
    <div>
      {/* Popover for selecting tags */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {value.length ? (
              <span className="flex items-center text-sm text-black gap-2">
                <Tags size={14} />
                {`${value.length} ${type} Selected`}
              </span>
            ) : (
              `Select ${type}`
            )}
            <ChevronsUpDown className="opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 h-[150px]">
          <Command>
            <CommandInput placeholder={`Search ${type}... `} className="h-9" />
            <CommandList>
              <CommandEmpty>No tags found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => {
                  const isSelected = value.includes(item.id);
                  return (
                    <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                      {item.name}
                      <Check className={`ml-auto ${isSelected ? 'opacity-100' : 'opacity-0'}`} />
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 w-full">
          {items
            .filter((item) => value.includes(item.id))
            .map((item) => (
              <div key={item.id} className="flex items-center text-sm text-grayDark font-bold bg-[#f2f2f2] gap-2  px-2 py-1 rounded-lg hover:scale-110 duration-100 ease-linear">
                <span>{item.name}</span>
                <button onClick={() => handleRemove(item.id)} className="ml-2">
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
