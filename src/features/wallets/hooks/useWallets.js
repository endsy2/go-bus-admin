import { useState, useEffect, useCallback } from 'react';
import walletService from '../services/walletService';

export const useWallets = (initialFilters = {}, initialPage = 0, initialSize = 10) => {
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 0,
    totalElements: 0,
    size: initialSize,
  });
  const [filters, setFilters] = useState(initialFilters);

  const fetchWallets = useCallback(async (page = pagination.currentPage, size = pagination.size) => {
    try {
      setLoading(true);
      setError(null);
      const response = await walletService.getWallets(filters, page, size);
      
      setWallets(response.data || []);
      setPagination({
        currentPage: response.currentPage || page,
        totalPages: response.totalPages || 0,
        totalElements: response.totalElements || 0,
        size: response.size || size,
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch wallets');
      setWallets([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.currentPage, pagination.size]);

  useEffect(() => {
    fetchWallets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, currentPage: 0 }));
  };

  const goToPage = (page) => {
    fetchWallets(page, pagination.size);
  };

  const changePageSize = (size) => {
    setPagination(prev => ({ ...prev, size, currentPage: 0 }));
    fetchWallets(0, size);
  };

  return {
    wallets,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    goToPage,
    changePageSize,
    refetch: fetchWallets,
  };
};
