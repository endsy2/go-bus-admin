import React from 'react';
import Icon from '../../atoms/Icon/Icon';
import './Pagination.css';

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

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    onPageSizeChange(newSize);
  };

  const startItem = currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className="pagination-container">
      <div className="pagination-info">
        <span>
          Showing {startItem} to {endItem} of {totalElements} entries
        </span>
      </div>

      <div className="pagination-controls">
        <div className="page-size-selector">
          <label>Show</label>
          <select value={pageSize} onChange={handlePageSizeChange}>
            {pageSizeOptions.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
          <label>per page</label>
        </div>

        <div className="pagination-buttons">
          <button 
            className="pagination-btn" 
            onClick={handlePrevious}
            disabled={currentPage === 0}
          >
            <Icon name="chevronLeft" size={16} />
          </button>
          
          <span className="page-indicator">
            Page {currentPage + 1} of {totalPages}
          </span>

          <button 
            className="pagination-btn" 
            onClick={handleNext}
            disabled={currentPage >= totalPages - 1}
          >
            <Icon name="chevronRight" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
