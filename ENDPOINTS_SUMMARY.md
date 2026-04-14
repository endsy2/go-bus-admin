# API Endpoints Used by Dashboard and Bookings Pages

## Dashboard Page Endpoints

### 1. Dashboard Statistics
- **Endpoint**: `GET /api/admin/dashboard/stats`
- **Used by**: `useStats` hook → `reportService.getDashboardStats()`
- **Purpose**: Fetch dashboard statistics (total bookings, active buses, revenue, customers)
- **Status**: ⚠️ **NOT IMPLEMENTED** - Currently using fallback mock data
- **Expected Response**:
```json
{
  "status": 200,
  "data": {
    "totalBookings": 1234,
    "bookingsChange": "+12%",
    "activeBuses": 45,
    "busesChange": "+3%",
    "totalRevenue": "$45,678",
    "revenueChange": "+18%",
    "totalCustomers": 892,
    "customersChange": "+8%"
  }
}
```

### 2. Recent Bookings (for Dashboard Table)
- **Endpoint**: `GET /api/admin/bookings?page=0&size=10`
- **Used by**: `useBookings` hook → `bookingService.filterBookings()`
- **Purpose**: Fetch recent bookings to display in dashboard table
- **Status**: ✅ **IMPLEMENTED**
- **Query Parameters**:
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 10)
  - `userId`: Filter by user ID (optional)
  - `scheduleId`: Filter by schedule ID (optional)
  - `bookingStatus`: Filter by booking status (optional)
  - `paymentStatus`: Filter by payment status (optional)

---

## Bookings Page Endpoints

### 1. Get All Bookings (with filters and pagination)
- **Endpoint**: `GET /api/admin/bookings`
- **Used by**: `BookingsPage` → `useBookings` hook → `bookingService.filterBookings()`
- **Purpose**: Fetch all bookings with filtering and pagination
- **Status**: ✅ **IMPLEMENTED**
- **Query Parameters**:
  - `page`: Page number (default: 0)
  - `size`: Items per page (default: 20)
  - `userId`: Filter by user ID (optional)
  - `scheduleId`: Filter by schedule ID (optional)
  - `bookingStatus`: Filter by booking status (CONFIRMED, PENDING, CANCELLED, COMPLETED)
  - `paymentStatus`: Filter by payment status (PAID, PENDING, FAILED, REFUNDED)
- **Response Structure**:
```json
{
  "status": 200,
  "endpoint": "/api/admin/bookings",
  "message": "Bookings retrieved successfully",
  "data": {
    "content": [
      {
        "id": 12,
        "fullName": "Unknown User",
        "destination": "SiemReap",
        "scheduleId": 1,
        "bookingStatus": "CONFIRMED",
        "totalAmount": 12.0,
        "promoId": null,
        "paymentStatus": "PENDING",
        "paymentMethod": null,
        "createdAt": "2026-04-03T16:58:01.020623",
        "isDeleted": false,
        "deletedAt": null,
        "phoneNumber": null
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": [],
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "last": true,
    "totalPages": 1,
    "totalElements": 12,
    "size": 20,
    "number": 0,
    "first": true,
    "numberOfElements": 12,
    "empty": false
  }
}
```

### 2. Get Booking by ID
- **Endpoint**: `GET /api/bookings/{id}`
- **Used by**: `BookingDetailsDialog` → `bookingService.getBookingById()`
- **Purpose**: Fetch detailed information for a specific booking
- **Status**: ✅ **IMPLEMENTED**
- **Response Structure**:
```json
{
  "status": 200,
  "data": {
    "id": 12,
    "bookingStatus": "CONFIRMED",
    "paymentStatus": "PENDING",
    "paymentMethod": null,
    "totalAmount": 12.0,
    "createdAt": "2026-04-03T16:58:01.020623",
    "phoneNumber": null,
    "user": {
      "id": 1,
      "fullName": "kongming",
      "email": "kongming@gmail.com",
      "phone": null
    },
    "schedule": {
      "id": 1,
      "busId": 3,
      "busNumber": "test",
      "busType": "SLEEPER",
      "departureDate": null,
      "departureTime": null,
      "arrivalTime": null,
      "price": 12.0
    },
    "promo": null,
    "seats": [
      {
        "seatId": 18,
        "passengerNumber": null
      }
    ],
    "payments": [
      {
        "id": 12,
        "bookingId": 12,
        "amount": 12.0,
        "method": null,
        "transactionId": null,
        "status": "PENDING",
        "paidAt": null,
        "walletTransactionId": null
      }
    ],
    "ticket": null
  }
}
```

### 3. Create Booking
- **Endpoint**: `POST /api/bookings`
- **Used by**: `CreateBookingDialog` → `bookingService.createBooking()`
- **Purpose**: Create a new booking
- **Status**: ✅ **IMPLEMENTED**
- **Request Body**:
```json
{
  "scheduleId": 1,
  "seatIds": [18, 19],
  "userId": 1,
  "phoneNumber": "012345678",
  "promoId": null
}
```

### 4. Cancel Booking
- **Endpoint**: `PATCH /api/admin/bookings/{id}/cancel`
- **Used by**: `BookingsPage` → `bookingService.cancelBooking()`
- **Purpose**: Cancel a booking
- **Status**: ✅ **IMPLEMENTED**

### 5. Force Mark as Paid
- **Endpoint**: `PATCH /api/admin/bookings/{id}/force-pay`
- **Used by**: `BookingsPage` → `bookingService.forceMarkPaid()`
- **Purpose**: Manually mark a booking as paid
- **Status**: ✅ **IMPLEMENTED**

### 6. Refund Booking
- **Endpoint**: `PATCH /api/admin/bookings/{id}/refund`
- **Used by**: `BookingsPage` → `bookingService.refundBooking()`
- **Purpose**: Process a refund for a booking
- **Status**: ⚠️ **NEEDS BACKEND IMPLEMENTATION**

### 7. Delete Booking
- **Endpoint**: `DELETE /api/admin/bookings/{id}`
- **Used by**: ~~BookingsPage~~ (REMOVED from UI)
- **Purpose**: Delete a booking
- **Status**: ✅ **IMPLEMENTED** (but not used in UI anymore)

---

## Summary

### Dashboard Page Uses:
1. ⚠️ `GET /api/admin/dashboard/stats` - **NOT IMPLEMENTED** (using mock data)
2. ✅ `GET /api/admin/bookings?page=0&size=10` - **WORKING**

### Bookings Page Uses:
1. ✅ `GET /api/admin/bookings` (with filters) - **WORKING**
2. ✅ `GET /api/bookings/{id}` - **WORKING**
3. ✅ `POST /api/bookings` - **WORKING**
4. ✅ `PATCH /api/admin/bookings/{id}/cancel` - **WORKING**
5. ✅ `PATCH /api/admin/bookings/{id}/force-pay` - **WORKING**
6. ⚠️ `PATCH /api/admin/bookings/{id}/refund` - **NEEDS IMPLEMENTATION**

### Action Items:
1. Implement `GET /api/admin/dashboard/stats` endpoint on backend
2. Implement `PATCH /api/admin/bookings/{id}/refund` endpoint on backend
