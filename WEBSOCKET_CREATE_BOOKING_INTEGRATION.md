# WebSocket Integration - Create Booking Dialog

## ✅ Implementation Complete

WebSocket real-time seat updates have been added to the Create Booking Dialog (seat selection screen).

---

## 🎯 What Was Added

### 1. Real-Time Seat Updates

When you're on Step 2 (seat selection), the dialog now:
- ✅ Connects to WebSocket for the selected schedule
- ✅ Receives real-time seat status updates
- ✅ Updates seat availability instantly
- ✅ Shows toast notifications when seats change
- ✅ Removes seats from your selection if booked by someone else
- ✅ Displays connection status (Live/Offline)

### 2. Visual Indicators

**Connection Status:**
- 🟢 "Live" indicator when WebSocket is connected
- ⚪ "Offline" indicator when disconnected
- "Real-time updates enabled" message when connected

---

## 📊 Console Logs

When a seat update is received, you'll see detailed logs in the browser console:

```
═══════════════════════════════════════════════════
🔔 SEAT UPDATE RECEIVED IN CREATE BOOKING DIALOG
═══════════════════════════════════════════════════
📦 Full Event Data: {
  "type": "SEAT_BOOKED",
  "scheduleId": 1,
  "seatId": 5,
  "seatNumber": "A5",
  "bookingId": 123,
  "status": "BOOKED",
  "timestamp": "2026-04-13T10:30:00"
}
📋 Event Details:
  - Type: SEAT_BOOKED
  - Schedule ID: 1
  - Seat ID: 5
  - Seat Number: A5
  - Booking ID: 123
  - Status: BOOKED
  - Timestamp: 2026-04-13T10:30:00
═══════════════════════════════════════════════════
🔄 Updating seat status...
  - Previous seats count: 25
  ✅ Found matching seat: A5
    - Old status: AVAILABLE
    - New status: BOOKED
  - Updated seats count: 25
  ⚠️ Removing seat from selection (booked by someone else)
```

---

## 🔄 How It Works

### Step-by-Step Flow

```
1. USER OPENS CREATE BOOKING DIALOG
   │
   └─→ Dialog opens on Step 1 (Schedule Selection)

2. USER SELECTS SCHEDULE
   │
   ├─→ Moves to Step 2 (Seat Selection)
   ├─→ Fetches seat data for schedule
   └─→ WebSocket connects for this schedule

3. WEBSOCKET CONNECTS
   │
   ├─→ Subscribes to /topic/schedule/{scheduleId}/seats
   ├─→ Shows "Live" indicator
   └─→ Logs: "✅ WebSocket connected for schedule: 1"

4. ANOTHER USER BOOKS A SEAT
   │
   ├─→ Backend publishes SEAT_BOOKED event
   └─→ Event sent to all subscribers

5. YOUR DIALOG RECEIVES UPDATE
   │
   ├─→ Logs full event data to console
   ├─→ Updates seat status (AVAILABLE → BOOKED)
   ├─→ Removes seat from your selection if you had it selected
   ├─→ Shows toast: "Seat A5 is now booked"
   └─→ UI updates immediately (seat turns gray/disabled)

6. USER CLOSES DIALOG
   │
   ├─→ WebSocket unsubscribes
   └─→ Connection cleaned up
```

---

## 🎨 UI Changes

### Before
```
┌─────────────────────────────────────────┐
│ Create Booking - Step 2 of 3           │
└─────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────┐
│ Create Booking - Step 2 of 3  🟢 Live  │
│ • Real-time updates enabled             │
└─────────────────────────────────────────┘
```

---

## 📝 Code Changes

### File Modified
`src/features/bookings/components/CreateBookingDialog/CreateBookingDialog.jsx`

### Changes Made

1. **Added Imports:**
```javascript
import { Wifi, WifiOff } from 'lucide-react';
import { useSeatWebSocket } from '../../hooks/useSeatWebSocket';
```

2. **Added State:**
```javascript
const [wsConnected, setWsConnected] = useState(false);
```

3. **Added WebSocket Hook:**
```javascript
const { isConnected } = useSeatWebSocket(
  formData.scheduleId ? parseInt(formData.scheduleId) : null,
  handleSeatUpdate,
  open && step === 2 && formData.scheduleId
);
```

4. **Added Event Handler:**
```javascript
const handleSeatUpdate = useCallback((data) => {
  // Detailed console logging
  console.log('🔔 SEAT UPDATE RECEIVED');
  console.log('📦 Full Event Data:', JSON.stringify(data, null, 2));
  
  // Update seat status
  setScheduleSeats(prevSeats => {
    return prevSeats.map(seat => {
      if (seat.id === data.seatId) {
        return { ...seat, status: data.status, bookingId: data.bookingId };
      }
      return seat;
    });
  });
  
  // Remove from selection if booked
  if (data.type === 'SEAT_BOOKED') {
    setSelectedSeats(prev => prev.filter(s => s.id !== data.seatId));
  }
  
  // Show toast notification
  addToast({ message: `Seat ${data.seatNumber} is now ${data.status}` });
}, [addToast]);
```

5. **Added UI Indicator:**
```javascript
{step === 2 && (
  <span className="flex items-center gap-1">
    {wsConnected ? (
      <>
        <Wifi className="w-4 h-4 text-green-500" />
        <span className="text-green-500">Live</span>
      </>
    ) : (
      <>
        <WifiOff className="w-4 h-4 text-slate-400" />
        <span className="text-slate-400">Offline</span>
      </>
    )}
  </span>
)}
```

---

## 🧪 Testing

### How to Test

1. **Open Create Booking Dialog**
   - Click "Create Booking" button on BookingsPage

2. **Select a Schedule**
   - Choose any schedule from Step 1
   - Click to proceed to Step 2

3. **Check WebSocket Status**
   - Look for "Live" indicator in dialog title
   - Should see green Wifi icon

4. **Open Browser Console**
   - Press F12
   - Go to Console tab
   - Should see: "✅ WebSocket connected for schedule: X"

5. **Test Real-Time Updates**
   - Have another user (or use mobile app) book a seat
   - Watch the console for detailed logs
   - See the seat status update in real-time
   - See toast notification appear

6. **Test Seat Removal**
   - Select a seat (click on it)
   - Have another user book that same seat
   - Your selection should be automatically removed
   - Toast notification: "Seat X was just booked by another user"

---

## 📊 Console Log Examples

### When WebSocket Connects
```
✅ WebSocket connected for schedule: 1
[WebSocket] Stored user: Found
[WebSocket] Token extracted: eyJhbGciOiJIUzI1NiIs...
[WebSocket] Connecting with token: Present
[WebSocket] Creating SockJS connection to: http://localhost:8080/bus-service/ws/bus?token=***TOKEN***
STOMP Debug: Opening Web Socket...
STOMP Debug: Web Socket Opened...
STOMP Debug: >>> CONNECT
STOMP Debug: <<< CONNECTED
[WebSocket] Connected successfully
Subscribed to topic: /topic/schedule/1/seats
```

### When Seat is Booked
```
═══════════════════════════════════════════════════
🔔 SEAT UPDATE RECEIVED IN CREATE BOOKING DIALOG
═══════════════════════════════════════════════════
📦 Full Event Data: {
  "type": "SEAT_BOOKED",
  "scheduleId": 1,
  "seatId": 5,
  "seatNumber": "A5",
  "bookingId": 123,
  "status": "BOOKED",
  "timestamp": "2026-04-13T10:30:00"
}
📋 Event Details:
  - Type: SEAT_BOOKED
  - Schedule ID: 1
  - Seat ID: 5
  - Seat Number: A5
  - Booking ID: 123
  - Status: BOOKED
  - Timestamp: 2026-04-13T10:30:00
═══════════════════════════════════════════════════
🔄 Updating seat status...
  - Previous seats count: 25
  ✅ Found matching seat: A5
    - Old status: AVAILABLE
    - New status: BOOKED
  - Updated seats count: 25
```

### When Seat is Released
```
═══════════════════════════════════════════════════
🔔 SEAT UPDATE RECEIVED IN CREATE BOOKING DIALOG
═══════════════════════════════════════════════════
📦 Full Event Data: {
  "type": "SEAT_RELEASED",
  "scheduleId": 1,
  "seatId": 5,
  "seatNumber": "A5",
  "bookingId": null,
  "status": "AVAILABLE",
  "timestamp": "2026-04-13T10:35:00"
}
📋 Event Details:
  - Type: SEAT_RELEASED
  - Schedule ID: 1
  - Seat ID: 5
  - Seat Number: A5
  - Booking ID: null
  - Status: AVAILABLE
  - Timestamp: 2026-04-13T10:35:00
═══════════════════════════════════════════════════
🔄 Updating seat status...
  - Previous seats count: 25
  ✅ Found matching seat: A5
    - Old status: BOOKED
    - New status: AVAILABLE
  - Updated seats count: 25
```

---

## 🎯 Features

### Real-Time Updates
- ✅ Seat status updates instantly
- ✅ No page refresh needed
- ✅ Works across multiple users
- ✅ Automatic seat deselection if booked by others

### User Experience
- ✅ Visual connection indicator
- ✅ Toast notifications for changes
- ✅ Detailed console logs for debugging
- ✅ Smooth UI updates

### Smart Behavior
- ✅ Only connects when on Step 2 (seat selection)
- ✅ Automatically disconnects when dialog closes
- ✅ Reconnects if connection is lost
- ✅ Handles multiple simultaneous updates

---

## 🔍 Debugging

### Check WebSocket Connection
```javascript
// In browser console
console.log('Connected:', websocketService.isConnected());
```

### Check Subscriptions
```javascript
// In browser console
console.log('Subscriptions:', websocketService.subscriptions);
```

### Check Current Schedule
```javascript
// In browser console
// Look for logs like:
"✅ WebSocket connected for schedule: 1"
```

---

## 📋 Summary

**What was added:**
- Real-time seat updates via WebSocket
- Visual connection status indicator
- Detailed console logging
- Toast notifications
- Automatic seat deselection

**Where it works:**
- Create Booking Dialog - Step 2 (Seat Selection)

**When it's active:**
- Only when dialog is open
- Only on Step 2
- Only when a schedule is selected

**What you'll see:**
- "Live" indicator when connected
- Real-time seat status changes
- Toast notifications
- Detailed console logs

**Files modified:**
- `src/features/bookings/components/CreateBookingDialog/CreateBookingDialog.jsx`

---

## 🎉 Result

Now when you're selecting seats in the Create Booking dialog, you'll see real-time updates as other users book or release seats. The UI updates instantly, and you'll get notifications about changes. All events are logged to the console with detailed information for debugging!
