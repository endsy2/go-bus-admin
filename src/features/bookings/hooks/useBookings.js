import { useState, useEffect, useCallback } from 'react';
import bookingService from '../services/bookingService';

const DEFAULT_PAGE_SIZE = 15;

export const useBookings = (initialFilters = {}, initialPage = 0, initialSize = DEFAULT_PAGE_SIZE) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialSize);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState(initialFilters);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Backend uses 0-based pagination — send currentPage directly.
      const response = await bookingService.filterBookings(filters, currentPage, pageSize);

      const pagedData = response.data || {};
      setBookings(pagedData.content || []);
      setTotalPages(pagedData.totalPages || 0);
      setTotalElements(pagedData.totalElements || 0);
      // Do NOT sync currentPage from the response — that would mutate a dependency
      // of this callback and trigger a second fetch on every page change.
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message || 'Failed to fetch bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, pageSize]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const updateFilters = (newFilters) => {
    setCurrentPage(0);
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const resetFilters = () => {
    setCurrentPage(0);
    setFilters({});
  };

  const goToPage = (page) => {
    setCurrentPage(page);
  };

  const changePageSize = (size) => {
    setCurrentPage(0);
    setPageSize(size);
  };

  return {
    bookings,
    loading,
    error,
    pagination: {
      currentPage,
      totalPages,
      totalElements,
      size: pageSize,
    },
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    changePageSize,
    refetch: fetchBookings,
  };
};
