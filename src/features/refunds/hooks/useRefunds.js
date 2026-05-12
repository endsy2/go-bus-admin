import { useState, useEffect, useCallback } from 'react';
import refundService from '../services/refundService';

export const useRefunds = (initialFilters = {}, initialPage = 0, initialSize = 10) => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    size: initialSize,
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchRefunds = useCallback(async (page = pagination.currentPage, size = pagination.size) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      if (filters.fromDate && filters.toDate && filters.status) {
        response = await refundService.getRefundsByDateRange(
          filters.status,
          filters.fromDate,
          filters.toDate,
          page,
          size
        );
      } else {
        response = await refundService.getAllRefunds(filters.status, page, size);
      }
      
      const pagedData = response.data || {};
      const refundsData = pagedData.content || [];
      
      setRefunds(refundsData);
      setPagination({
        currentPage: pagedData.number !== undefined ? pagedData.number : page,
        totalPages: pagedData.totalPages || 0,
        totalElements: pagedData.totalElements || 0,
        size: pagedData.size || size,
      });
    } catch (err) {
      console.error('Error fetching refunds:', err);
      setError(err.message || 'Failed to fetch refunds');
      setRefunds([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.size]);

  useEffect(() => {
    fetchRefunds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const resetFilters = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const goToPage = (page) => {
    fetchRefunds(page, pagination.size);
  };

  const changePageSize = (size) => {
    setPagination(prev => ({ ...prev, size, currentPage: 0 }));
    fetchRefunds(0, size);
  };

  return {
    refunds,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    resetFilters,
    goToPage,
    changePageSize,
    refetch: fetchRefunds,
  };
};
