# Booking Velocity Chart Integration

## ✅ Integration Complete

The "Booking Trends" chart now displays real data from your backend API.

---

## 📁 Files Created/Updated

### 1. **dashboardService.js** (UPDATED)
Added `getBookingVelocity()` method

```javascript
dashboardService.getBookingVelocity({ fromDate, toDate })
```

### 2. **useBookingVelocity.js** (NEW)
**Location:** `src/features/dashboard/hooks/useBookingVelocity.js`

React hook for fetching booking velocity data

### 3. **DashboardPage.jsx** (UPDATED)
Replaced hardcoded chart data with real API data

---

## 🎯 API Endpoint

### Request
```
GET /api/admin/dashboard/velocity?fromDate={ISO_DATE}&toDate={ISO_DATE}
```

### Response Structure
```typescript
{
  status: 200,
  message: "Booking velocity trend retrieved successfully",
  data: [
    {
      date: "2026-04-20",
      normalBookings: 5,
      vipBookings: 0,
      sleeperBookings: 0,
      totalBookings: 5,
      normalRevenue: 0.07,
      vipRevenue: 0,
      sleeperRevenue: 0,
      totalRevenue: 0.07,
      normalPercentage: 100.0,
      vipPercentage: 0.0,
      sleeperPercentage: 0.0
    },
    // ... more days
  ]
}
```

---

## 📊 Chart Features

### Visual Representation

The chart now shows:
- **Blue bars** - Normal bookings
- **Green bars** - VIP bookings  
- **Purple bars** - Sleeper bookings
- **Stacked bars** - Multiple bus types per day

### Interactive Features

1. **Hover Tooltips**
   - Shows date
   - Total bookings
   - Breakdown by bus type

2. **Dynamic Scaling**
   - Automatically scales based on max bookings
   - Handles empty data gracefully

3. **Real-Time Data**
   - Updates when API data changes
   - Shows actual number of days

---

## 🎨 Chart Visualization

```
Day 1: ████████ (5 Normal, 0 VIP, 0 Sleeper)
Day 2: ██ (1 Normal, 0 VIP, 0 Sleeper)
```

Each bar is composed of stacked segments:
- Bottom (Blue) = Normal bookings
- Middle (Green) = VIP bookings
- Top (Purple) = Sleeper bookings

---

## 🔧 Usage

### Basic Usage (No Date Filter)
```javascript
const { velocityData, loading } = useBookingVelocity();

// velocityData = array of daily booking data
```

### With Date Range Filter
```javascript
const [fromDate, setFromDate] = useState('2026-04-01T00:00:00');
const [toDate, setToDate] = useState('2026-04-30T23:59:59');

const { velocityData, loading } = useBookingVelocity(fromDate, toDate);
```

### Access Specific Data
```javascript
const { velocityData } = useBookingVelocity();

velocityData.forEach(day => {
  console.log(`${day.date}: ${day.totalBookings} bookings`);
  console.log(`  Normal: ${day.normalBookings}`);
  console.log(`  VIP: ${day.vipBookings}`);
  console.log(`  Sleeper: ${day.sleeperBookings}`);
  console.log(`  Revenue: $${day.totalRevenue}`);
});
```

---

## 📈 Data Calculation

### Height Calculation
```javascript
const maxBookings = Math.max(...velocityData.map(d => d.totalBookings));
const normalHeight = (day.normalBookings / maxBookings) * 100;
```

This ensures:
- Tallest bar = 100% height
- Other bars scale proportionally
- Empty days show no bar

### Stacking Logic
```javascript
// Bars stack from bottom to top:
1. Normal (Blue) - Base layer
2. VIP (Green) - Middle layer
3. Sleeper (Purple) - Top layer
```

---

## 🎯 Example Data Flow

```
1. Page loads
   ↓
2. useBookingVelocity() called
   ↓
3. GET /api/admin/dashboard/velocity
   ↓
4. Backend returns array of daily data
   ↓
5. Chart renders with real data
   ↓
6. User hovers over bar
   ↓
7. Tooltip shows breakdown
```

---

## 🔍 Empty State Handling

If no data is available:
```javascript
{velocityData.length > 0 ? (
  // Show chart
) : (
  <div>No booking data available</div>
)}
```

---

## 🎨 Color Scheme

| Bus Type | Color | Hex Code |
|----------|-------|----------|
| Normal | Blue | `bg-blue-500` |
| VIP | Green | `bg-green-500` |
| Sleeper | Purple | `bg-purple-500` |

---

## 📊 Chart Dimensions

- **Height:** 256px (h-64)
- **Width:** Responsive (flex-1 per bar)
- **Gap:** 8px between bars
- **Bars:** Dynamic based on data length

---

## ✅ Summary

The Booking Trends chart now:
- ✅ Shows real data from API
- ✅ Displays 3 bus types (Normal, VIP, Sleeper)
- ✅ Stacks bookings per day
- ✅ Shows tooltips on hover
- ✅ Scales automatically
- ✅ Handles empty data
- ✅ Supports date range filtering
- ✅ Updates in real-time

The chart provides a clear visual representation of booking velocity across different bus types over time!
