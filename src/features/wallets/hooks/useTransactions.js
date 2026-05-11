import { useState, useEffect, useCallback } from 'react';
import walletService from '../services/walletService';

export const useTransactions = (initialFilters = {}, initialPage = 0, initialSize = 10) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    size: initialSize,
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchTransactions = useCallback(async (page = pagination.currentPage, size = pagination.size) => {
    try {
      setLoading(true);
      setError(null);
      const response = await walletService.getTransactions(filters, page, size);
      
      // Handle PagedResponse structure: { content, page, size, totalElements, totalPages }
      setTransactions(response.content || []);
    setPagination({
        currentPage: response.page || page,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        size: response.size || size,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.size]);

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const goToPage = (page) => {
    fetchTransactions(page, pagination.size);
  };

  const changePageSize = (size) => {
    setPagination(prev => ({ ...prev, size, currentPage: 0 }));
    fetchTransactions(0, size);
  };

  return {
    transactions,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    changePageSize,
    refetch: fetchTransactions,
  };
};
