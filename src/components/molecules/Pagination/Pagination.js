import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Button } from '../../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  pageSize, 
  totalElements,
  onPageChange, 
  onPageSizeChange 
}) => {
  const pageSizeOptions = [15, 30, 50];

  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="flex justify-between items-center p-4 border-t bg-card rounded-b-lg">
      <div className="text-sm text-muted-foreground">
        Showing {startItem} to {endItem} of {totalElements} entries
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-sm">
          <span>Show</span>
          <Select value={String(pageSize)} onValueChange={(val) => onPageSizeChange(Number(val))}>
            <SelectTrigger className="w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map(size => (
                <SelectItem key={size} value={String(size)}>{size}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>per page</span>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            size="icon"
            onClick={handlePrevious}
            disabled={currentPage === 0}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm min-w-[100px] text-center">
            Page {currentPage + 1} of {totalPages}
          </span>

          <Button 
            variant="outline"
            size="icon"
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
