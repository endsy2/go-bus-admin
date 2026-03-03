import { useState, useEffect } from 'react';

export const useBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { id: 'BK001', customer: 'John Doe', route: 'NYC - Boston', date: '2026-03-05', status: 'Confirmed' },
        { id: 'BK002', customer: 'Jane Smith', route: 'LA - SF', date: '2026-03-06', status: 'Pending' },
        { id: 'BK003', customer: 'Mike Johnson', route: 'Chicago - Detroit', date: '2026-03-07', status: 'Confirmed' },
        { id: 'BK004', customer: 'Sarah Williams', route: 'Miami - Orlando', date: '2026-03-08', status: 'Confirmed' },
      ];
      setBookings(mockData);
      setLoading(false);
    }, 500);
  }, []);

  return { bookings, loading };
};
