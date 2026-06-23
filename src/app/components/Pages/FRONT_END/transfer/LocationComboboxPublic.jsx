'use client';

import { useCallback, useRef, useState } from 'react';
import { Command as CommandPrimitive } from 'cmdk';
import { MapPin, Search } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
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
          className="flex w-full items-center gap-2 py-[18px] px-4 text-left bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-weelp-sage-deep/40 rounded-xl"
          aria-label={placeholder}
        >
          <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
          <span className={`truncate text-xs sm:text-sm font-medium ${isPlaceholder ? 'text-muted-foreground' : 'text-foreground'}`}>{displayLabel}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[320px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-background p-0 shadow-[0_8px_24px_rgba(24,24,27,0.12)]"
        align="start"
        sideOffset={4}
      >
        <Command shouldFilter={false} className="rounded-xl">
          <div className="flex h-12 items-center gap-2 border-b border-border px-3">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandPrimitive.Input
              autoFocus
              placeholder={placeholder}
              value={query}
              onValueChange={handleInput}
              className="h-11 w-full bg-transparent text-sm font-medium text-foreground outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              style={{ outline: 'none' }}
            />
          </div>
          <CommandList className="max-h-72">
            {loading && <div className="py-6 text-center text-sm text-muted-foreground">Searching...</div>}
            {!loading && query && results.length === 0 && <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No locations found.</CommandEmpty>}
            {!loading && results.length > 0 && (
              <CommandGroup className="p-1">
                {results.map((item) => (
                  <CommandItem
                    key={`${item.locatable_type}-${item.locatable_id}`}
                    value={`${item.locatable_type}-${item.locatable_id}`}
                    onSelect={() => handleSelect(item)}
                    className="rounded-lg px-3 py-2 data-[selected=true]:bg-muted data-[selected=true]:text-foreground"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="truncate text-foreground">{item.name}</span>
                      {item.type && (
                        <Badge variant="secondary" className="shrink-0 text-[12px] capitalize">
                          {item.type}
                        </Badge>
                      )}
                      {(item.city_name || item.country_name) && <span className="text-[12px] text-muted-foreground truncate">{[item.city_name, item.country_name].filter(Boolean).join(', ')}</span>}
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
