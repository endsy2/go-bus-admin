import { useState, useEffect } from 'react';

export const useStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockStats = [
        { title: 'Total Bookings', value: '1,234', icon: '🎫', change: '+12%' },
        { title: 'Active Buses', value: '45', icon: '🚌', change: '+3%' },
        { title: 'Total Revenue', value: '$45,678', icon: '💰', change: '+18%' },
        { title: 'Customers', value: '892', icon: '👥', change: '+8%' },
      ];
      setStats(mockStats);
      setLoading(false);
    }, 300);
  }, []);

  return { stats, loading };
};
