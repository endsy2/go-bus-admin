# WebSocket Pending Seats - localStorage Persistence

## 🎯 Feature Overview
User seat selections are now persisted in localStorage, allowing users to:
1. Select seats
2. Close the dialog or navigate away
3. Come back later and see their pending seats automatically selected
4. Either deselect them OR proceed with booking

---

## 💾 localStorage Structure

### Key: `pendingSeatSelection`

### Value Structure:
```json
{
  "userId": 789,
  "scheduleId": 123,
  "seats": [
    {
      "id": 456,
      "seatNumber": "A1"
    },
    {
      "id": 457,
      "seatNumber": "A2"
    }
  ],
  "timestamp": "2026-04-20T10:30:00.000Z"
}
```

---

## 🔄 How It Works

### 1. When User Selects a Seat

**Location:** `handleSeatToggle()` function

```javascript
// After adding seat to selectedSeats
const pendingSelection = {
  userId: currentUserId,
  scheduleId: parseInt(formData.scheduleId),
  seats: updated,
  timestamp: new Date().toISOString()
};
localStorage.setItem('pendingSeatSelection', JSON.stringify(pendingSelection));
console.log('💾 Selection saved to localStorage');
```

**What happens:**
- User clicks on an available seat
- Seat is added to `selectedSeats` state
- Selection is saved to localStorage with user ID and schedule ID
- Seat turns blue (pulsing)

### 2. When User Deselects a Seat

**Location:** `handleSeatToggle()` function

```javascript
// After removing seat from selectedSeats
if (updated.length > 0) {
  // Still have seats selected - update localStorage
  const pendingSelection = {
    userId: currentUserId,
    scheduleId: parseInt(formData.scheduleId),
    seats: updated,
    timestamp: new Date().toISOString()
  };
  localStorage.setItem('pendingSeatSelection', JSON.stringify(pendingSelection));
  console.log('💾 Selection saved to localStorage');
} else {
  // No seats selected - remove from localStorage
  localStorage.removeItem('pendingSeatSelection');
  console.log('💾 Removed selection from localStorage (no seats selected)');
}
```

**What happens:**
- User clicks on a selected seat (blue)
- Seat is removed from `selectedSeats` state
- If no seats remain, localStorage is cleared
- If seats remain, localStorage is updated
- Seat turns green (available)

### 3. When User Reopens Dialog

**Location:** `fetchBusDetails()` function

```javascript
// First, check backend for pending seats
const myPendingSeats = seats.filter(
  seat => seat.status === 'PENDING' && seat.pendingUserId === currentUserId
);

if (myPendingSeats.length > 0) {
  // Backend has pending seats - use those
  setSelectedSeats(myPendingSeats.map(seat => ({
    id: seat.id,
    seatNumber: seat.seatNumber
  })));
  
  // Save to localStorage
  localStorage.setItem('pendingSeatSelection', JSON.stringify({
    userId: currentUserId,
    scheduleId: scheduleId,
    seats: selectedSeatsData,
    timestamp: new Date().toISOString()
  }));
} else {
  // No backend pending seats - check localStorage
  const storedSelection = localStorage.getItem('pendingSeatSelection');
  if (storedSelection) {
    const parsed = JSON.parse(storedSelection);
    
    // Only restore if same user and same schedule
    if (parsed.userId === currentUserId && parsed.scheduleId === parseInt(scheduleId)) {
      // Verify seats still exist and are available
      const validSeats = parsed.seats.filter(storedSeat => {
        const seat = seats.find(s => s.id === storedSeat.id);
        return seat && (seat.status === 'AVAILABLE' || 
                       (seat.status === 'PENDING' && seat.pendingUserId === currentUserId));
      });
      
      if (validSeats.length > 0) {
        setSelectedSeats(validSeats);
        console.log('📦 Restored', validSeats.length, 'valid seats from localStorage');
      } else {
        // Seats no longer valid (booked by someone else)
        localStorage.removeItem('pendingSeatSelection');
      }
    }
  }
}
```

**What happens:**
1. User opens Create Booking Dialog
2. Selects a schedule
3. System fetches seat data from backend
4. **Priority 1:** Check if backend has PENDING seats by this user
   - If yes: Auto-select those seats and save to localStorage
5. **Priority 2:** If no backend pending seats, check localStorage
   - If localStorage has selection for this user + schedule: Restore it
   - Validate each seat is still available/pending
   - Remove invalid seats (already booked)
6. User sees their previous selection automatically selected (blue)
7. User can deselect or proceed to booking

### 4. When User Completes Booking

**Location:** `handleSubmit()` function

```javascript
await bookingService.createBooking(payload);

// Clear localStorage after successful booking
localStorage.removeItem('pendingSeatSelection');
console.log('💾 Cleared pending selection from localStorage (booking completed)');
```

**What happens:**
- User completes booking
- Seats are marked as BOOKED in backend
- localStorage is cleared (no longer needed)
- Dialog closes and resets

---

## 🔍 Console Logging

### When Saving to localStorage:
```
💾 Selection saved to localStorage
```

### When Removing from localStorage:
```
💾 Removed selection from localStorage (no seats selected)
```

### When Restoring from localStorage:
```
📦 ═══════════════════════════════════════════════
📦 RESTORING SELECTION FROM LOCALSTORAGE
📦 ═══════════════════════════════════════════════
📦 User ID: 789
📦 Schedule ID: 123
📦 Seats: A1, A2
📦 Timestamp: 2026-04-20T10:30:00.000Z
📦 Restored 2 valid seats
📦 ═══════════════════════════════════════════════
```

### When Clearing after Booking:
```
💾 Cleared pending selection from localStorage (booking completed)
```

---

## 🧪 Testing Scenarios

### Scenario 1: Basic Selection Persistence
1. Open Create Booking Dialog
2. Select schedule
3. Click on seat A1 (turns blue)
4. Close dialog
5. Reopen dialog
6. Select same schedule
7. **Expected:** Seat A1 is automatically selected (blue)

### Scenario 2: Multiple Seats
1. Select schedule
2. Click seats A1, A2, A3 (all turn blue)
3. Close dialog
4. Reopen dialog
5. Select same schedule
6. **Expected:** All 3 seats automatically selected (blue)

### Scenario 3: Deselect and Persist
1. Select schedule
2. Click seats A1, A2 (both blue)
3. Click A1 again to deselect (turns green)
4. Close dialog
5. Reopen dialog
6. Select same schedule
7. **Expected:** Only A2 is selected (blue), A1 is available (green)

### Scenario 4: Different Schedule
1. Select schedule 1
2. Click seat A1 (blue)
3. Close dialog
4. Reopen dialog
5. Select schedule 2 (different schedule)
6. **Expected:** No seats selected (localStorage only applies to schedule 1)

### Scenario 5: Different User
1. User A selects seat A1 on schedule 1
2. User A logs out
3. User B logs in
4. User B opens dialog and selects schedule 1
5. **Expected:** No seats selected for User B (localStorage is user-specific)

### Scenario 6: Seat Booked by Someone Else
1. User A selects seat A1 (blue)
2. User A closes dialog
3. User B books seat A1
4. User A reopens dialog
5. **Expected:** Seat A1 is NOT selected (already booked), localStorage is cleared

### Scenario 7: Complete Booking
1. Select schedule
2. Click seats A1, A2 (both blue)
3. Click Next
4. Complete booking
5. Close dialog
6. Reopen dialog
7. Select same schedule
8. **Expected:** No seats selected (localStorage cleared after booking)

### Scenario 8: Page Refresh
1. Select schedule
2. Click seat A1 (blue)
3. Refresh the page (F5)
4. Open Create Booking Dialog
5. Select same schedule
6. **Expected:** Seat A1 is automatically selected (localStorage persists across page refreshes)

---

## 🔐 Security & Privacy

### User Isolation
- Each selection is tied to a specific `userId`
- Users cannot see or restore other users' selections
- localStorage is browser-specific (not shared across devices)

### Schedule Isolation
- Each selection is tied to a specific `scheduleId`
- Selections don't carry over to different schedules
- Prevents accidental seat selection on wrong schedule

### Validation
- Before restoring, system validates:
  1. User ID matches current user
  2. Schedule ID matches selected schedule
  3. Seats still exist in backend
  4. Seats are AVAILABLE or PENDING by current user
- Invalid seats are filtered out
- If no valid seats remain, localStorage is cleared

---

## 🎯 Benefits

### For Users
1. **Convenience:** Don't lose selection when closing dialog
2. **Flexibility:** Can browse other pages and come back
3. **Peace of Mind:** Selections are preserved across page refreshes
4. **Control:** Can always deselect or change selection

### For System
1. **Better UX:** Seamless experience across sessions
2. **Reduced Friction:** Users don't have to re-select seats
3. **Persistence:** Works even if backend pending status expires
4. **Fallback:** localStorage acts as backup if backend loses state

---

## 🔄 Integration with Backend

### Priority Order:
1. **Backend PENDING status** (highest priority)
   - If backend says seat is PENDING by this user, use that
   - This is the source of truth
   
2. **localStorage** (fallback)
   - If backend has no pending seats, check localStorage
   - Useful if backend pending status expired but user wants to continue
   
3. **Validation** (safety check)
   - Always validate localStorage data against current backend state
   - Remove invalid seats (already booked)

### Why Both?
- **Backend:** Source of truth, shared across devices/browsers
- **localStorage:** Faster, works offline, persists across page refreshes
- **Together:** Best of both worlds - reliability + convenience

---

## 📝 Summary

The localStorage persistence feature ensures users never lose their seat selections, even when:
- Closing the dialog
- Navigating to other pages
- Refreshing the browser
- Coming back hours later

The system intelligently combines backend PENDING status with localStorage to provide the best user experience while maintaining data integrity and security.

All selections are user-specific, schedule-specific, and validated before restoration to prevent any conflicts or errors.
