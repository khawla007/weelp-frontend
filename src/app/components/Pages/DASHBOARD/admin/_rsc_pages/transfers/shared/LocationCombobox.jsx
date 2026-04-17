'use client';

import { useState, useCallback, useRef } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandInput, CommandList, CommandItem, CommandGroup, CommandEmpty } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { searchAdminLocations } from '@/lib/services/transferRoutes';

export default function LocationCombobox({ value, onChange, placeholder = 'Search location...', types = 'city,place' }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  const handleInput = useCallback(
    (q) => {
      setQuery(q);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        if (!q.trim()) {
          setResults([]);
          return;
        }
        setLoading(true);
        const data = await searchAdminLocations(q, types, 20);
        setResults(data);
        setLoading(false);
      }, 300);
    },
    [types],
  );

  const handleSelect = (item) => {
    onChange(item);
    setOpen(false);
  };

  const displayLabel = value ? (value.name ? `${value.name}${value.city_name ? `, ${value.city_name}` : ''}` : placeholder) : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between font-normal">
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder={placeholder} value={query} onValueChange={handleInput} />
          <CommandList>
            {loading && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}
            {!loading && query && results.length === 0 && <CommandEmpty>No locations found.</CommandEmpty>}
            {!loading && results.length > 0 && (
              <CommandGroup>
                {results.map((item) => (
                  <CommandItem key={`${item.locatable_type}-${item.locatable_id}`} value={`${item.locatable_type}-${item.locatable_id}`} onSelect={() => handleSelect(item)}>
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate">{item.name}</span>
                      <Badge variant="secondary" className="shrink-0 text-xs capitalize">
                        {item.type}
                      </Badge>
                      {(item.city_name || item.country_name) && <span className="text-muted-foreground text-xs truncate">{[item.city_name, item.country_name].filter(Boolean).join(', ')}</span>}
                    </div>
                    <Check className={cn('ml-2 h-4 w-4 shrink-0', value?.locatable_id === item.locatable_id && value?.locatable_type === item.locatable_type ? 'opacity-100' : 'opacity-0')} />
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
