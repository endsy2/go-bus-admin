# How WebSocket Works in Frontend

## 📚 Overview

The WebSocket implementation in your frontend follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                      BookingsPage                            │
│                    (UI Component)                            │
│  - Displays bookings list                                   │
│  - Shows "Live" indicator                                   │
│  - Shows toast notifications                                │
└────────────────┬────────────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────────┐
│              useMultiScheduleWebSocket                       │
│                   (React Hook)                               │
│  - Manages multiple schedule subscriptions                  │
│  - Handles seat update events                               │
│  - Provides connection status                               │
└────────────────┬────────────────────────────────────────────┘
                 │ uses
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                 websocketService                             │
│                  (Singleton Service)                         │
│  - Manages WebSocket connection                             │
│  - Handles subscriptions                                    │
│  - Automatic reconnection                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Complete Flow Diagram

### Step-by-Step Process

```
1. USER OPENS BOOKINGSPAGE
   │
   ├─→ BookingsPage component mounts
   │
   ├─→ Extracts scheduleIds from bookings [1, 2, 3]
   │
   └─→ Calls useMultiScheduleWebSocket([1, 2, 3], handleSeatUpdate)

2. HOOK INITIALIZES
   │
   ├─→ useMultiScheduleWebSocket receives scheduleIds
   │
   ├─→ Calls websocketService.connect()
   │
   └─→ Waits for connection

3. WEBSOCKET CONNECTS
   │
   ├─→ websocketService reads JWT token from localStorage
   │
   ├─→ Creates connection URL with token:
   │   ws://localhost:8080/bus-service/ws/bus?token=YOUR_JWT_TOKEN
   │
   ├─→ Creates STOMP client with SockJS
   │
   ├─→ Connects to backend
   │
   └─→ Connection established ✅

4. SUBSCRIPTIONS CREATED
   │
   ├─→ For each scheduleId [1, 2, 3]:
   │   │
   │   ├─→ Subscribe to /topic/schedule/1/seats
   │   ├─→ Subscribe to /topic/schedule/2/seats
   │   └─→ Subscribe to /topic/schedule/3/seats
   │
   └─→ All subscriptions active ✅

5. BACKEND PUBLISHES EVENT
   │
   ├─→ User books seat via mobile app
   │
   ├─→ Backend publishes to /topic/schedule/1/seats:
   │   {
   │     type: "SEAT_BOOKED",
   │     scheduleId: 1,
   │     seatNumber: "A5",
   │     ...
   │   }
   │
   └─→ Event sent to all subscribers

6. FRONTEND RECEIVES EVENT
   │
   ├─→ websocketService receives message
   │
   ├─→ Parses JSON
   │
   ├─→ Calls subscription callback
   │
   └─→ handleSeatUpdate(data) is called

7. UI UPDATES
   │
   ├─→ handleSeatUpdate shows toast notification:
   │   "Seat A5 has been booked on schedule #1"
   │
   ├─→ Calls refetch() to update booking list
   │
   └─→ UI shows updated data ✅

8. USER NAVIGATES AWAY
   │
   ├─→ BookingsPage unmounts
   │
   ├─→ Hook cleanup runs
   │
   ├─→ Unsubscribes from all topics
   │
   └─→ WebSocket connection remains open for other components
```

---

## 📁 File Structure & Responsibilities

### 1. websocketService.js (Core Service)

**Location:** `src/shared/services/websocketService.js`

**Responsibilities:**
- Manage single WebSocket connection
- Handle connection/disconnection
- Manage subscriptions
- Automatic reconnection

**Key Methods:**
```javascript
class WebSocketService {
  connect(url)              // Connect to WebSocket server
  subscribe(topic, callback) // Subscribe to a topic
  unsubscribe(topic)        // Unsubscribe from a topic
  disconnect()              // Disconnect and cleanup
  isConnected()             // Check connection status
}
```

**Example Usage:**
```javascript
// Connect
await websocketService.connect('ws://localhost:8080/bus-service/ws/bus');

// Subscribe
websocketService.subscribe('/topic/schedule/1/seats', (data) => {
  console.log('Received:', data);
});

// Unsubscribe
websocketService.unsubscribe('/topic/schedule/1/seats');

// Disconnect
websocketService.disconnect();
```

---

### 2. useMultiScheduleWebSocket.js (React Hook)

**Location:** `src/features/bookings/hooks/useMultiScheduleWebSocket.js`

**Responsibilities:**
- React hook for managing multiple schedule subscriptions
- Automatically subscribe/unsubscribe as schedules change
- Provide connection status to components

**Parameters:**
```javascript
useMultiScheduleWebSocket(
  scheduleIds,      // Array of schedule IDs to monitor [1, 2, 3]
  onSeatUpdate,     // Callback when seat update is received
  enabled           // Enable/disable WebSocket (default: true)
)
```

**Returns:**
```javascript
{
  isConnected,           // boolean - Connection status
  subscribedSchedules,   // number[] - Currently subscribed schedule IDs
  reconnect,            // function - Manually reconnect
  disconnect            // function - Manually disconnect
}
```

**Example Usage:**
```javascript
const { isConnected, subscribedSchedules } = useMultiScheduleWebSocket(
  [1, 2, 3],
  (data) => {
    console.log('Seat update:', data);
    // Handle the update
  },
  true
);
```

---

### 3. BookingsPage.jsx (UI Component)

**Location:** `src/features/bookings/pages/BookingsPage/BookingsPage.jsx`

**Responsibilities:**
- Display bookings list
- Show WebSocket connection status
- Handle seat update events
- Show toast notifications

**How it uses WebSocket:**
```javascript
const BookingsPage = () => {
  const { bookings, refetch } = useBookings();
  const [wsConnected, setWsConnected] = useState(false);

  // Extract unique schedule IDs from bookings
  const scheduleIds = [...new Set(bookings.map(b => b.scheduleId).filter(Boolean))];

  // Handle seat updates
  const handleSeatUpdate = useCallback((data) => {
    // Show toast notification
    addToast({
      message: `Seat ${data.seatNumber} has been booked on schedule #${data.scheduleId}`,
      type: 'info'
    });

    // Refresh bookings data
    refetch();
  }, [addToast, refetch]);

  // Subscribe to WebSocket
  const { isConnected } = useMultiScheduleWebSocket(
    scheduleIds,
    handleSeatUpdate,
    scheduleIds.length > 0
  );

  // Update connection status
  useEffect(() => {
    setWsConnected(isConnected);
  }, [isConnected]);

  return (
    <div>
      {/* Connection status indicator */}
      {wsConnected ? (
        <span>🟢 Live</span>
      ) : (
        <span>⚪ Offline</span>
      )}
      
      {/* Bookings list */}
      {bookings.map(booking => (
        <div key={booking.id}>{booking.id}</div>
      ))}
    </div>
  );
};
```

---

## 🔄 Data Flow Example

### Scenario: User books a seat

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION (Mobile App)                                 │
│    User books seat A5 on schedule #1                        │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. BACKEND PROCESSES                                         │
│    - Creates booking in database                            │
│    - Publishes WebSocket event:                             │
│      Topic: /topic/schedule/1/seats                         │
│      Data: { type: "SEAT_BOOKED", seatNumber: "A5", ... }  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. WEBSOCKET SERVICE RECEIVES                                │
│    websocketService.js                                       │
│    - Receives message on /topic/schedule/1/seats            │
│    - Parses JSON: { type: "SEAT_BOOKED", ... }             │
│    - Calls subscription callback                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. HOOK PROCESSES                                            │
│    useMultiScheduleWebSocket.js                              │
│    - handleSeatUpdate(data) is called                       │
│    - Validates event data                                   │
│    - Calls onSeatUpdate callback                            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. COMPONENT HANDLES                                         │
│    BookingsPage.jsx                                          │
│    - handleSeatUpdate receives data                         │
│    - Shows toast: "Seat A5 has been booked"                │
│    - Calls refetch() to update booking list                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UI UPDATES                                                │
│    - Toast notification appears                             │
│    - Booking list refreshes with new data                   │
│    - User sees updated information                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Key Concepts

### 1. Singleton Pattern

**websocketService** is a singleton - only ONE instance exists:

```javascript
// websocketService.js
class WebSocketService {
  // ... implementation
}

// Export single instance
const websocketService = new WebSocketService();
export default websocketService;
```

**Why?**
- Only one WebSocket connection needed
- Multiple components can share the same connection
- Efficient resource usage

### 2. Subscription Management

**Multiple subscriptions on one connection:**

```javascript
// Component A subscribes to schedule 1
websocketService.subscribe('/topic/schedule/1/seats', callbackA);

// Component B subscribes to schedule 2
websocketService.subscribe('/topic/schedule/2/seats', callbackB);

// Both use the same WebSocket connection!
```

### 3. Automatic Cleanup

**React hook handles cleanup automatically:**

```javascript
useEffect(() => {
  // Subscribe when component mounts
  subscribeToSchedule(scheduleId);

  // Cleanup when component unmounts
  return () => {
    unsubscribeFromSchedule(scheduleId);
  };
}, [scheduleId]);
```

### 4. Dynamic Subscriptions

**Subscriptions update when schedules change:**

```javascript
// Initial: [1, 2]
useMultiScheduleWebSocket([1, 2], callback);
// Subscribed to: /topic/schedule/1/seats, /topic/schedule/2/seats

// User filters bookings, now: [2, 3]
useMultiScheduleWebSocket([2, 3], callback);
// Unsubscribed from: /topic/schedule/1/seats
// Still subscribed to: /topic/schedule/2/seats
// Newly subscribed to: /topic/schedule/3/seats
```

---

## 🔐 Authentication Flow

### How JWT Token is Used

```javascript
// 1. Read token from localStorage
const storedUser = localStorage.getItem('user');
const userData = JSON.parse(storedUser);
const token = userData.token;

// 2. Add token to WebSocket URL
const url = `ws://localhost:8080/bus-service/ws/bus?token=${token}`;

// 3. Create connection with token
new SockJS(url);

// 4. Backend validates token
// 5. Connection established if token is valid
```

---

## 🧪 Testing WebSocket

### Using Browser Console

```javascript
// Check if WebSocket is connected
console.log('Connected:', websocketService.isConnected());

// Check subscriptions
console.log('Subscriptions:', websocketService.subscriptions);

// Manually trigger reconnection
websocketService.connect();

// Check stored token
const user = JSON.parse(localStorage.getItem('user'));
console.log('Token:', user?.token);
```

### Using WebSocketTester Component

```javascript
import WebSocketTester from 'features/bookings/components/WebSocketTester';

// Add to any page
<WebSocketTester />
```

**Features:**
- Add/remove schedule subscriptions
- View live event log
- Monitor connection status
- Enable/disable WebSocket

---

## 📊 State Management

### Component State Flow

```
BookingsPage State:
├─ bookings: Booking[]           (from useBookings)
├─ wsConnected: boolean          (WebSocket status)
├─ scheduleIds: number[]         (extracted from bookings)
└─ handleSeatUpdate: function    (event handler)

useMultiScheduleWebSocket State:
├─ subscriptionsRef: Map         (active subscriptions)
├─ isConnectedRef: boolean       (connection status)
└─ previousScheduleIdsRef: []    (for comparison)

websocketService State:
├─ client: StompClient           (WebSocket client)
├─ subscriptions: Map            (all subscriptions)
├─ reconnectAttempts: number     (reconnection counter)
└─ maxReconnectAttempts: 5       (max retries)
```

---

## 🎓 Summary

### How it all works together:

1. **BookingsPage** extracts schedule IDs from bookings
2. **useMultiScheduleWebSocket** hook manages subscriptions
3. **websocketService** handles the actual WebSocket connection
4. **Backend** publishes events when seats change
5. **Frontend** receives events and updates UI
6. **User** sees real-time updates without refreshing

### Key Benefits:

- ✅ Real-time updates without polling
- ✅ Efficient (single connection for all subscriptions)
- ✅ Automatic reconnection on disconnect
- ✅ Clean separation of concerns
- ✅ Easy to use in any component
- ✅ Automatic cleanup on unmount

### Files to Remember:

1. **Service:** `src/shared/services/websocketService.js`
2. **Hook:** `src/features/bookings/hooks/useMultiScheduleWebSocket.js`
3. **Usage:** `src/features/bookings/pages/BookingsPage/BookingsPage.jsx`
4. **Tester:** `src/features/bookings/components/WebSocketTester/WebSocketTester.jsx`

That's how WebSocket works in your frontend! 🚀
