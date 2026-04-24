# WebSocket Integration - Complete Explanation

## 🎯 What is WebSocket?

WebSocket is a **real-time, two-way communication** protocol between your browser (frontend) and the server (backend). Unlike regular HTTP requests that are one-time (request → response), WebSocket keeps a **persistent connection** open so the server can push updates to your browser instantly.

**Think of it like:**
- HTTP = Sending letters (you send, wait for reply, done)
- WebSocket = Phone call (connection stays open, both can talk anytime)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         YOUR BROWSER                            │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         CreateBookingDialog.jsx (UI Component)           │  │
│  │                                                          │  │
│  │  - Shows seat grid                                       │  │
│  │  - Handles seat clicks                                   │  │
│  │  - Updates seat colors                                   │  │
│  └────────────┬─────────────────────────────┬───────────────┘  │
│               │                             │                   │
│               │ Uses                        │ Uses              │
│               ↓                             ↓                   │
│  ┌────────────────────────┐   ┌────────────────────────────┐  │
│  │  useSeatWebSocket.js   │   │  websocketService.js       │  │
│  │  (React Hook)          │   │  (WebSocket Manager)       │  │
│  │                        │   │                            │  │
│  │  - Subscribe to topic  │   │  - Connect to server       │  │
│  │  - Send messages       │   │  - Send/receive messages   │  │
│  │  - Handle updates      │   │  - Manage subscriptions    │  │
│  └────────────┬───────────┘   └────────────┬───────────────┘  │
│               │                             │                   │
│               └─────────────┬───────────────┘                   │
│                             │                                   │
│                             │ WebSocket Connection              │
│                             │ (ws://localhost:8080/...)         │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                              │ Persistent Connection
                              │ (Always Open)
                              │
┌─────────────────────────────┼───────────────────────────────────┐
│                             │                                   │
│                             ↓                                   │
│                    BACKEND SERVER                               │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         WebSocket Controller (Java/Spring)               │  │
│  │                                                          │  │
│  │  @MessageMapping("/seat/select")                        │  │
│  │  @MessageMapping("/seat/deselect")                      │  │
│  │                                                          │  │
│  │  - Receives seat selection messages                     │  │
│  │  - Updates database                                     │  │
│  │  - Broadcasts to all connected clients                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Message Broker (STOMP)                      │  │
│  │                                                          │  │
│  │  Topic: /topic/schedule/4/seats                         │  │
│  │                                                          │  │
│  │  - Manages subscriptions                                │  │
│  │  - Broadcasts messages to all subscribers               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
src/
├── shared/
│   └── services/
│       └── websocketService.js          # Core WebSocket connection manager
│
└── features/
    └── bookings/
        ├── hooks/
        │   └── useSeatWebSocket.js      # React hook for seat updates
        │
        └── components/
            └── CreateBookingDialog/
                └── CreateBookingDialog.jsx  # UI component
```

---

## 🔧 Component 1: websocketService.js

**Purpose:** Manages the WebSocket connection to the server

**Location:** `src/shared/services/websocketService.js`

### Key Functions:

#### 1. `connect(url)`
Establishes WebSocket connection to the server

```javascript
connect('http://localhost:8080/bus-service/ws/bus')
```

**What happens:**
1. Creates SockJS connection (WebSocket wrapper)
2. Adds authentication token from localStorage
3. Establishes STOMP protocol connection
4. Handles reconnection if connection drops

#### 2. `subscribe(topic, callback)`
Subscribes to a specific topic to receive updates

```javascript
subscribe('/topic/schedule/4/seats', (data) => {
  console.log('Received update:', data);
});
```

**What happens:**
1. Tells server "I want updates for schedule 4 seats"
2. When server sends update, calls your callback function
3. Returns subscription object (to unsubscribe later)

#### 3. `send(destination, body)`
Sends a message to the server

```javascript
send('/app/seat/select', {
  scheduleId: 4,
  seatId: 123,
  userId: 1
});
```

**What happens:**
1. Converts message to JSON
2. Sends to server endpoint `/app/seat/select`
3. Server processes and broadcasts to all subscribers

#### 4. `unsubscribe(topic)`
Stops receiving updates for a topic

```javascript
unsubscribe('/topic/schedule/4/seats');
```

---

## 🔧 Component 2: useSeatWebSocket.js

**Purpose:** React hook that connects WebSocket to your component

**Location:** `src/features/bookings/hooks/useSeatWebSocket.js`

### How It Works:

```javascript
const { isConnected, sendMessage } = useSeatWebSocket(
  scheduleId,           // Which schedule to watch
  handleSeatUpdate,     // Function to call when update received
  enabled               // Whether to connect or not
);
```

### What It Does:

1. **Connects to WebSocket** when component mounts
2. **Subscribes to topic** `/topic/schedule/{scheduleId}/seats`
3. **Receives updates** and calls your `handleSeatUpdate` function
4. **Provides sendMessage** function to send seat selections
5. **Cleans up** when component unmounts

### Example Usage:

```javascript
// In CreateBookingDialog.jsx
const handleSeatUpdate = (data) => {
  // Update seat status in UI
  console.log('Seat update:', data);
};

const { isConnected, sendMessage } = useSeatWebSocket(
  formData.scheduleId,
  handleSeatUpdate,
  open && step === 2  // Only connect on step 2
);
```

---

## 🔧 Component 3: CreateBookingDialog.jsx

**Purpose:** UI component that uses WebSocket for real-time seat updates

**Location:** `src/features/bookings/components/CreateBookingDialog/CreateBookingDialog.jsx`

### Integration Points:

#### 1. Initialize WebSocket Hook

```javascript
const { isConnected, sendMessage } = useSeatWebSocket(
  formData.scheduleId ? parseInt(formData.scheduleId) : null,
  handleSeatUpdate,
  open && step === 2 && formData.scheduleId
);
```

**When:** Component renders
**What:** Sets up WebSocket connection for current schedule

#### 2. Handle Incoming Updates

```javascript
const handleSeatUpdate = useCallback((data) => {
  console.log('Seat update received:', data);
  
  // Update seat status in state
  setScheduleSeats(prevSeats => 
    prevSeats.map(seat => 
      seat.id === data.seatId 
        ? { ...seat, status: data.status, pendingUserId: data.userId }
        : seat
    )
  );
  
  // Show notifications
  if (data.type === 'SEAT_BOOKED') {
    addToast({ message: `Seat ${data.seatNumber} was booked` });
  }
}, []);
```

**When:** Server sends update
**What:** Updates UI to reflect new seat status

#### 3. Send Seat Selection

```javascript
const handleSeatToggle = (seatId, seatNumber, scheduleSeat) => {
  const exists = selectedSeats.find(s => s.id === seatId);
  
  if (exists) {
    // Deselect - send message to server
    sendMessage('/app/seat/deselect', {
      scheduleId: parseInt(formData.scheduleId),
      seatId: seatId,
      userId: currentUserId
    });
  } else {
    // Select - send message to server
    sendMessage('/app/seat/select', {
      scheduleId: parseInt(formData.scheduleId),
      seatId: seatId,
      userId: currentUserId
    });
  }
};
```

**When:** User clicks on a seat
**What:** Sends message to server to select/deselect seat

---

## 🔄 Complete Flow: User Selects a Seat

Let's trace what happens when **User A** clicks on **Seat A1**:

### Step 1: User A Clicks Seat A1

```javascript
// CreateBookingDialog.jsx - handleSeatToggle()
handleSeatToggle(123, 'A1', seatData);
```

### Step 2: Send Message to Server

```javascript
// useSeatWebSocket.js - sendMessage()
sendMessage('/app/seat/select', {
  scheduleId: 4,
  seatId: 123,
  userId: 1
});
```

### Step 3: Message Travels Through WebSocket

```
Browser → WebSocket Connection → Server
```

### Step 4: Server Receives Message

```java
// Backend - WebSocket Controller
@MessageMapping("/app/seat/select")
public void selectSeat(SeatSelectionRequest request) {
    // 1. Update database
    seat.setStatus("PENDING");
    seat.setPendingUserId(request.getUserId());
    scheduleSeatRepository.save(seat);
    
    // 2. Create event
    SeatAvailabilityEvent event = new SeatAvailabilityEvent(
        "SEAT_SELECTED",
        request.getScheduleId(),
        request.getSeatId(),
        "A1",
        null,
        "PENDING",
        request.getUserId(),
        LocalDateTime.now()
    );
    
    // 3. Broadcast to ALL subscribers
    messagingTemplate.convertAndSend(
        "/topic/schedule/4/seats",
        event
    );
}
```

### Step 5: Server Broadcasts to All Clients

```
Server → WebSocket → All Browsers Watching Schedule 4
```

### Step 6: All Clients Receive Update

**User A's Browser:**
```javascript
// handleSeatUpdate() is called
{
  type: "SEAT_SELECTED",
  scheduleId: 4,
  seatId: 123,
  seatNumber: "A1",
  status: "PENDING",
  userId: 1
}

// Seat A1 stays blue (already selected locally)
```

**User B's Browser:**
```javascript
// handleSeatUpdate() is called
{
  type: "SEAT_SELECTED",
  scheduleId: 4,
  seatId: 123,
  seatNumber: "A1",
  status: "PENDING",
  userId: 1
}

// Seat A1 turns orange (pending by another user)
```

### Step 7: UI Updates

**User A:** Seat A1 is blue (your selection)
**User B:** Seat A1 is orange (locked by User A)

---

## 📊 Message Flow Diagram

```
USER A CLICKS SEAT A1
│
├─ 1. handleSeatToggle() called
│   └─ Update local state (seat turns blue immediately)
│
├─ 2. sendMessage('/app/seat/select', {...})
│   └─ websocketService.send()
│       └─ STOMP client.publish()
│
├─ 3. Message sent over WebSocket
│   └─ ws://localhost:8080/bus-service/ws/bus
│
├─ 4. Backend receives message
│   ├─ @MessageMapping("/app/seat/select")
│   ├─ Update database (status = PENDING)
│   └─ Broadcast event to /topic/schedule/4/seats
│
├─ 5. All subscribers receive event
│   ├─ User A's browser
│   ├─ User B's browser
│   └─ User C's browser
│
└─ 6. Each browser calls handleSeatUpdate()
    ├─ User A: Seat already blue (no change)
    ├─ User B: Seat turns orange (locked)
    └─ User C: Seat turns orange (locked)
```

---

## 🎨 Visual State Changes

### User A's View:
```
Before Click:  [🟢 A1] (Green - Available)
After Click:   [🔵 A1] (Blue - Your Selection)
                ↓
         (WebSocket sends message)
                ↓
         (Receives own update)
                ↓
After Update:  [🔵 A1] (Blue - Still Your Selection)
```

### User B's View:
```
Before:        [🟢 A1] (Green - Available)
                ↓
         (Receives WebSocket update)
                ↓
After Update:  [🟠 A1] (Orange - Locked by User A)
```

---

## 🔌 Connection Lifecycle

### 1. Dialog Opens (Step 2)

```javascript
// useSeatWebSocket.js - useEffect()
useEffect(() => {
  if (scheduleId && enabled) {
    // Connect to WebSocket
    websocketService.connect();
    
    // Subscribe to topic
    websocketService.subscribe(
      `/topic/schedule/${scheduleId}/seats`,
      handleSeatUpdate
    );
  }
}, [scheduleId, enabled]);
```

**Result:** Connected and listening for updates

### 2. User Interacts

```javascript
// User clicks seats
sendMessage('/app/seat/select', {...});
sendMessage('/app/seat/deselect', {...});
```

**Result:** Messages sent, updates received

### 3. Dialog Closes

```javascript
// useSeatWebSocket.js - cleanup
return () => {
  websocketService.unsubscribe(`/topic/schedule/${scheduleId}/seats`);
};
```

**Result:** Unsubscribed from topic (connection stays open for other components)

---

## 🎯 Key Benefits

### 1. Real-Time Updates
- User A selects seat → User B sees it instantly
- No need to refresh page
- No polling (checking every few seconds)

### 2. Optimistic UI
- Seat turns blue immediately when clicked
- Don't wait for server response
- Better user experience

### 3. Conflict Prevention
- User B can't click seats locked by User A
- Prevents double-booking
- Shows who's selecting what

### 4. Scalability
- One connection handles all updates
- Server pushes only when needed
- Efficient bandwidth usage

---

## 🐛 Debugging WebSocket

### Check Connection Status

```javascript
console.log('WebSocket connected:', isConnected);
```

### Monitor Messages

```javascript
// In websocketService.js
debug: (str) => {
  console.log('STOMP Debug:', str);
}
```

### View Subscriptions

```javascript
console.log('Active subscriptions:', websocketService.subscriptions);
```

### Test Message Sending

```javascript
sendMessage('/app/seat/select', {
  scheduleId: 4,
  seatId: 123,
  userId: 1
});
// Check console for "Message sent successfully"
```

---

## 📝 Summary

**WebSocket Integration Flow:**

1. **websocketService.js** - Manages connection to server
2. **useSeatWebSocket.js** - React hook that subscribes to seat updates
3. **CreateBookingDialog.jsx** - UI that uses the hook

**When you click a seat:**
1. UI updates immediately (blue)
2. Message sent to server via WebSocket
3. Server updates database
4. Server broadcasts to all clients
5. All clients receive update and update their UI

**Result:** Real-time, synchronized seat selection across all users!
