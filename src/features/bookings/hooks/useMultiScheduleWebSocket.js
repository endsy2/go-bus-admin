import { useEffect, useCallback, useRef } from 'react';
import websocketService from 'shared/services/websocketService';

/**
 * Custom hook for managing WebSocket connections for multiple schedules
 * @param {number[]} scheduleIds - Array of schedule IDs to subscribe to
 * @param {function} onSeatUpdate - Callback function when seat update is received
 * @param {boolean} enabled - Whether the WebSocket connection should be active
 */
export const useMultiScheduleWebSocket = (scheduleIds = [], onSeatUpdate, enabled = true) => {
  const subscriptionsRef = useRef(new Map());
  const isConnectedRef = useRef(false);
  const previousScheduleIdsRef = useRef([]);

  const handleSeatUpdate = useCallback((data) => {
    console.log('Seat update received:', data);
    
    // Validate the event data
    if (!data || !data.type) {
      console.warn('Invalid seat update data:', data);
      return;
    }

    // Call the callback with the seat update
    if (onSeatUpdate) {
      onSeatUpdate(data);
    }
  }, [onSeatUpdate]);

  const subscribeToSchedule = useCallback(async (scheduleId) => {
    if (!scheduleId) return;

    try {
      // Connect to WebSocket if not already connected
      if (!websocketService.isConnected()) {
        console.log('Connecting to WebSocket...');
        await websocketService.connect();
        isConnectedRef.current = true;
      }

      // Subscribe to the schedule's seat updates
      const topic = `/topic/schedule/${scheduleId}/seats`;
      
      // Don't subscribe if already subscribed
      if (subscriptionsRef.current.has(scheduleId)) {
        console.log(`Already subscribed to schedule ${scheduleId}`);
        return;
      }

      console.log(`Subscribing to topic: ${topic}`);
      const subscription = websocketService.subscribe(topic, handleSeatUpdate);
      
      if (subscription) {
        subscriptionsRef.current.set(scheduleId, subscription);
      }
    } catch (error) {
      console.error(`Failed to subscribe to schedule ${scheduleId}:`, error);
      isConnectedRef.current = false;
      
      // If it's an authentication error, provide helpful guidance
      if (error.message && error.message.includes('Authentication token not found')) {
        console.error('WebSocket authentication failed. Please try:');
        console.error('1. Logging out and logging back in');
        console.error('2. Refreshing the page');
        console.error('3. Clearing browser cache and cookies');
      }
    }
  }, [handleSeatUpdate]);

  const unsubscribeFromSchedule = useCallback((scheduleId) => {
    if (!scheduleId) return;

    const topic = `/topic/schedule/${scheduleId}/seats`;
    websocketService.unsubscribe(topic);
    subscriptionsRef.current.delete(scheduleId);
    console.log(`Unsubscribed from schedule ${scheduleId}`);
  }, []);

  const unsubscribeAll = useCallback(() => {
    subscriptionsRef.current.forEach((_, scheduleId) => {
      unsubscribeFromSchedule(scheduleId);
    });
    subscriptionsRef.current.clear();
  }, [unsubscribeFromSchedule]);

  // Subscribe to schedules when they change
  useEffect(() => {
    if (!enabled || scheduleIds.length === 0) {
      unsubscribeAll();
      return;
    }

    // Find schedules to add and remove
    const currentIds = new Set(scheduleIds);
    const previousIds = new Set(previousScheduleIdsRef.current);

    // Unsubscribe from schedules that are no longer in the list
    previousIds.forEach(id => {
      if (!currentIds.has(id)) {
        unsubscribeFromSchedule(id);
      }
    });

    // Subscribe to new schedules
    currentIds.forEach(id => {
      if (!previousIds.has(id)) {
        subscribeToSchedule(id);
      }
    });

    // Update previous schedule IDs
    previousScheduleIdsRef.current = scheduleIds;

    // Cleanup on unmount
    return () => {
      unsubscribeAll();
    };
  }, [scheduleIds, enabled, subscribeToSchedule, unsubscribeFromSchedule, unsubscribeAll]);

  return {
    isConnected: websocketService.isConnected(),
    subscribedSchedules: Array.from(subscriptionsRef.current.keys()),
    reconnect: () => {
      scheduleIds.forEach(id => subscribeToSchedule(id));
    },
    disconnect: unsubscribeAll
  };
};

export default useMultiScheduleWebSocket;
