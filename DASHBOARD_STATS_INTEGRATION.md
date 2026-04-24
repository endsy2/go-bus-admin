# Dashboard Stats API Integration

## ✅ Integration Complete

I've integrated the new dashboard stats endpoint with date range filtering support.

---

## 📁 Files Created/Updated

### 1. **dashboardService.js** (NEW)
**Location:** `src/features/dashboard/services/dashboardService.js`

**Purpose:** Service layer for dashboard API calls

```javascript
dashboardService.getDashboardStats({ fromDate, toDate })
```

**Features:**
- Calls `/api/admin/dashboard/stats`
- Supports optional date range filtering
- Returns dashboard statistics

### 2. **useStats.js** (UPDATED)
**Location:** `src/features/dashboard/hooks/useStats.js`

**Changes:**
- Now calls real API instead of mock data
- Accepts `fromDate` and `toDate` parameters
- Transforms API response to stat cards format
- Provides error handling with fallback
- Returns `rawStats` for additional data access

---

## 🎯 API Endpoint

### Request
```
GET /api/admin/dashboard/stats?fromDate={ISO_DATE}&toDate={ISO_DATE}
```

### Response Structure
```typescript
{
  activeBookings: number;        // Active bookings count
  totalRevenue: BigDecimal;      // Total revenue amount
  availableFleet: number;        // Available buses count
  pendingRefunds: number;        // Pending refunds count
  pendingRefundAmount: BigDecimal; // Total refund amount
  todayBookings: number;         // Today's bookings
  todayRevenue: BigDecimal;      // Today's revenue
  pendingPayments: number;       // Pending payments count
  confirmedBookings: number;     // Confirmed bookings count
}
```

---

## 📊 Stat Cards Mapping

### Card 1: Active Bookings
```javascript
{
  title: 'Active Bookings',
  value: activeBookings,
  icon: Ticket icon,
  change: '+{todayBookings} today',
  subtitle: '{confirmedBookings} confirmed'
}
```

### Card 2: Available Fleet
```javascript
{
  title: 'Available Fleet',
  value: availableFleet,
  icon: Bus icon,
  subtitle: 'Active buses'
}
```

### Card 3: Total Revenue
```javascript
{
  title: 'Total Revenue',
  value: '$' + totalRevenue,
  icon: Dollar icon,
  change: '+$' + todayRevenue + ' today',
  subtitle: '{pendingPayments} pending payments'
}
```

### Card 4: Pending Refunds
```javascript
{
  title: 'Pending Refunds',
  value: pendingRefunds,
  icon: Alert icon,
  change: '$' + pendingRefundAmount,
  subtitle: 'Refund amount',
  variant: 'warning'
}
```

---

## 🔧 Usage

### Basic Usage (No Date Filter)
```javascript
import { useStats } from 'features/dashboard/hooks/useStats';

const DashboardPage = () => {
  const { stats, rawStats, loading, error, refetch } = useStats();
  
  return (
    <div>
      {stats.map(stat => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
```

### With Date Range Filter
```javascript
import { useStats } from 'features/dashboard/hooks/useStats';
import { useState } from 'react';

const DashboardPage = () => {
  const [fromDate, setFromDate] = useState('2026-04-01T00:00:00');
  const [toDate, setToDate] = useState('2026-04-30T23:59:59');
  
  const { stats, rawStats, loading, error, refetch } = useStats(fromDate, toDate);
  
  return (
    <div>
      <DateRangePicker 
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
      />
      
      {stats.map(stat => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
};
```

### Access Raw Data
```javascript
const { stats, rawStats } = useStats();

// Access additional fields not shown in cards
console.log('Pending Payments:', rawStats.pendingPayments);
console.log('Confirmed Bookings:', rawStats.confirmedBookings);
```

### Manual Refetch
```javascript
const { stats, refetch } = useStats();

const handleRefresh = () => {
  refetch();
};
```

---

## 🎨 Stat Card Format

Each stat card has the following structure:

```javascript
{
  title: string,           // Card title
  value: string,           // Main value to display
  icon: ReactElement,      // Icon component
  change: string | null,   // Change indicator (e.g., "+12 today")
  subtitle: string | null, // Additional info below value
  variant: string          // Optional variant (e.g., "warning")
}
```

---

## 🔄 Data Flow

```
1. Component mounts
   ↓
2. useStats() hook called with optional date range
   ↓
3. dashboardService.getDashboardStats() called
   ↓
4. API request: GET /api/admin/dashboard/stats?fromDate=...&toDate=...
   ↓
5. Backend returns DashboardStatsResponse
   ↓
6. Hook transforms data to stat cards format
   ↓
7. Component renders stat cards
```

---

## 📝 Date Format

The API expects dates in ISO 8601 format:

```
2026-04-20T10:30:00
```

**Examples:**
```javascript
// Start of day
fromDate: '2026-04-01T00:00:00'

// End of day
toDate: '2026-04-30T23:59:59'

// Specific time
fromDate: '2026-04-20T10:30:00'
```

---

## 🐛 Error Handling

The hook includes comprehensive error handling:

```javascript
const { stats, error } = useStats();

if (error) {
  // Error occurred - fallback data is shown
  console.error('Dashboard error:', error);
}

// Stats will always have data (either real or fallback)
```

**Fallback behavior:**
- If API fails, shows cards with "0" values
- Error is logged to console
- User sees empty dashboard instead of crash

---

## 🎯 Benefits

### 1. Real-Time Data
- Shows actual booking counts
- Real revenue figures
- Live fleet availability

### 2. Date Range Filtering
- Filter by custom date range
- Compare different time periods
- Analyze trends over time

### 3. Additional Metrics
- Today's bookings and revenue
- Pending payments count
- Confirmed bookings
- Refund tracking

### 4. Flexible Access
- Stat cards for UI display
- Raw data for custom calculations
- Refetch for manual updates

---

## 🚀 Next Steps (Optional Enhancements)

### 1. Add Date Range Picker UI
```javascript
// In DashboardPage.jsx
const [dateRange, setDateRange] = useState({
  from: null,
  to: null
});

const { stats } = useStats(dateRange.from, dateRange.to);
```

### 2. Add Comparison View
```javascript
// Compare current period vs previous period
const { stats: currentStats } = useStats(fromDate, toDate);
const { stats: previousStats } = useStats(prevFromDate, prevToDate);
```

### 3. Add Auto-Refresh
```javascript
useEffect(() => {
  const interval = setInterval(() => {
    refetch();
  }, 60000); // Refresh every minute
  
  return () => clearInterval(interval);
}, [refetch]);
```

---

## ✅ Summary

The dashboard now:
- ✅ Calls real API endpoint
- ✅ Supports date range filtering
- ✅ Shows all 9 metrics from backend
- ✅ Handles errors gracefully
- ✅ Provides raw data access
- ✅ Supports manual refetch
- ✅ Formats currency properly
- ✅ Shows today's stats as change indicators

The integration is complete and ready to use!
