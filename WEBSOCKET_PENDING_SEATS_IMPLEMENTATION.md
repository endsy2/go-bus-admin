# WebSocket Pending Seats Implementation Guide

## 🎯 Goal

When a user clicks on a seat to select it:
1. Mark the seat as "PENDING" in the database
2. Change the seat color to yellow/orange (pending state)
3. Broadcast this change to all other users via WebSocket
4. Prevent other users from selecting the same seat

---

## 🔧 Required Changes

### Backend Changes (Required First!)

Your backend developer needs to implement these endpoints and WebSocket events:

#### 1. New API Endpoint: Reserve Seat (Mark as PENDING)

```java
@PostMapping("/api/schedule-seats/{seatId}/reserve")
public ResponseEntity<?> reserveSeat(
    @PathVariable Long seatId,
    @RequestHeader("Authorization") String token
) {
    // 1. Validate JWT token and get user
    String userId = jwtTokenProvider.getUserIdFromToken(token);
    
    // 2. Find the seat
    ScheduleSeat seat = scheduleSeatRepository.findById(seatId)
        .orElseThrow(() -> new NotFoundException("Seat not found"));
    
    // 3. Check if seat is available
    if (!seat.getStatus().equals("AVAILABLE")) {
        throw new BadRequestException("Seat is not available");
    }
    
    // 4. Mark as PENDING with expiration (e.g., 5 minutes)
    seat.setStatus("PENDING");
    seat.setReservedBy(userId);
    seat.setReservedAt(LocalDateTime.now());
    seat.setReservationExpiry(LocalDateTime.now().plusMinutes(5));
    scheduleSeatRepository.save(seat);
    
    // 5. Broadcast SEAT_PENDING event via WebSocket
    SeatUpdateEvent event = new SeatUpdateEvent(
        "SEAT_PENDING",
        seat.getSchedule().getId(),
        seat.getId(),
        seat.getSeatNumber(),
        null, // No booking ID yet
        "PENDING",
        LocalDateTime.now()
    );
    messagingTemplate.convertAndSend(
        "/topic/schedule/" + seat.getSchedule().getId() + "/seats",
        event
    );
    
    return ResponseEntity.ok(seat);
}
```

#### 2. New API Endpoint: Release Seat (Cancel PENDING)

```java
@PostMapping("/api/schedule-seats/{seatId}/release")
public ResponseEntity<?> releaseSeat(
    @PathVariable Long seatId,
    @RequestHeader("Authorization") String token
) {
    // 1. Validate JWT token and get user
    String userId = jwtTokenProvider.getUserIdFromToken(token);
    
    // 2. Find the seat
    ScheduleSeat seat = scheduleSeatRepository.findById(seatId)
        .orElseThrow(() -> new NotFoundException("Seat not found"));
    
    // 3. Check if seat is pending and reserved by this user
    if (!seat.getStatus().equals("PENDING") || 
        !seat.getReservedBy().equals(userId)) {
        throw new BadRequestException("Cannot release this seat");
    }
    
    // 4. Mark as AVAILABLE
    seat.setStatus("AVAILABLE");
    seat.setReservedBy(null);
    seat.setReservedAt(null);
    seat.setReservationExpiry(null);
    scheduleSeatRepository.save(seat);
    
    // 5. Broadcast SEAT_RELEASED event via WebSocket
    SeatUpdateEvent event = new SeatUpdateEvent(
        "SEAT_RELEASED",
        seat.getSchedule().getId(),
        seat.getId(),
        seat.getSeatNumber(),
        null,
        "AVAILABLE",
        LocalDateTime.now()
    );
    messagingTemplate.convertAndSend(
        "/topic/schedule/" + seat.getSchedule().getId() + "/seats",
        event
    );
    
    return ResponseEntity.ok(seat);
}
```

#### 3. Update Booking Creation

When creating a booking, verify seats are PENDING and reserved by the user:

```java
@PostMapping("/api/bookings")
public ResponseEntity<?> createBooking(@RequestBody BookingRequest request) {
    // ... existing code ...
    
    // Verify all seats are PENDING and reserved by this user
    for (Long seatId : request.getSeatIds()) {
        ScheduleSeat seat = scheduleSeatRepository.findById(seatId)
            .orElseThrow(() -> new NotFoundException("Seat not found"));
        
        if (!seat.getStatus().equals("PENDING") || 
            !seat.getReservedBy().equals(userId)) {
            throw new BadRequestException("Seat " + seat.getSeatNumber() + " is not reserved by you");
        }
    }
    
    // ... create booking ...
    
    // Mark seats as BOOKED
    for (Long seatId : request.getSeatIds()) {
        ScheduleSeat seat = scheduleSeatRepository.findById(seatId).get();
        seat.setStatus("BOOKED");
        seat.setBookingId(booking.getId());
        scheduleSeatRepository.save(seat);
        
        // Broadcast SEAT_BOOKED event
        // ... existing code ...
    }
}
```

#### 4. Scheduled Task: Auto-Release Expired Reservations

```java
@Scheduled(fixedRate = 60000) // Run every minute
public void releaseExpiredReservations() {
    List<ScheduleSeat> expiredSeats = scheduleSeatRepository
        .findByStatusAndReservationExpiryBefore("PENDING", LocalDateTime.now());
    
    for (ScheduleSeat seat : expiredSeats) {
        seat.setStatus("AVAILABLE");
        seat.setReservedBy(null);
        seat.setReservedAt(null);
        seat.setReservationExpiry(null);
        scheduleSeatRepository.save(seat);
        
        // Broadcast SEAT_RELEASED event
        SeatUpdateEvent event = new SeatUpdateEvent(
            "SEAT_RELEASED",
            seat.getSchedule().getId(),
            seat.getId(),
            seat.getSeatNumber(),
            null,
            "AVAILABLE",
            LocalDateTime.now()
        );
        messagingTemplate.convertAndSend(
            "/topic/schedule/" + seat.getSchedule().getId() + "/seats",
            event
        );
    }
}
```

#### 5. New WebSocket Event Type

Add to your `SeatUpdateEvent` class:

```java
public class SeatUpdateEvent {
    private String type; // "SEAT_BOOKED", "SEAT_RELEASED", "SEAT_PENDING"
    private Long scheduleId;
    private Long seatId;
    private String seatNumber;
    private Long bookingId;
    private String status; // "AVAILABLE", "PENDING", "BOOKED"
    private String reservedBy; // User ID who reserved it
    private LocalDateTime timestamp;
    
    // ... getters and setters ...
}
```

---

### Frontend Changes (After Backend is Ready)

Once the backend is implemented, update the frontend:

#### 1. Add API Service Methods

```javascript
// src/features/bookings/services/bookingService.js

const reserveSeat = async (seatId) => {
  const response = await api.post(`/schedule-seats/${seatId}/reserve`);
  return response.data;
};

const releaseSeat = async (seatId) => {
  const response = await api.post(`/schedule-seats/${seatId}/release`);
  return response.data;
};

export default {
  // ... existing methods ...
  reserveSeat,
  releaseSeat,
};
```

#### 2. Update handleSeatToggle in CreateBookingDialog

```javascript
const handleSeatToggle = async (scheduleSeatId, seatNumber, currentStatus) => {
  const isSelected = selectedSeats.find(s => s.id === scheduleSeatId);
  
  try {
    if (isSelected) {
      // User is deselecting - release the seat
      console.log('🔓 Releasing seat:', seatNumber);
      await bookingService.releaseSeat(scheduleSeatId);
      
      setSelectedSeats(prev => prev.filter(s => s.id !== scheduleSeatId));
      
      // WebSocket will broadcast SEAT_RELEASED event
      // Other users will see it become available
    } else {
      // User is selecting - reserve the seat
      console.log('🔒 Reserving seat:', seatNumber);
      await bookingService.reserveSeat(scheduleSeatId);
      
      setSelectedSeats(prev => [...prev, { id: scheduleSeatId, seatNumber }]);
      
      // WebSocket will broadcast SEAT_PENDING event
      // Other users will see it as pending
    }
  } catch (error) {
    console.error('Failed to toggle seat:', error);
    addToast({
      message: error.response?.data?.message || 'Failed to select seat',
      type: 'error'
    });
  }
};
```

#### 3. Update Seat Color Logic

```javascript
// In the seat rendering section
const getSeatColor = (scheduleSeat, isSelected) => {
  if (isSelected) {
    return 'bg-blue-500 text-white border-blue-600'; // Selected by current user
  }
  
  switch (scheduleSeat.status) {
    case 'AVAILABLE':
      return 'bg-green-500 text-white border-green-600 hover:bg-green-600';
    case 'PENDING':
      return 'bg-yellow-500 text-white border-yellow-600 cursor-not-allowed'; // Pending by another user
    case 'BOOKED':
      return 'bg-slate-600 text-slate-400 border-slate-700 cursor-not-allowed';
    default:
      return 'bg-slate-300 text-slate-600 border-slate-400';
  }
};

// In the button rendering
<button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    if (scheduleSeat.status === 'AVAILABLE' || isSelected) {
      handleSeatToggle(scheduleSeat.id, scheduleSeat.seatNumber, scheduleSeat.status);
    }
  }}
  disabled={scheduleSeat.status === 'BOOKED' || 
           (scheduleSeat.status === 'PENDING' && !isSelected)}
  className={`
    relative w-12 h-12 rounded-lg border-2 transition-all
    flex flex-col items-center justify-center
    ${getSeatColor(scheduleSeat, isSelected)}
    ${(scheduleSeat.status === 'BOOKED' || 
       (scheduleSeat.status === 'PENDING' && !isSelected)) 
      ? 'cursor-not-allowed opacity-60' 
      : 'cursor-pointer hover:scale-105'}
  `}
>
  <Armchair className="w-5 h-5" />
  <span className="text-xs font-mono mt-1">{scheduleSeat.seatNumber}</span>
</button>
```

#### 4. Update WebSocket Event Handler

```javascript
const handleSeatUpdate = useCallback((data) => {
  console.log('═══════════════════════════════════════════════════');
  console.log('🔔 SEAT UPDATE RECEIVED');
  console.log('═══════════════════════════════════════════════════');
  console.log('📦 Event Data:', JSON.stringify(data, null, 2));
  
  // Update seat status
  setScheduleSeats(prevSeats => {
    return prevSeats.map(seat => {
      if (seat.id === data.seatId) {
        console.log(`  ✅ Updating seat ${seat.seatNumber}: ${seat.status} → ${data.status}`);
        return {
          ...seat,
          status: data.status,
          bookingId: data.bookingId,
          reservedBy: data.reservedBy
        };
      }
      return seat;
    });
  });

  // Handle different event types
  if (data.type === 'SEAT_PENDING') {
    addToast({
      message: `Seat ${data.seatNumber} is being selected by another user`,
      type: 'info'
    });
    
    // Remove from selection if current user had it selected
    setSelectedSeats(prev => prev.filter(s => s.id !== data.seatId));
  } else if (data.type === 'SEAT_BOOKED') {
    addToast({
      message: `Seat ${data.seatNumber} has been booked`,
      type: 'warning'
    });
    
    setSelectedSeats(prev => prev.filter(s => s.id !== data.seatId));
  } else if (data.type === 'SEAT_RELEASED') {
    addToast({
      message: `Seat ${data.seatNumber} is now available`,
      type: 'success'
    });
  }
}, [addToast]);
```

#### 5. Add Legend for Seat Colors

```javascript
{/* Seat Legend */}
<div className="flex flex-wrap gap-4 text-sm">
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-green-500 rounded border-2 border-green-600"></div>
    <span className="text-slate-700 dark:text-slate-300">Available</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-blue-500 rounded border-2 border-blue-600"></div>
    <span className="text-slate-700 dark:text-slate-300">Selected (You)</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-yellow-500 rounded border-2 border-yellow-600"></div>
    <span className="text-slate-700 dark:text-slate-300">Pending (Others)</span>
  </div>
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 bg-slate-600 rounded border-2 border-slate-700"></div>
    <span className="text-slate-700 dark:text-slate-300">Booked</span>
  </div>
</div>
```

---

## 🎨 Color Scheme

- **Green** (`bg-green-500`): Available seats
- **Blue** (`bg-blue-500`): Selected by current user
- **Yellow** (`bg-yellow-500`): Pending (selected by another user)
- **Gray** (`bg-slate-600`): Booked (confirmed booking)

---

## 🔄 Complete Flow

```
USER A CLICKS SEAT
│
├─→ Frontend calls POST /api/schedule-seats/5/reserve
│
├─→ Backend marks seat as PENDING
│
├─→ Backend broadcasts SEAT_PENDING event via WebSocket
│
├─→ USER A sees seat turn BLUE (selected)
│
└─→ USER B sees seat turn YELLOW (pending by someone else)

USER A DESELECTS SEAT
│
├─→ Frontend calls POST /api/schedule-seats/5/release
│
├─→ Backend marks seat as AVAILABLE
│
├─→ Backend broadcasts SEAT_RELEASED event via WebSocket
│
├─→ USER A sees seat turn GREEN (available)
│
└─→ USER B sees seat turn GREEN (available)

USER A CONFIRMS BOOKING
│
├─→ Frontend calls POST /api/bookings
│
├─→ Backend verifies seats are PENDING and reserved by USER A
│
├─→ Backend marks seats as BOOKED
│
├─→ Backend broadcasts SEAT_BOOKED event via WebSocket
│
├─→ USER A sees confirmation
│
└─→ USER B sees seats turn GRAY (booked)

RESERVATION EXPIRES (5 minutes)
│
├─→ Backend scheduled task finds expired PENDING seats
│
├─→ Backend marks seats as AVAILABLE
│
├─→ Backend broadcasts SEAT_RELEASED event via WebSocket
│
└─→ All users see seats turn GREEN (available again)
```

---

## 📋 Implementation Checklist

### Backend (Required First!)
- [ ] Add `reservedBy`, `reservedAt`, `reservationExpiry` fields to ScheduleSeat entity
- [ ] Create POST `/api/schedule-seats/{id}/reserve` endpoint
- [ ] Create POST `/api/schedule-seats/{id}/release` endpoint
- [ ] Update booking creation to verify PENDING seats
- [ ] Add SEAT_PENDING event type to WebSocket
- [ ] Implement scheduled task to auto-release expired reservations
- [ ] Test API endpoints
- [ ] Test WebSocket broadcasts

### Frontend (After Backend is Ready)
- [ ] Add `reserveSeat` and `releaseSeat` to bookingService
- [ ] Update `handleSeatToggle` to call API
- [ ] Add PENDING status color (yellow)
- [ ] Update seat rendering logic
- [ ] Update WebSocket event handler for SEAT_PENDING
- [ ] Add seat color legend
- [ ] Test seat selection
- [ ] Test real-time updates across multiple users

---

## 🎯 Summary

**Current Behavior:**
- User clicks seat → Only local state updates
- Other users don't see the selection
- No reservation system

**New Behavior:**
- User clicks seat → API call to reserve → WebSocket broadcast
- Other users see seat as PENDING (yellow)
- Seat is reserved for 5 minutes
- Auto-release if not confirmed
- Real-time updates for all users

**Backend work required:** ~4-6 hours
**Frontend work required:** ~2-3 hours (after backend is ready)

---

## 📞 Next Steps

1. **Backend Developer**: Implement the 4 endpoints and WebSocket events
2. **Test Backend**: Use Postman to test reserve/release endpoints
3. **Frontend Developer**: Update CreateBookingDialog with new logic
4. **Test Together**: Test real-time updates with multiple users

This will give you a complete seat reservation system with real-time updates!
