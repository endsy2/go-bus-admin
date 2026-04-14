# WebSocket Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Admin Dashboard                              │
│                      (React Application)                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/WS
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Backend WebSocket Server                        │
│                    (Bus Service - Port 8080)                         │
│                                                                       │
│  Endpoint: ws://localhost:8080/bus-service/ws/bus                   │
│  Protocol: STOMP over SockJS                                        │
└─────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BookingsPage                                │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │  State:                                                        │ │
│  │  - bookings: Booking[]                                        │ │
│  │  - scheduleIds: number[]                                      │ │
│  │  - wsConnected: boolean                                       │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                  │                                   │
│                                  │ uses                              │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │         useMultiScheduleWebSocket Hook                        │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Input:                                                  │ │ │
│  │  │  - scheduleIds: [1, 2, 3]                               │ │ │
│  │  │  - onSeatUpdate: (data) => void                         │ │ │
│  │  │  - enabled: boolean                                     │ │ │
│  │  │                                                          │ │ │
│  │  │  Output:                                                 │ │ │
│  │  │  - isConnected: boolean                                 │ │ │
│  │  │  - subscribedSchedules: number[]                        │ │ │
│  │  │  - reconnect: () => void                                │ │ │
│  │  │  - disconnect: () => void                               │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
│                                  │                                   │
│                                  │ uses                              │
│                                  ▼                                   │
│  ┌───────────────────────────────────────────────────────────────┐ │
│  │            websocketService (Singleton)                       │ │
│  │  ┌─────────────────────────────────────────────────────────┐ │ │
│  │  │  Properties:                                             │ │ │
│  │  │  - client: StompClient                                  │ │ │
│  │  │  - subscriptions: Map<topic, subscription>              │ │ │
│  │  │  - reconnectAttempts: number                            │ │ │
│  │  │                                                          │ │ │
│  │  │  Methods:                                                │ │ │
│  │  │  - connect(url)                                         │ │ │
│  │  │  - subscribe(topic, callback)                           │ │ │
│  │  │  - unsubscribe(topic)                                   │ │ │
│  │  │  - disconnect()                                         │ │ │
│  │  │  - isConnected()                                        │ │ │
│  │  └─────────────────────────────────────────────────────────┘ │ │
│  └───────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Connection Flow

```
┌──────────────┐
│ BookingsPage │
│   Mounts     │
└──────┬───────┘
       │
       │ 1. Extract scheduleIds from bookings
       │
       ▼
┌──────────────────────────┐
│ useMultiScheduleWebSocket│
│      Hook Init           │
└──────┬───────────────────┘
       │
       │ 2. Call websocketService.connect()
       │
       ▼
┌──────────────────────────┐
│   websocketService       │
│   Creates STOMP Client   │
└──────┬───────────────────┘
       │
       │ 3. Connect to ws://localhost:8080/bus-service/ws/bus
       │
       ▼
┌──────────────────────────┐
│   Backend WebSocket      │
│   Connection Accepted    │
└──────┬───────────────────┘
       │
       │ 4. Connection established
       │
       ▼
┌──────────────────────────┐
│   websocketService       │
│   onConnect callback     │
└──────┬───────────────────┘
       │
       │ 5. Subscribe to topics
       │    /topic/schedule/1/seats
       │    /topic/schedule/2/seats
       │    /topic/schedule/3/seats
       │
       ▼
┌──────────────────────────┐
│   Backend WebSocket      │
│   Subscriptions Active   │
└──────┬───────────────────┘
       │
       │ 6. Return isConnected = true
       │
       ▼
┌──────────────────────────┐
│   BookingsPage           │
│   Shows "Live" Indicator │
└──────────────────────────┘
```

### Event Flow

```
┌──────────────────────────┐
│   User Books Seat        │
│   (Mobile App/API)       │
└──────┬───────────────────┘
       │
       │ 1. POST /api/bookings
       │
       ▼
┌──────────────────────────┐
│   Backend Service        │
│   Creates Booking        │
└──────┬───────────────────┘
       │
       │ 2. Publish event to WebSocket
       │
       ▼
┌──────────────────────────┐
│   Backend WebSocket      │
│   Publishes to Topic     │
│   /topic/schedule/1/seats│
└──────┬───────────────────┘
       │
       │ 3. Event: { type: "SEAT_BOOKED", ... }
       │
       ▼
┌──────────────────────────┐
│   websocketService       │
│   Receives Message       │
└──────┬───────────────────┘
       │
       │ 4. Parse JSON and call callback
       │
       ▼
┌──────────────────────────┐
│   useMultiScheduleWebSocket│
│   handleSeatUpdate()     │
└──────┬───────────────────┘
       │
       │ 5. Call onSeatUpdate callback
       │
       ▼
┌──────────────────────────┐
│   BookingsPage           │
│   handleSeatUpdate()     │
└──────┬───────────────────┘
       │
       ├─ 6a. Show toast notification
       │      "Seat A5 has been booked"
       │
       └─ 6b. Call refetch()
              │
              ▼
       ┌──────────────────────────┐
       │   API Call               │
       │   GET /api/admin/bookings│
       └──────┬───────────────────┘
              │
              │ 7. Updated booking data
              │
              ▼
       ┌──────────────────────────┐
       │   BookingsPage           │
       │   UI Updates             │
       └──────────────────────────┘
```

## Subscription Management

```
┌─────────────────────────────────────────────────────────────────┐
│                    Subscription Lifecycle                        │
└─────────────────────────────────────────────────────────────────┘

Initial State:
  scheduleIds: []
  subscriptions: Map {}

User loads page with bookings for schedules [1, 2]:
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Extract scheduleIds: [1, 2]                              │
  │ 2. Subscribe to /topic/schedule/1/seats                     │
  │ 3. Subscribe to /topic/schedule/2/seats                     │
  │ 4. subscriptions: Map { 1 => sub1, 2 => sub2 }             │
  └─────────────────────────────────────────────────────────────┘

User filters bookings, now showing schedules [2, 3]:
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. New scheduleIds: [2, 3]                                  │
  │ 2. Compare with previous: [1, 2]                            │
  │ 3. Unsubscribe from schedule 1 (removed)                    │
  │ 4. Keep subscription to schedule 2 (still present)          │
  │ 5. Subscribe to schedule 3 (new)                            │
  │ 6. subscriptions: Map { 2 => sub2, 3 => sub3 }             │
  └─────────────────────────────────────────────────────────────┘

User navigates away from page:
  ┌─────────────────────────────────────────────────────────────┐
  │ 1. Component unmounts                                        │
  │ 2. Cleanup function runs                                     │
  │ 3. Unsubscribe from all topics                              │
  │ 4. subscriptions: Map {}                                     │
  │ 5. WebSocket connection remains open (for other components) │
  └─────────────────────────────────────────────────────────────┘
```

## Reconnection Flow

```
┌──────────────────────────┐
│   WebSocket Connected    │
└──────┬───────────────────┘
       │
       │ Connection Lost (network issue, server restart, etc.)
       │
       ▼
┌──────────────────────────┐
│   onDisconnect Callback  │
└──────┬───────────────────┘
       │
       │ 1. reconnectAttempts = 0
       │
       ▼
┌──────────────────────────┐
│   handleReconnect()      │
└──────┬───────────────────┘
       │
       │ 2. Wait 3s * reconnectAttempts
       │
       ▼
┌──────────────────────────┐
│   Attempt Reconnection   │
└──────┬───────────────────┘
       │
       ├─ Success ──────────────────────────┐
       │                                     │
       │                                     ▼
       │                          ┌──────────────────────────┐
       │                          │   Connection Restored    │
       │                          │   Resubscribe to Topics  │
       │                          └──────────────────────────┘
       │
       └─ Failure ─────────────────────────┐
                                            │
                                            ▼
                                 ┌──────────────────────────┐
                                 │   reconnectAttempts++    │
                                 └──────┬───────────────────┘
                                        │
                                        │ If attempts < 5
                                        │
                                        ▼
                                 ┌──────────────────────────┐
                                 │   Wait longer and retry  │
                                 │   (exponential backoff)  │
                                 └──────┬───────────────────┘
                                        │
                                        │ If attempts >= 5
                                        │
                                        ▼
                                 ┌──────────────────────────┐
                                 │   Give Up                │
                                 │   Show "Offline" Status  │
                                 └──────────────────────────┘
```

## Message Format

```
┌─────────────────────────────────────────────────────────────────┐
│                      SEAT_BOOKED Event                           │
└─────────────────────────────────────────────────────────────────┘

{
  "type": "SEAT_BOOKED",          // Event type
  "scheduleId": 1,                // Which schedule
  "seatId": 5,                    // Database seat ID
  "seatNumber": "A5",             // Human-readable seat number
  "bookingId": 123,               // Associated booking ID
  "status": "BOOKED",             // New seat status
  "timestamp": "2026-04-13T10:30:00"  // When it happened
}

┌─────────────────────────────────────────────────────────────────┐
│                    SEAT_RELEASED Event                           │
└─────────────────────────────────────────────────────────────────┘

{
  "type": "SEAT_RELEASED",        // Event type
  "scheduleId": 1,                // Which schedule
  "seatId": 5,                    // Database seat ID
  "seatNumber": "A5",             // Human-readable seat number
  "bookingId": null,              // No booking (seat is free)
  "status": "AVAILABLE",          // New seat status
  "timestamp": "2026-04-13T10:35:00"  // When it happened
}
```

## State Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      Component State                             │
└─────────────────────────────────────────────────────────────────┘

BookingsPage State:
  ├─ bookings: Booking[]              // From useBookings hook
  ├─ loading: boolean                 // From useBookings hook
  ├─ pagination: PaginationInfo       // From useBookings hook
  ├─ wsConnected: boolean             // WebSocket connection status
  ├─ detailsDialogOpen: boolean       // Dialog states
  ├─ createDialogOpen: boolean
  ├─ markPaidDialogOpen: boolean
  └─ selectedBooking: Booking | null

useMultiScheduleWebSocket State:
  ├─ subscriptionsRef: Map<scheduleId, subscription>
  ├─ isConnectedRef: boolean
  └─ previousScheduleIdsRef: number[]

websocketService State:
  ├─ client: StompClient | null
  ├─ subscriptions: Map<topic, subscription>
  ├─ reconnectAttempts: number
  ├─ maxReconnectAttempts: 5
  └─ reconnectDelay: 3000
```

## Error Handling

```
┌─────────────────────────────────────────────────────────────────┐
│                      Error Scenarios                             │
└─────────────────────────────────────────────────────────────────┘

1. Connection Failed
   ├─ Cause: Backend not running, network issue, CORS error
   ├─ Detection: onWebSocketError callback
   ├─ Handling: Log error, show "Offline" status
   └─ Recovery: Automatic reconnection attempts

2. Subscription Failed
   ├─ Cause: Invalid topic, authorization issue
   ├─ Detection: subscribe() returns null
   ├─ Handling: Log error, continue with other subscriptions
   └─ Recovery: Retry on next scheduleIds change

3. Message Parse Error
   ├─ Cause: Invalid JSON, unexpected format
   ├─ Detection: JSON.parse() throws error
   ├─ Handling: Log error, ignore message
   └─ Recovery: Continue processing other messages

4. Callback Error
   ├─ Cause: Error in onSeatUpdate callback
   ├─ Detection: Try-catch in message handler
   ├─ Handling: Log error, continue processing
   └─ Recovery: Next message will be processed normally

5. Disconnection
   ├─ Cause: Network loss, server restart, timeout
   ├─ Detection: onDisconnect callback
   ├─ Handling: Show "Offline" status, start reconnection
   └─ Recovery: Automatic reconnection with exponential backoff
```

## Performance Considerations

```
┌─────────────────────────────────────────────────────────────────┐
│                    Performance Optimizations                     │
└─────────────────────────────────────────────────────────────────┘

1. Single Connection
   ✓ One WebSocket connection for entire app
   ✓ Multiple subscriptions on same connection
   ✓ Reduces resource usage

2. Efficient Subscription Management
   ✓ Only subscribe to visible schedules
   ✓ Automatic unsubscribe when schedules change
   ✓ No duplicate subscriptions

3. Debounced Updates
   ✓ Refetch bookings only once per event
   ✓ Multiple rapid events don't cause multiple refetches
   ✓ UI remains responsive

4. Memory Management
   ✓ Automatic cleanup on unmount
   ✓ Limited event history in tester (20 events)
   ✓ No memory leaks

5. Network Efficiency
   ✓ Small message size (~200 bytes per event)
   ✓ Binary WebSocket frames
   ✓ Compression supported
   ✓ Heartbeat keeps connection alive
```

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Security Layers                             │
└─────────────────────────────────────────────────────────────────┘

Current Implementation (Development):
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 1: Network                                             │
  │   - HTTP/WS (unencrypted)                                   │
  │   - localhost only                                          │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 2: Authentication                                      │
  │   - None (open connection)                                  │
  │   - Suitable for internal admin dashboard                   │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 3: Authorization                                       │
  │   - None (all events visible)                               │
  │   - Read-only events                                        │
  └─────────────────────────────────────────────────────────────┘

Production Recommendations:
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 1: Network                                             │
  │   - WSS (encrypted)                                         │
  │   - TLS 1.3                                                 │
  │   - Certificate validation                                  │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 2: Authentication                                      │
  │   - JWT token in connection headers                         │
  │   - Token validation on backend                             │
  │   - Session management                                      │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 3: Authorization                                       │
  │   - Role-based access control                               │
  │   - Topic-level permissions                                 │
  │   - Rate limiting                                           │
  └─────────────────────────────────────────────────────────────┘
  ┌─────────────────────────────────────────────────────────────┐
  │ Layer 4: Data Protection                                     │
  │   - Message encryption                                      │
  │   - PII masking                                             │
  │   - Audit logging                                           │
  └─────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Production Deployment                         │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────────┐
                    │   Load Balancer  │
                    │   (Nginx/HAProxy)│
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │  Web Server 1  │       │  Web Server 2  │
        │  (React App)   │       │  (React App)   │
        └───────┬────────┘       └───────┬────────┘
                │                         │
                └────────────┬────────────┘
                             │
                    ┌────────▼─────────┐
                    │  WebSocket LB    │
                    │  (Sticky Session)│
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼────────┐       ┌───────▼────────┐
        │  WS Server 1   │       │  WS Server 2   │
        │  (Bus Service) │       │  (Bus Service) │
        └───────┬────────┘       └───────┬────────┘
                │                         │
                └────────────┬────────────┘
                             │
                    ┌────────▼─────────┐
                    │  Message Broker  │
                    │  (Redis/RabbitMQ)│
                    └──────────────────┘
```

---

This architecture provides a scalable, maintainable, and performant real-time update system for the admin dashboard.
