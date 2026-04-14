'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronsUpDown, Tags, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';

/**
 * Frontend Combobox Multiple Select with Portal positioning
 * Designed for public-facing pages (explore, etc.)
 * Uses Portal to render dropdown outside any overflow context for proper positioning
 */
export function FrontendCombobox({ items, type, value = [], onChange }) {
  const [open, setOpen] = React.useState(false);
  const buttonRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);
  const [dropdownStyle, setDropdownStyle] = React.useState({});

  // Calculate dropdown position when opening
  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 280;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Using position: fixed, so rect values work directly (no scroll offsets needed)
      let top = rect.bottom + 4;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${Math.min(rect.width, 300)}px`,
        zIndex: 9999,
      });
    }
  }, [open]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target) && !event.target.closest('[data-portal-dropdown]')) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open]);

  // Update position on scroll/resize
  React.useEffect(() => {
    if (!open) return;

    const handleUpdatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const dropdownHeight = 280;
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;

        // Using position: fixed, so rect values work directly (no scroll offsets needed)
        let top = rect.bottom + 4;
        if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
          top = rect.top - dropdownHeight - 4;
        }

        setDropdownStyle({
          position: 'fixed',
          top: `${top}px`,
          left: `${rect.left}px`,
          width: `${Math.min(rect.width, 300)}px`,
          zIndex: 9999,
        });
      }
    };

    window.addEventListener('scroll', handleUpdatePosition, true);
    window.addEventListener('resize', handleUpdatePosition);

    return () => {
      window.removeEventListener('scroll', handleUpdatePosition, true);
      window.removeEventListener('resize', handleUpdatePosition);
    };
  }, [open]);

  // Handle wheel events for dropdown scrolling (works around Dialog wheel event capture)
  React.useEffect(() => {
    if (!open || !scrollContainerRef.current) return;

    const scrollContainer = scrollContainerRef.current;
    const dropdown = document.querySelector('[data-portal-dropdown]');

    if (!dropdown) return;

    const handleWheel = (e) => {
      // Only handle wheel events that target the dropdown
      if (!dropdown.contains(e.target)) return;

      // Prevent default to stop page/body scrolling
      e.preventDefault();
      e.stopPropagation();

      // Scroll the container manually
      scrollContainer.scrollTop += e.deltaY;
    };

    // Add wheel event listener to the dropdown (not just scroll container)
    // Use capture phase to intercept before it reaches the body
    dropdown.addEventListener('wheel', handleWheel, { passive: false, capture: true });

    return () => {
      dropdown.removeEventListener('wheel', handleWheel, { capture: true });
    };
  }, [open]);

  const handleSelect = (item) => {
    const isSelected = value.includes(item.id);
    const newValue = isSelected ? value.filter((id) => id !== item.id) : [...value, item.id];
    onChange(newValue);
  };

  const handleRemove = (id) => {
    onChange(value.filter((selectedId) => selectedId !== id));
  };

  return (
    <div ref={containerRef}>
      {/* Trigger Button */}
      <Button ref={buttonRef} variant="outline" role="combobox" aria-expanded={open} onClick={() => setOpen(!open)} className="w-full justify-between" type="button">
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

      {/* Dropdown Menu - renders via Portal outside any overflow context */}
      {open &&
        createPortal(
          <div data-portal-dropdown style={dropdownStyle} className="pointer-events-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-[280px] overflow-hidden">
            <Command className="pointer-events-auto flex flex-col h-full">
              <CommandInput placeholder={`Search ${type}...`} className="h-9" />
              <div ref={scrollContainerRef} className="overflow-y-auto flex-1" style={{ maxHeight: '250px' }}>
                <CommandList className="overflow-visible">
                  <CommandEmpty>No {type} found.</CommandEmpty>
                  <CommandGroup>
                    {items.map((item) => {
                      const isSelected = value.includes(item.id);
                      return (
                        <CommandItem key={item.id} value={item.name} onSelect={() => handleSelect(item)}>
                          {item.name}
                          <Check className={cn('ml-auto', isSelected ? 'opacity-100' : 'opacity-0')} />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </div>
            </Command>
          </div>,
          document.body,
        )}

      {/* Selected Tags */}
      {value.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 w-full">
          {items
            .filter((item) => value.includes(item.id))
            .map((item) => (
              <div key={item.id} className="flex items-center text-sm text-grayDark font-bold bg-[#f2f2f2] gap-2 px-2 py-1 rounded-lg hover:scale-110 duration-100 ease-linear">
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
