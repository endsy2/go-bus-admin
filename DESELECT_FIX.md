# Deselect Fix - Allow Current User to Deselect Their Pending Seats

## 🐛 Problem

When you reopened the dialog and your pending seats were auto-selected, you could NOT deselect them. The seats were blue (selected) but clicking on them did nothing.

## 🔍 Root Cause

The `handleSeatToggle` function had a check that blocked clicking on seats with `status === 'PENDING'` if `pendingUserId !== currentUserId`. 

The problem was the order of checks:

```javascript
// OLD CODE (BROKEN):
// Check if seat is pending by another user
if (scheduleSeat.status === 'PENDING' && scheduleSeat.pendingUserId !== currentUserId) {
  console.warn('⚠️ Seat is pending by another user');
  addToast({ message: 'This seat is being selected by another user', type: 'warning' });
  return; // ❌ BLOCKS ALL PENDING SEATS
}

const exists = selectedSeats.find(s => s.id === scheduleSeatId);
```

This blocked ALL pending seats before checking if the seat was in your local selection.

## ✅ Solution

Move the `exists` check BEFORE the pending check, and only block if the seat is NOT in your selection:

```javascript
// NEW CODE (FIXED):
const exists = selectedSeats.find(s => s.id === scheduleSeatId);

// Check if seat is pending by another user (but allow if already in our selection)
if (!exists && scheduleSeat.status === 'PENDING' && scheduleSeat.pendingUserId !== currentUserId) {
  console.warn('⚠️ Seat is pending by another user');
  addToast({ message: 'This seat is being selected by another user', type: 'warning' });
  return; // ✅ ONLY BLOCKS SEATS NOT IN YOUR SELECTION
}
```

## 🎯 How It Works Now

### Scenario 1: Your Pending Seat (Auto-Selected)
```
1. You reopen dialog
2. Seat A1 is PENDING by you (backend)
3. Seat A1 is auto-selected (in selectedSeats array)
4. You click seat A1
5. exists = true (seat is in selectedSeats)
6. Pending check is skipped (!exists is false)
7. ✅ Seat is deselected successfully
```

### Scenario 2: Another User's Pending Seat
```
1. User B has seat A2 pending
2. Seat A2 is PENDING by User B (backend)
3. Seat A2 is NOT in your selectedSeats
4. You click seat A2
5. exists = false (seat is NOT in selectedSeats)
6. Pending check runs (!exists is true)
7. scheduleSeat.pendingUserId !== currentUserId is true
8. ❌ Blocked with warning message
```

### Scenario 3: Available Seat
```
1. Seat A3 is AVAILABLE
2. You click seat A3
3. exists = false (not selected yet)
4. Pending check is skipped (status is not PENDING)
5. ✅ Seat is selected successfully
```

### Scenario 4: Your Selected Seat (Not Pending in Backend)
```
1. You selected seat A4 (blue)
2. Backend hasn't updated yet (still AVAILABLE)
3. You click seat A4 to deselect
4. exists = true (seat is in selectedSeats)
5. Pending check is skipped (!exists is false)
6. ✅ Seat is deselected successfully
```

## 🧪 Testing

### Test 1: Deselect Auto-Selected Pending Seat
1. Select schedule and click seat A1 (turns blue)
2. Close dialog
3. Reopen dialog and select same schedule
4. Seat A1 is auto-selected (blue)
5. Click seat A1
6. ✅ **Expected:** Seat A1 turns green (deselected)

### Test 2: Cannot Click Other User's Pending Seat
1. User A selects seat A1 (pending by User A)
2. User B opens dialog and selects same schedule
3. Seat A1 shows orange (pending by another user)
4. User B clicks seat A1
5. ✅ **Expected:** Warning message "This seat is being selected by another user"

### Test 3: Deselect Locally Selected Seat
1. Select schedule
2. Click seat A1 (turns blue)
3. Immediately click seat A1 again (before backend updates)
4. ✅ **Expected:** Seat A1 turns green (deselected)

## 📊 Console Logs

### When Deselecting Your Pending Seat:
```
═══════════════════════════════════════════════════
🎯 SEAT TOGGLE CLICKED
═══════════════════════════════════════════════════
📋 Details:
  - Seat Number: A1
  - Seat ID: 123
  - Current Status: PENDING
  - Pending User ID: 789
  - Current User ID: 789
  - WebSocket Connected: true
  - Send Message Available: true
═══════════════════════════════════════════════════

🔵 ═══════════════════════════════════════════════
🔵 DESELECTING SEAT
🔵 ═══════════════════════════════════════════════
🔵 Seat Number: A1
🔵 Seat ID: 123
🔵 Action: REMOVE from selection
🔵 Color Change: Blue → Green
🔵 Sending deselect message: {scheduleId: 1, seatId: 123, userId: 789}
🔵 Destination: /app/seat/deselect
🔵 Message sent: ✅ SUCCESS
🔵 ═══════════════════════════════════════════════

📊 Selected Seats Updated:
  - Before: A1
  - After: (empty)
  - Count: 0
💾 Removed selection from localStorage (no seats selected)
```

### When Clicking Another User's Pending Seat:
```
═══════════════════════════════════════════════════
🎯 SEAT TOGGLE CLICKED
═══════════════════════════════════════════════════
📋 Details:
  - Seat Number: A1
  - Seat ID: 123
  - Current Status: PENDING
  - Pending User ID: 456
  - Current User ID: 789
  - WebSocket Connected: true
  - Send Message Available: true
═══════════════════════════════════════════════════
⚠️ Seat is pending by another user
```

## 🎉 Summary

The fix ensures that:
- ✅ You can ALWAYS deselect seats in your local selection
- ✅ You can deselect auto-selected pending seats
- ✅ You CANNOT click seats pending by other users
- ✅ The check order prioritizes local state over backend state

This provides the best user experience while maintaining security and preventing conflicts.
