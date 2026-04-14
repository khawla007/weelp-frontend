'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown, Tags, X, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

/**
 * Frontend Inline Select with Portal positioning
 * Designed for use inside Dialogs where Popover's Portal creates conflicts
 * Uses Portal to render dropdown outside modal's overflow context for proper positioning
 */
export function FrontendInlineSelect({ items, type, value = [], onChange }) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const containerRef = React.useRef(null);
  const buttonRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const scrollContainerRef = React.useRef(null);
  const [dropdownStyle, setDropdownStyle] = React.useState({});

  // Calculate dropdown position when opening
  React.useEffect(() => {
    if (open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownHeight = 280; // Approximate max height of dropdown
      const windowHeight = window.innerHeight;
      const spaceBelow = windowHeight - rect.bottom;
      const spaceAbove = rect.top;

      // Position below button by default, flip to above if not enough space below
      // Using position: fixed, so rect values work directly (no scroll offsets needed)
      let top = rect.bottom + 4;
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        top = rect.top - dropdownHeight - 4;
      }

      setDropdownStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${rect.left}px`,
        width: `${rect.width}px`,
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
          width: `${rect.width}px`,
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

  // Focus search input when dropdown opens
  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus({ preventScroll: true });
    }
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

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) => item.name && item.name.toLowerCase().includes(query));
  }, [items, searchQuery]);

  return (
    <div ref={containerRef}>
      {/* Trigger Button */}
      <Button ref={buttonRef} variant="outline" onClick={() => setOpen(!open)} className="w-full justify-between" type="button">
        {value.length ? (
          <span className="flex items-center text-sm text-black gap-2">
            <Tags size={14} />
            {`${value.length} ${type} Selected`}
          </span>
        ) : (
          `Select ${type}`
        )}
        <ChevronDown className={cn('transition-transform', open ? 'rotate-180' : '')} />
      </Button>

      {/* Dropdown Menu - renders via Portal outside modal's overflow context */}
      {open &&
        createPortal(
          <div data-portal-dropdown style={dropdownStyle} className="pointer-events-auto bg-white border border-gray-200 rounded-md shadow-lg max-h-[280px] overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder={`Search ${type}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {/* Scrollable List */}
            <div ref={scrollContainerRef} className="overflow-y-auto flex-1" style={{ maxHeight: '200px' }}>
              {filteredItems.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">No {type} found.</div>
              ) : (
                <div className="py-1">
                  {filteredItems.map((item) => {
                    const isSelected = value.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item)}
                        className={cn('w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 transition-colors', isSelected ? 'bg-gray-100' : '')}
                      >
                        <span className="flex-1">{item.name}</span>
                        {isSelected && <Check className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
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
                <button type="button" onClick={() => handleRemove(item.id)} className="ml-2">
                  <X size={14} />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
