# WebSocket Pending Seats - Troubleshooting Guide

## 🔍 Issue: Seat Selection Not Showing in Other Browser

When you select a seat in one browser, it should show as orange (being selected) in another browser, but it's not working.

---

## 📋 Diagnostic Steps

### Step 1: Check Browser Console Logs

Open the browser console (F12) in BOTH browsers and look for these logs:

#### When Clicking a Seat (Browser A):
```
═══════════════════════════════════════════════════
🎯 SEAT TOGGLE CLICKED
═══════════════════════════════════════════════════
📋 Details:
  - Seat Number: A1
  - Seat ID: 123
  - Current Status: AVAILABLE
  - Pending User ID: null
  - Current User ID: 789
  - WebSocket Connected: true
  - Send Message Available: true
═══════════════════════════════════════════════════
🟢 SELECTING SEAT
📤 Sending select message: {scheduleId: 1, seatId: 123, userId: 789}
📍 Destination: /app/seat/select
✅ Message sent: true
═══════════════════════════════════════════════════
```

#### Then in the sendMessage function:
```
═══════════════════════════════════════════════════
📨 SEND MESSAGE CALLED
═══════════════════════════════════════════════════
📍 Destination: /app/seat/select
📦 Body: {
  "scheduleId": 1,
  "seatId": 123,
  "userId": 789
}
🔌 WebSocket Connected: true
✅ Message sent successfully
═══════════════════════════════════════════════════
```

#### Then in websocketService:
```
[WebSocket] Sending message to /app/seat/select: {scheduleId: 1, seatId: 123, userId: 789}
[WebSocket] Message sent successfully
```

### Step 2: Check if Backend Receives the Message

The backend should log something like:
```
Received seat selection request: scheduleId=1, seatId=123, userId=789
```

### Step 3: Check if Backend Broadcasts Event

The backend should broadcast to `/topic/schedule/1/seats`:
```json
{
  "type": "SEAT_SELECTED",
  "scheduleId": 1,
  "seatId": 123,
  "seatNumber": "A1",
  "status": "PENDING",
  "userId": 789,
  "timestamp": "2026-04-14T10:30:00Z"
}
```

### Step 4: Check if Browser B Receives Event

Browser B should show:
```
═══════════════════════════════════════════════════
🔔 SEAT UPDATE RECEIVED IN CREATE BOOKING DIALOG
═══════════════════════════════════════════════════
📦 Full Event Data: {
  "type": "SEAT_SELECTED",
  "scheduleId": 1,
  "seatId": 123,
  "seatNumber": "A1",
  "status": "PENDING",
  "userId": 789,
  "timestamp": "2026-04-14T10:30:00Z"
}
═══════════════════════════════════════════════════
```

---

## 🚨 Common Issues

### Issue 1: Backend Endpoints Not Implemented ⚠️ MOST LIKELY

**Symptoms:**
- Browser A sends message successfully
- Browser B never receives any event
- No errors in console
- Backend logs show nothing

**Solution:**
Backend needs to implement these endpoints:

```java
@MessageMapping("/seat/select")
public void selectSeat(SeatSelectionRequest request) {
    // 1. Validate request
    // 2. Update seat status to PENDING
    // 3. Set pendingUserId and pendingAt
    // 4. Save to database
    // 5. Broadcast event to all subscribers
    
    SeatAvailabilityEvent event = new SeatAvailabilityEvent(
        "SEAT_SELECTED",
        request.getScheduleId(),
        request.getSeatId(),
        seat.getSeatNumber(),
        null,
        "PENDING",
        request.getUserId(),
        LocalDateTime.now()
    );
    
    messagingTemplate.convertAndSend(
        "/topic/schedule/" + request.getScheduleId() + "/seats",
        event
    );
}

@MessageMapping("/seat/deselect")
public void deselectSeat(SeatSelectionRequest request) {
    // Similar implementation but set status to AVAILABLE
}
```

### Issue 2: WebSocket Not Connected

**Symptoms:**
```
❌ WebSocket not connected or sendMessage not available
```

**Solution:**
- Check if "Live" indicator shows in dialog header
- Refresh the page
- Check backend WebSocket server is running on port 8080

### Issue 3: User ID Not Found

**Symptoms:**
```
Current User ID: null
```

**Solution:**
- Make sure user is logged in
- Check localStorage has 'user' key with token
- User object should have 'id' field

### Issue 4: Different Schedule IDs

**Symptoms:**
- Browser A subscribes to `/topic/schedule/1/seats`
- Browser B subscribes to `/topic/schedule/2/seats`
- They never see each other's updates

**Solution:**
- Make sure both browsers select the SAME schedule
- Check console logs for subscription topics

---

## 🧪 Manual Testing Steps

### Test 1: Verify Frontend Sends Messages

1. Open Browser A
2. Open Create Booking Dialog
3. Select a schedule
4. Open browser console (F12)
5. Click on a seat
6. Look for logs showing message sent
7. **Expected:** See "✅ Message sent successfully"

### Test 2: Verify Backend Receives Messages

1. Check backend console/logs
2. Click seat in Browser A
3. **Expected:** Backend logs "Received seat selection request"

### Test 3: Verify Backend Broadcasts Events

1. Check backend console/logs
2. Click seat in Browser A
3. **Expected:** Backend logs "Broadcasting SEAT_SELECTED event"

### Test 4: Verify Browser B Receives Events

1. Open Browser B (different window/incognito)
2. Login with different user
3. Open Create Booking Dialog
4. Select SAME schedule as Browser A
5. Open browser console (F12)
6. In Browser A, click a seat
7. **Expected:** Browser B console shows "🔔 SEAT UPDATE RECEIVED"
8. **Expected:** Browser B shows seat turn orange

---

## 🔧 Quick Backend Implementation

If backend is not implemented, here's a minimal working example:

### 1. Create Request DTO

```java
package com.example.dto;

public class SeatSelectionRequest {
    private Long scheduleId;
    private Long seatId;
    private Long userId;
    
    // Getters and setters
}
```

### 2. Create Event DTO

```java
package com.example.dto;

import java.time.LocalDateTime;

public class SeatAvailabilityEvent {
    private String type;
    private Long scheduleId;
    private Long seatId;
    private String seatNumber;
    private Long bookingId;
    private String status;
    private Long userId;
    private LocalDateTime timestamp;
    
    // Constructor, getters and setters
}
```

### 3. Create WebSocket Controller

```java
package com.example.controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.beans.factory.annotation.Autowired;

@Controller
public class SeatWebSocketController {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    @Autowired
    private ScheduleSeatRepository scheduleSeatRepository;
    
    @MessageMapping("/seat/select")
    public void selectSeat(SeatSelectionRequest request) {
        System.out.println("Received seat selection: " + request);
        
        // Find seat
        ScheduleSeat seat = scheduleSeatRepository.findById(request.getSeatId())
            .orElseThrow(() -> new RuntimeException("Seat not found"));
        
        // Update seat status
        seat.setStatus("PENDING");
        seat.setPendingUserId(request.getUserId());
        seat.setPendingAt(LocalDateTime.now());
        scheduleSeatRepository.save(seat);
        
        // Broadcast event
        SeatAvailabilityEvent event = new SeatAvailabilityEvent(
            "SEAT_SELECTED",
            request.getScheduleId(),
            request.getSeatId(),
            seat.getSeatNumber(),
            null,
            "PENDING",
            request.getUserId(),
            LocalDateTime.now()
        );
        
        String topic = "/topic/schedule/" + request.getScheduleId() + "/seats";
        System.out.println("Broadcasting to: " + topic);
        messagingTemplate.convertAndSend(topic, event);
    }
    
    @MessageMapping("/seat/deselect")
    public void deselectSeat(SeatSelectionRequest request) {
        System.out.println("Received seat deselection: " + request);
        
        // Find seat
        ScheduleSeat seat = scheduleSeatRepository.findById(request.getSeatId())
            .orElseThrow(() -> new RuntimeException("Seat not found"));
        
        // Update seat status
        seat.setStatus("AVAILABLE");
        seat.setPendingUserId(null);
        seat.setPendingAt(null);
        scheduleSeatRepository.save(seat);
        
        // Broadcast event
        SeatAvailabilityEvent event = new SeatAvailabilityEvent(
            "SEAT_DESELECTED",
            request.getScheduleId(),
            request.getSeatId(),
            seat.getSeatNumber(),
            null,
            "AVAILABLE",
            request.getUserId(),
            LocalDateTime.now()
        );
        
        String topic = "/topic/schedule/" + request.getScheduleId() + "/seats";
        System.out.println("Broadcasting to: " + topic);
        messagingTemplate.convertAndSend(topic, event);
    }
}
```

### 4. Add Database Columns

```sql
ALTER TABLE "ScheduleSeat" 
ADD COLUMN "pendingUserId" BIGINT,
ADD COLUMN "pendingAt" TIMESTAMP;
```

---

## ✅ Expected Behavior After Backend Implementation

1. **Browser A clicks seat:**
   - Seat turns blue (pulsing)
   - Console shows "Message sent successfully"

2. **Browser B sees update:**
   - Seat turns orange
   - Console shows "SEAT UPDATE RECEIVED"
   - Toast notification: "Seat A1 is being selected by another user"

3. **Browser A clicks seat again (deselect):**
   - Seat turns green
   - Console shows "Deselect message sent"

4. **Browser B sees update:**
   - Seat turns green
   - Console shows "SEAT UPDATE RECEIVED"
   - Toast notification: "Seat A1 is now available"

---

## 📞 Need Help?

If you're still having issues:

1. Share the console logs from both browsers
2. Share the backend logs
3. Confirm backend endpoints are implemented
4. Check if both browsers are on the same schedule

The frontend is working correctly - the issue is that the backend needs to implement the message handlers and broadcast the events!
