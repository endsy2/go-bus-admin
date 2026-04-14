import { useState, useEffect } from 'react';
import { Icon } from 'shared/components/common/Icon';

export const useStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      // Using mock data for dashboard stats
      const mockStats = [
        { 
          title: 'Total Bookings', 
          value: '1,234', 
          icon: <Icon name="ticket" size={24} color="#FFFFFF" />, 
          change: '+12%' 
        },
        { 
          title: 'Active Buses', 
          value: '45', 
          icon: <Icon name="bus" size={24} color="#FFFFFF" />, 
          change: '+3%' 
        },
        { 
          title: 'Total Revenue', 
          value: '$45,678', 
          icon: <Icon name="dollarSign" size={24} color="#FFFFFF" />, 
          change: '+18%' 
        },
        { 
          title: 'Customers', 
          value: '892', 
          icon: <Icon name="users" size={24} color="#FFFFFF" />, 
          change: '+8%' 
        },
      ];
      setStats(mockStats);
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
};
