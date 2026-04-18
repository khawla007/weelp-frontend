'use client';

import { useCallback, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { searchPublicLocations } from '@/lib/services/locations';

/**
 * Public location combobox used on the /transfers search form.
 * Props:
 *  - value: selected location object or null (shape: { locatable_type, locatable_id, name, city_name, country_name })
 *  - onChange: called with the selected location object
 *  - placeholder: placeholder string
 *  - icon: optional lucide icon component (defaults to MapPin)
 */
export default function LocationComboboxPublic({ value, onChange, placeholder = 'Search city or place…', icon: Icon = MapPin }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleInput = useCallback((q) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await searchPublicLocations(q, 'city,place', 15);
      setResults(data);
      setLoading(false);
    }, 300);
  }, []);

  const handleSelect = (item) => {
    onChange?.({
      locatable_type: item.locatable_type,
      locatable_id: item.locatable_id,
      name: item.name,
      type: item.type,
      city_name: item.city_name,
      country_name: item.country_name,
    });
    setOpen(false);
  };

  const displayLabel = value?.name ? value.name : placeholder;
  const isPlaceholder = !value?.name;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-2 py-[18px] px-4 text-left bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-[#57947d]/40 rounded-xl"
          aria-label={placeholder}
        >
          <Icon className="h-5 w-5 shrink-0 text-[#5a5a5a]" />
          <span className={`truncate text-xs sm:text-sm font-medium ${isPlaceholder ? 'text-[#5a5a5a]' : 'text-[#273f4e]'}`}>{displayLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput autoFocus placeholder={placeholder} value={query} onValueChange={handleInput} />
          <CommandList>
            {loading && <div className="py-6 text-center text-sm text-[#5a5a5a]">Searching...</div>}
            {!loading && query && results.length === 0 && <CommandEmpty>No locations found.</CommandEmpty>}
            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem
                    key={`${item.locatable_type}-${item.locatable_id}`}
                    value={`${item.locatable_type}-${item.locatable_id}`}
                    onSelect={() => handleSelect(item)}
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate text-[#273f4e]">{item.name}</span>
                      {item.type && (
                        <Badge variant="secondary" className="shrink-0 text-[10px] capitalize">
                          {item.type}
                        </Badge>
                      )}
                      {(item.city_name || item.country_name) && (
                        <span className="text-[11px] text-[#5a5a5a] truncate">{[item.city_name, item.country_name].filter(Boolean).join(', ')}</span>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
