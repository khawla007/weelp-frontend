import * as React from 'react';
import { Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';

/**
 * Combobox for Single Data Select
 * @returns []
 */
export function Combobox({ data = [], value, onChange, placeholder = 'Select Location...' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? data.find((item) => item.id === value)?.name : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandGroup>
              {data.map((item) => (
                <CommandItem
                  key={item.id}
                  value={String(item.id)} // Ensure it's a string
                  onSelect={() => {
                    onChange(item.id); // Now storing city ID
                    setOpen(false);
                  }}
                >
                  {item.name}
                  <Check className={cn('ml-auto', value === item.id ? 'opacity-100' : 'opacity-0')} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
