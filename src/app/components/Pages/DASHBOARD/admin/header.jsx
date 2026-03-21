'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { Menu, Search, X, ExternalLink, FileText, User, Package, Activity } from 'lucide-react';
import UserMenu from '../UserMenu';
import { searchDashboard } from '@/lib/services/dashboard';
import Link from 'next/link';

/**
 * Admin Header with search functionality
 *
 * Features:
 * - Limited width search input on larger screens
 * - Search icon button for submit action
 * - Keyboard shortcut (Cmd+K / Ctrl+K) to focus search
 * - Clear button when search has value
 * - Live search results dropdown
 */
const AdminHeader = () => {
  const { isMobile, toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  // Keyboard shortcut to focus search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.length >= 2) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const results = await searchDashboard(searchQuery);
          setSearchResults(results);
        } catch (error) {
          console.error('Search error:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  // Get icon based on result type
  const getTypeIcon = (type) => {
    switch (type) {
      case 'order':
        return <FileText size={16} className="text-blue-500" />;
      case 'user':
        return <User size={16} className="text-green-500" />;
      case 'activity':
        return <Activity size={16} className="text-orange-500" />;
      case 'package':
        return <Package size={16} className="text-purple-500" />;
      case 'blog':
        return <FileText size={16} className="text-pink-500" />;
      default:
        return <Search size={16} className="text-gray-500" />;
    }
  };

  // Get badge color based on result type
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'order':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'user':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'activity':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'package':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'blog':
        return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <header className="h-16 border-b bg-white px-4 sticky top-0 z-50">
      <div className="flex h-full items-center sm:justify-between gap-4">
        {isMobile && <Menu className="cursor-pointer" onClick={toggleSidebar} />}

        {/* Search Input - Limited width on larger screens */}
        <div className="w-full max-w-md self-center flex-1 sm:flex-none relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-muted-foreground pointer-events-none" />

            <Input
              ref={searchInputRef}
              type="search"
              placeholder="Search orders, users, activities..."
              className={`w-full pl-9 pr-20 transition-all ${isSearchFocused ? 'ring-2 ring-primary/20' : ''}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => {
                // Delay closing dropdown to allow clicking on results
                setTimeout(() => setIsSearchFocused(false), 200);
              }}
            />

            {/* Search action buttons */}
            <div className="absolute right-1 flex items-center gap-1">
              {/* Loading indicator */}
              {isSearching && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />}

              {/* Keyboard shortcut hint */}
              {!searchQuery && !isSearchFocused && !isSearching && (
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                  <span className="text-xs">⌘</span>K
                </kbd>
              )}

              {/* Clear button when search has value */}
              {searchQuery && !isSearching && (
                <Button type="button" variant="ghost" size="sm" className="h-7 w-7 p-0 hover:bg-muted" onClick={handleClearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Search Results Dropdown */}
          {(isSearchFocused || searchQuery.length >= 2) && searchQuery.length >= 2 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
              {isSearching ? (
                <div className="p-4 text-center text-sm text-muted-foreground">Searching...</div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className="p-2 text-xs text-muted-foreground border-b">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </div>
                  {searchResults.map((result, index) => (
                    <Link
                      key={`${result.type}-${result.id}-${index}`}
                      href={result.url}
                      className="flex items-center gap-3 p-3 hover:bg-muted transition-colors"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      {getTypeIcon(result.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">{result.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeColor(result.type)}`}>{result.type}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                      </div>
                      <ExternalLink size={14} className="text-muted-foreground flex-shrink-0" />
                    </Link>
                  ))}
                </>
              ) : searchQuery.length >= 2 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No results found for &quot;{searchQuery}&quot;</div>
              ) : null}
            </div>
          )}
        </div>

        <div className="flex sm:w-full max-w-fit justify-center items-start">
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
