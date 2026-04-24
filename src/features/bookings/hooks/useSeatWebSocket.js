import { useEffect, useCallback, useRef } from 'react';
import websocketService from 'shared/services/websocketService';

/**
 * Custom hook for managing WebSocket connections for seat availability updates
 * @param {number|null} scheduleId - The schedule ID to subscribe to
 * @param {function} onSeatUpdate - Callback function when seat update is received
 * @param {boolean} enabled - Whether the WebSocket connection should be active
 */
export const useSeatWebSocket = (scheduleId, onSeatUpdate, enabled = true) => {
  const subscriptionRef = useRef(null);
  const isConnectedRef = useRef(false);

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

  const connectAndSubscribe = useCallback(async () => {
    if (!scheduleId || !enabled) {
      return;
    }
    try {
      // Connect to WebSocket if not already connected
      if (!websocketService.isConnected()) {
        console.log('Connecting to WebSocket...');
        await websocketService.connect();
        isConnectedRef.current = true;
      }

      // Subscribe to the schedule's seat updates
      const topic = `/topic/schedule/${scheduleId}/seats`;
      console.log(`Subscribing to topic: ${topic}`);
      
      subscriptionRef.current = websocketService.subscribe(topic, handleSeatUpdate);
    } catch (error) {
      console.error('Failed to connect or subscribe to WebSocket:', error);
      isConnectedRef.current = false;
    }
  }, [scheduleId, enabled, handleSeatUpdate]);

  const unsubscribe = useCallback(() => {
    if (subscriptionRef.current && scheduleId) {
      const topic = `/topic/schedule/${scheduleId}/seats`;
      websocketService.unsubscribe(topic);
      subscriptionRef.current = null;
      console.log(`Unsubscribed from topic: ${topic}`);
    }
  }, [scheduleId]);

  // Connect and subscribe when component mounts or scheduleId changes
  useEffect(() => {
    connectAndSubscribe();

    // Cleanup on unmount or when scheduleId changes
    return () => {
      unsubscribe();
    };
  }, [connectAndSubscribe, unsubscribe]);

  // Disconnect when component unmounts completely
  useEffect(() => {
    return () => {
      // Only disconnect if this is the last component using the WebSocket
      // In a real app, you might want to implement reference counting
      if (isConnectedRef.current) {
        // Don't disconnect immediately as other components might be using it
        // websocketService.disconnect();
      }
    };
  }, []);

  const sendMessage = useCallback((destination, body) => {
    console.log('═══════════════════════════════════════════════════');
    console.log('📨 SEND MESSAGE CALLED');
    console.log('═══════════════════════════════════════════════════');
    console.log('📍 Destination:', destination);
    console.log('📦 Body:', JSON.stringify(body, null, 2));
    console.log('🔌 WebSocket Connected:', websocketService.isConnected());
    
    if (!websocketService.isConnected()) {
      console.error('❌ Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      websocketService.send(destination, body);
      console.log('✅ Message sent successfully');
      console.log('═══════════════════════════════════════════════════');
      return true;
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      console.log('═══════════════════════════════════════════════════');
      return false;
    }
  }, []);

  return {
    isConnected: websocketService.isConnected(),
    reconnect: connectAndSubscribe,
    disconnect: unsubscribe,
    sendMessage
  };
};

export default useSeatWebSocket;
