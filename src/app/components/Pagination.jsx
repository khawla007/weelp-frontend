import { Button } from '@/components/ui/button';

export const CustomPagination = ({ totalItems = 0, itemsPerPage = 0, currentPage = 0, onPageChange }) => {
  if (!totalItems || !itemsPerPage || !currentPage) {
    return <p className="text-red-400 animate-pulse hidden">All Props Not Passed Pagination</p>;
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex gap-2 justify-between">
      <p className="text-xs  text-gray-600 invisible">Showing 1 to 3 of 3 items</p>
      <div className="flex gap-2">
        {currentPage > 1 && (
          <Button variant="outline" type="button" onClick={() => onPageChange(currentPage - 1)}>
            Prev
          </Button>
        )}

        {[...Array(totalPages)].map((_, i) => (
          <Button
            variant="outline"
            type="button"
            key={i}
            // disabled={currentPage === i + 1}
            className={`text-black p-2 rounded-md bg-white  ${currentPage === i + 1 && 'bg-secondaryDark  text-white'} `}
            onClick={() => {
              if (currentPage === i + 1) {
                return;
              }
              onPageChange(i + 1);
            }}
          >
            {i + 1}
          </Button>
        ))}

        <Button type="button" variant="outline" disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
};
