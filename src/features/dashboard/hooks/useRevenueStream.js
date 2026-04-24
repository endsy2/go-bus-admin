import { useState, useEffect, useCallback } from 'react';
import dashboardService from '../services/dashboardService';

export const useRevenueStream = (fromDate = null, toDate = null) => {
  const [revenueStream, setRevenueStream] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRevenueStream = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = {};
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;
      
      const response = await dashboardService.getRevenueStream(params);
      const data = response.data?.data || response.data || null;
      
      setRevenueStream(data);
    } catch (err) {
      console.error('Failed to fetch revenue stream:', err);
      setError(err.response?.data?.message || 'Failed to load revenue stream data');
      setRevenueStream(null);
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchRevenueStream();
  }, [fetchRevenueStream]);

  return { revenueStream, loading, error, refetch: fetchRevenueStream };
};
