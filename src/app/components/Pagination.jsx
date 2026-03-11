import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export const CustomPagination = ({ totalItems = 0, itemsPerPage = 0, currentPage = 1, onPageChange }) => {
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
    <div className="flex items-center justify-between gap-4 w-full">
      {/* Total items - Left aligned */}
      <span className="text-sm text-gray-600 whitespace-nowrap">
        Total: {totalItems} items
      </span>

      {/* Pagination controls - Right aligned */}
      <div className="flex items-center gap-2">
        {/* First page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={!canGoPrev}
          className="h-9 px-3"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
          className="h-9 px-3"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Page input */}
        <form onSubmit={handleInputSubmit} className="flex items-center gap-1">
          <Input
            type="text"
            inputMode="numeric"
            value={inputPage}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            className="w-16 h-9 text-center"
            min={1}
            max={totalPages}
          />
        </form>

        {/* of total pages */}
        <span className="text-sm text-gray-600">
          of {totalPages}
        </span>

        {/* Next page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
          className="h-9 px-3"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last page button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!canGoNext}
          className="h-9 px-3"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
