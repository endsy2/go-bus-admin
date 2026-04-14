# WebSocket Implementation for Real-Time Seat Updates

## Overview
The BookingsPage now includes real-time WebSocket functionality to receive live updates about seat availability changes. This allows administrators to see seat bookings and releases as they happen without manually refreshing the page.

## Architecture

### Components

1. **WebSocket Service** (`src/shared/services/websocketService.js`)
   - Singleton service managing STOMP WebSocket connections
   - Handles connection, reconnection, subscriptions, and disconnections
   - Uses SockJS for WebSocket transport
   - Implements automatic reconnection with exponential backoff

2. **Single Schedule Hook** (`src/features/bookings/hooks/useSeatWebSocket.js`)
   - React hook for subscribing to a single schedule's seat updates
   - Manages subscription lifecycle
   - Provides connection status

3. **Multi-Schedule Hook** (`src/features/bookings/hooks/useMultiScheduleWebSocket.js`)
   - React hook for subscribing to multiple schedules simultaneously
   - Automatically manages subscriptions as schedule list changes
   - Tracks which schedules are currently subscribed

4. **BookingsPage Integration** (`src/features/bookings/pages/BookingsPage/BookingsPage.jsx`)
   - Uses `useMultiScheduleWebSocket` hook
   - Displays real-time connection status (Live/Offline)
   - Shows toast notifications for seat updates
   - Automatically refetches booking data when updates are received

## WebSocket Configuration

### Backend Connection
- **URL**: `ws://localhost:8080/bus-service/ws/bus`
- **Protocol**: STOMP over SockJS
- **Service**: Bus Service (Port 8080, path: /bus-service)

### Topics
- **Pattern**: `/topic/schedule/{scheduleId}/seats`
- **Example**: `/topic/schedule/1/seats`

## Event Types

### SEAT_BOOKED
Triggered when a seat is successfully booked.

```json
{
  "type": "SEAT_BOOKED",
  "scheduleId": 1,
  "seatId": 5,
  "seatNumber": "A5",
  "bookingId": 123,
  "status": "BOOKED",
  "timestamp": "2026-04-13T10:30:00"
}
```

### SEAT_RELEASED
Triggered when a seat becomes available (payment fails, timeout, or cancellation).

```json
{
  "type": "SEAT_RELEASED",
  "scheduleId": 1,
  "seatId": 5,
  "seatNumber": "A5",
  "bookingId": null,
  "status": "AVAILABLE",
  "timestamp": "2026-04-13T10:35:00"
}
```

## Features

### Real-Time Updates
- Automatic subscription to all schedules visible on the current page
- Dynamic subscription management as bookings change
- Toast notifications for seat booking/release events
- Automatic data refresh when updates are received

### Connection Management
- Visual connection status indicator (Wifi icon)
- Automatic reconnection on connection loss
- Maximum 5 reconnection attempts with exponential backoff
- Graceful handling of connection errors

### User Experience
- "Live" indicator when connected (green)
- "Offline" indicator when disconnected (gray)
- Real-time updates enabled message
- Non-intrusive toast notifications

## Usage

### In BookingsPage
The WebSocket is automatically initialized when the BookingsPage component mounts:

```javascript
const { isConnected, subscribedSchedules } = useMultiScheduleWebSocket(
  scheduleIds,
  handleSeatUpdate,
  scheduleIds.length > 0
);
```

### Custom Implementation
To use WebSocket in other components:

```javascript
import { useMultiScheduleWebSocket } from 'features/bookings/hooks/useMultiScheduleWebSocket';

const MyComponent = () => {
  const handleSeatUpdate = (data) => {
    console.log('Seat update:', data);
    // Handle the update
  };

  const { isConnected } = useMultiScheduleWebSocket(
    [1, 2, 3], // Schedule IDs to monitor
    handleSeatUpdate,
    true // Enable WebSocket
  );

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
};
```

## Dependencies

### NPM Packages
- `@stomp/stompjs` - STOMP protocol implementation
- `sockjs-client` - SockJS client for WebSocket transport

### Installation
```bash
npm install @stomp/stompjs sockjs-client
```

## Configuration

### WebSocket URL
To change the WebSocket URL, modify the default in `websocketService.js`:

```javascript
connect(url = 'http://localhost:8080/bus-service/ws/bus') {
  // ...
}
```

### Reconnection Settings
Adjust reconnection behavior in `websocketService.js`:

```javascript
this.maxReconnectAttempts = 5; // Maximum reconnection attempts
this.reconnectDelay = 3000; // Base delay in milliseconds
```

### Heartbeat Settings
Configure STOMP heartbeat in `websocketService.js`:

```javascript
heartbeatIncoming: 4000, // Incoming heartbeat (ms)
heartbeatOutgoing: 4000, // Outgoing heartbeat (ms)
```

## Troubleshooting

### Connection Issues
1. Verify backend WebSocket server is running on port 8080
2. Check browser console for connection errors
3. Ensure CORS is properly configured on backend
4. Verify SockJS endpoint is accessible

### No Updates Received
1. Confirm subscription topics match backend implementation
2. Check that scheduleId is valid and exists
3. Verify backend is publishing events to correct topics
4. Check browser console for subscription errors

### Performance Considerations
- WebSocket automatically unsubscribes from schedules no longer visible
- Only one connection is maintained regardless of subscriptions
- Subscriptions are managed efficiently to avoid duplicates

## Future Enhancements

### Potential Improvements
1. Add WebSocket connection retry with user notification
2. Implement connection quality indicator
3. Add ability to manually reconnect via UI
4. Show list of monitored schedules in UI
5. Add WebSocket event history/log viewer
6. Implement selective notification preferences
7. Add sound notifications for important events
8. Batch multiple rapid updates to reduce UI thrashing

### Additional Event Types
Consider adding support for:
- `BOOKING_CREATED` - New booking created
- `BOOKING_CANCELLED` - Booking cancelled
- `PAYMENT_COMPLETED` - Payment processed
- `SCHEDULE_UPDATED` - Schedule details changed
- `BUS_STATUS_CHANGED` - Bus availability changed

## Testing

### Manual Testing
1. Open BookingsPage in browser
2. Verify "Live" indicator appears when connected
3. Create a booking via API or mobile app
4. Confirm toast notification appears
5. Verify booking list updates automatically

### Backend Testing
Use a WebSocket client to test backend events:

```javascript
const socket = new SockJS('http://localhost:8080/bus-service/ws/bus');
const stompClient = Stomp.over(socket);

stompClient.connect({}, () => {
  stompClient.subscribe('/topic/schedule/1/seats', (message) => {
    console.log('Received:', JSON.parse(message.body));
  });
});
```

## Security Considerations

### Current Implementation
- WebSocket connection is unauthenticated
- Suitable for internal admin dashboard

### Production Recommendations
1. Add authentication token to WebSocket connection
2. Implement authorization checks on backend
3. Use WSS (WebSocket Secure) in production
4. Validate all incoming messages
5. Implement rate limiting on backend
6. Add message encryption for sensitive data

## Monitoring

### Logging
The implementation includes comprehensive logging:
- Connection status changes
- Subscription events
- Message reception
- Error conditions

### Metrics to Track
- Connection uptime
- Reconnection frequency
- Message processing time
- Subscription count
- Error rate

## Documentation References

- [STOMP Protocol](https://stomp.github.io/)
- [SockJS Documentation](https://github.com/sockjs/sockjs-client)
- [@stomp/stompjs](https://stomp-js.github.io/stomp-websocket/)
