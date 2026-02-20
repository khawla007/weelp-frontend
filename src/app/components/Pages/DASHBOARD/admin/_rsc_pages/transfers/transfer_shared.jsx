import * as React from 'react';
import { ArrowLeft, Check, ChevronsUpDown, MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from '@/components/ui/command';
import { useRouter } from 'next/navigation';

export const NavigationTransfer = ({ title, desciption }) => {
  const router = useRouter();
  if (title && desciption) {
    return (
      <div className="flex items-center w-full py-4 gap-2">
        <ArrowLeft onClick={() => router.back()} size={24} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{desciption}</p>
        </div>
      </div>
    );
  }
  return <div className="flex justify-between w-full py-4 font-extrabold"> Props Not Passed </div>;
};

/**
 * Combobox for Single Data Select
 * @returns []
 */
export function ComboboxVendorRoute({ data = [], value, onChange, placeholder = 'Select Location...' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? data.find((item) => item.id === value)?.name : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
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
                  <span className=" capitalize text-center text-xs">
                    {item.name} <br />
                    <span className="text-nowrap text-center">
                      Base Price:{item?.base_price} | Price Per Km :{item?.price_per_km}
                    </span>
                  </span>
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

/**
 * Combobox for Single Data Select For Pricing
 * @returns []
 */
export function ComboboxVendorPricing({ data = [], value, onChange, placeholder = 'Select Location...' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? data.find((item) => item.id === value)?.name : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className=" p-0">
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
                  <span className="capitalize text-center text-xs">
                    {item.name} <br />
                    <span className="text-nowrap text-center">
                      Base Price:{item?.base_price} | Peak: {item?.peak_hour_multiplier}
                    </span>
                  </span>
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

/**
 * Combobox for Single Data Select For Availablity
 * @returns []
 */
export function ComboboxVendorAvailablity({ data = [], value, onChange, placeholder = 'Select Location...' }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
          {value ? data.find((item) => item.id === value)?.date : placeholder}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
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
                  <span className="flex flex-col w-full text-sm text-center">
                    {' '}
                    Date:{item?.date}
                    <span className="text-xs text-gray-500">Start Time: {item?.start_time}</span>
                  </span>

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
