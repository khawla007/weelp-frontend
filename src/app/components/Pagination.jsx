import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export const CustomPagination = ({
  totalItems = 0,
  itemsPerPage = 0,
  currentPage = 1,
  onPageChange,
  className = '',
  controlsClassName = '',
  controlClassName = 'h-9 px-3',
  inputClassName = 'h-9 w-16',
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const [inputPage, setInputPage] = useState(currentPage);

  // Reset input when currentPage changes externally
  useEffect(() => {
    setInputPage(currentPage);
  }, [currentPage]);

  // Handle page input with Enter key
  const handleInputSubmit = (e) => {
    e.preventDefault();
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    } else {
      setInputPage(currentPage); // Reset to current page if invalid
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const value = e.target.value;
    // Allow only positive numbers
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 1)) {
      setInputPage(value);
    }
  };

  // Handle blur - validate and navigate
  const handleInputBlur = () => {
    const page = parseInt(inputPage);
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    } else {
      setInputPage(currentPage);
    }
  };

  const canGoPrev = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className={`flex w-full min-w-0 flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      {/* Total items - Left aligned */}
      <span className="text-sm text-copy whitespace-nowrap">Total: {totalItems} items</span>

      {/* Pagination controls - Right aligned */}
      <div className={`flex w-full min-w-0 flex-wrap items-center justify-center gap-2 lg:w-auto lg:flex-nowrap lg:justify-end ${controlsClassName}`}>
        {/* First page button */}
        <Button aria-label="First page" variant="outline" size="sm" onClick={() => onPageChange(1)} disabled={!canGoPrev} className={controlClassName}>
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button aria-label="Previous page" variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={!canGoPrev} className={controlClassName}>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page input */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
          <Input
            aria-label="Page number"
            type="text"
            inputMode="numeric"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className={`${inputClassName} text-center`}
            min={1}
            max={totalPages}
          />
        </form>

        {/* of total pages */}
        <span className="text-sm text-copy">of {totalPages}</span>

        {/* Next page button */}
        <Button aria-label="Next page" variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={!canGoNext} className={controlClassName}>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button aria-label="Last page" variant="outline" size="sm" onClick={() => onPageChange(totalPages)} disabled={!canGoNext} className={controlClassName}>
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
