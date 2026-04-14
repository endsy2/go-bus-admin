# WebSocket Quick Start Guide

## What's Been Implemented

Real-time seat availability updates are now live on the BookingsPage! When seats are booked or released, you'll see instant notifications and the booking list will automatically refresh.

## Visual Indicators

### Connection Status
Look for the connection indicator next to "Bookings Management" title:
- **🟢 Live** - WebSocket connected, receiving real-time updates
- **⚪ Offline** - WebSocket disconnected, updates paused

### Notifications
When seat changes occur, you'll see toast notifications:
- "Seat A5 has been booked on schedule #1"
- "Seat B3 is now available on schedule #2"

## How It Works

1. **Automatic Connection**: WebSocket connects when you open BookingsPage
2. **Smart Subscriptions**: Automatically subscribes to all schedules visible on the page
3. **Real-Time Updates**: Receives instant notifications when seats change
4. **Auto Refresh**: Booking list refreshes automatically when updates arrive
5. **Reconnection**: Automatically reconnects if connection is lost (up to 5 attempts)

## Testing the WebSocket

### Method 0: Using the WebSocket Tester Component (Easiest!)
A dedicated testing component is available for debugging:

1. Import the tester in any page:
```javascript
import WebSocketTester from 'features/bookings/components/WebSocketTester';

// Add to your component's JSX
<WebSocketTester />
```

2. The tester provides:
   - Real-time connection status
   - Add/remove schedule subscriptions
   - Live event log with timestamps
   - Enable/disable WebSocket
   - Clear events button

3. Example: Add to DashboardPage temporarily:
```javascript
// In DashboardPage.jsx
import WebSocketTester from 'features/bookings/components/WebSocketTester';

// In the JSX, add:
<WebSocketTester />
```

### Method 1: Using the Mobile App
1. Open the BookingsPage in admin dashboard
2. Use the mobile app to book a seat
3. Watch for the toast notification in admin dashboard
4. Booking list should update automatically

### Method 2: Using API Directly
```bash
# Book a seat (this should trigger SEAT_BOOKED event)
curl -X POST http://localhost:8080/bus-service/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "scheduleId": 1,
    "seatIds": [5],
    "userId": 1
  }'

# Cancel a booking (this should trigger SEAT_RELEASED event)
curl -X PATCH http://localhost:8080/bus-service/api/bookings/123/cancel
```

### Method 3: Backend Testing
Ask your backend developer to manually publish a test event:

```java
// In your backend service
messagingTemplate.convertAndSend(
    "/topic/schedule/1/seats",
    new SeatUpdateEvent("SEAT_BOOKED", 1, 5, "A5", 123, "BOOKED")
);
```

## Troubleshooting

### "Offline" Status Showing
**Possible causes:**
1. Backend WebSocket server not running
2. Backend running on different port
3. CORS issues

**Solutions:**
1. Verify backend is running: `http://localhost:8080/bus-service/ws/bus`
2. Check browser console for errors (F12)
3. Ensure backend CORS allows `http://localhost:3000`

### No Notifications Appearing
**Possible causes:**
1. WebSocket connected but no events being published
2. Subscribed to wrong schedule ID
3. Backend not publishing to correct topic

**Solutions:**
1. Check browser console for "Seat update received:" logs
2. Verify scheduleId in bookings matches backend events
3. Confirm backend publishes to `/topic/schedule/{scheduleId}/seats`

### Connection Keeps Dropping
**Possible causes:**
1. Network instability
2. Backend WebSocket timeout too short
3. Firewall blocking WebSocket

**Solutions:**
1. Check network connection
2. Increase backend WebSocket timeout
3. Check firewall/proxy settings

## Browser Console Commands

Open browser console (F12) and try these commands:

```javascript
// Check WebSocket connection status
console.log('WebSocket connected:', websocketService.isConnected());

// Manually reconnect
// (Note: websocketService is not exposed globally, this is for debugging)
```

## Configuration

### Change WebSocket URL
Edit `src/shared/services/websocketService.js`:

```javascript
connect(url = 'http://localhost:8080/bus-service/ws/bus') {
  // Change the URL here
}
```

### Disable WebSocket
To temporarily disable WebSocket, edit `BookingsPage.jsx`:

```javascript
const { isConnected, subscribedSchedules } = useMultiScheduleWebSocket(
  scheduleIds,
  handleSeatUpdate,
  false // Change to false to disable
);
```

## Backend Requirements

Your backend must:
1. Expose WebSocket endpoint at `/bus-service/ws/bus`
2. Use STOMP protocol over SockJS
3. Publish events to `/topic/schedule/{scheduleId}/seats`
4. Send events in this format:

```json
{
  "type": "SEAT_BOOKED" | "SEAT_RELEASED",
  "scheduleId": 1,
  "seatId": 5,
  "seatNumber": "A5",
  "bookingId": 123,
  "status": "BOOKED" | "AVAILABLE",
  "timestamp": "2026-04-13T10:30:00"
}
```

## Next Steps

1. **Test the connection**: Open BookingsPage and verify "Live" status
2. **Test notifications**: Book a seat and watch for toast notification
3. **Monitor console**: Check browser console for WebSocket logs
4. **Verify backend**: Ensure backend is publishing events correctly

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify backend WebSocket server is running
3. Review `WEBSOCKET_IMPLEMENTATION.md` for detailed documentation
4. Check network tab in browser DevTools for WebSocket connection

## Files Modified/Created

### New Files
- `src/shared/services/websocketService.js` - WebSocket service
- `src/features/bookings/hooks/useSeatWebSocket.js` - Single schedule hook
- `src/features/bookings/hooks/useMultiScheduleWebSocket.js` - Multi-schedule hook
- `WEBSOCKET_IMPLEMENTATION.md` - Detailed documentation
- `WEBSOCKET_QUICK_START.md` - This file

### Modified Files
- `src/features/bookings/pages/BookingsPage/BookingsPage.jsx` - Added WebSocket integration
- `package.json` - Added @stomp/stompjs and sockjs-client dependencies

## Dependencies Installed

```json
{
  "@stomp/stompjs": "^7.0.0",
  "sockjs-client": "^1.6.1"
}
```
