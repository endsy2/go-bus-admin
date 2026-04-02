import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';

export const useBookings = (initialFilters = {}, initialPage = 0, initialSize = 10) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    size: initialSize,
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchBookings = useCallback(async (page = pagination.currentPage, size = pagination.size) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingService.filterBookings(filters, page, size);
      
      // Handle ApiResponse<PagedResponse<BookingResponse>> structure
      // response.data contains the PagedResponse
      const pagedData = response.data || {};
      setBookings(pagedData.content || []);
      setPagination({
        currentPage: pagedData.currentPage || page,
        totalPages: pagedData.totalPages || 0,
        totalElements: pagedData.totalElements || 0,
        size: pagedData.size || size,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.size]);

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 0 })); // Reset to first page
  };

  const goToPage = (page) => {
    fetchBookings(page, pagination.size);
  };

  const changePageSize = (size) => {
    setPagination(prev => ({ ...prev, size, currentPage: 0 }));
    fetchBookings(0, size);
  };

  return {
    bookings,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    changePageSize,
    refetch: fetchBookings,
  };
};
