# API Services

This folder contains all backend API request services organized by domain.

## Structure

```
services/
├── axiosConfig.js       # Axios instance with interceptors
├── authService.js       # Authentication endpoints
├── userService.js       # User management endpoints
├── busService.js        # Bus management endpoints
├── routeService.js      # Route management endpoints
├── bookingService.js    # Booking management endpoints
├── customerService.js   # Customer management endpoints
├── reportService.js     # Reports and statistics endpoints
└── index.js            # Export all services
```

## Usage

### Import services

```javascript
import { busService, routeService, authService } from '../services';
```

### Using a service

```javascript
// Get all buses with filters
const result = await busService.getBuses({
  pageNo: 1,
  pageSize: 10,
  status: 'Active'
});

// Create a new bus
const newBus = await busService.createBus({
  busNumber: 'BUS-001',
  busType: 'AC',
  totalSeats: 40
});

// Delete a bus
await busService.deleteBus(busId);
```

## Features

### Automatic Token Management
- Automatically adds Bearer token to all requests
- Handles token refresh on 401 errors
- Queues failed requests during token refresh

### Error Handling
- Consistent error handling across all services
- Error messages available at `error.response.data.message`
- Network errors handled gracefully

### Interceptors
- **Request Interceptor**: Adds authentication token
- **Response Interceptor**: Handles token refresh and 401 errors

## Configuration

Base URL is configured in `.env`:
```
REACT_APP_BASE_URL=http://localhost:8080
```

## Available Services

### authService
- `login(credentials)` - User login
- `refreshToken(refreshToken)` - Refresh access token
- `logout()` - User logout

### userService
- `getProfile()` - Get current user profile
- `updateProfile(data)` - Update user profile
- `getAllUsers(params)` - Get all users
- `getUserById(id)` - Get user by ID
- `createUser(data)` - Create new user
- `updateUser(id, data)` - Update user
- `deleteUser(id)` - Delete user
- `assignRole(userId, roleData)` - Assign role to user

### busService
- `getBuses(params)` - Get buses with filters
- `getBusById(id)` - Get bus by ID
- `createBus(data)` - Create new bus
- `updateBus(id, data)` - Update bus
- `deleteBus(id)` - Delete bus
- `getBusStats()` - Get bus statistics

### routeService
- `getRoutes(params)` - Get all routes
- `getRouteById(id)` - Get route by ID
- `createRoute(data)` - Create new route
- `updateRoute(id, data)` - Update route
- `deleteRoute(id)` - Delete route

### bookingService
- `getBookings(params)` - Get all bookings
- `getBookingById(id)` - Get booking by ID
- `createBooking(data)` - Create new booking
- `updateBooking(id, data)` - Update booking
- `deleteBooking(id)` - Delete booking
- `cancelBooking(id)` - Cancel booking
- `confirmBooking(id)` - Confirm booking

### customerService
- `getCustomers(params)` - Get all customers
- `getCustomerById(id)` - Get customer by ID
- `createCustomer(data)` - Create new customer
- `updateCustomer(id, data)` - Update customer
- `deleteCustomer(id)` - Delete customer
- `searchCustomers(term)` - Search customers

### reportService
- `getDashboardStats()` - Get dashboard statistics
- `getRevenueReport(params)` - Get revenue report
- `getBookingReport(params)` - Get booking report
- `getBusUtilizationReport(params)` - Get bus utilization report
- `exportReport(type, params)` - Export report

## Migration from fetch to axios

### Before (using fetch)
```javascript
const response = await fetch(`${BASE_URL}/api/buses`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

### After (using axios service)
```javascript
const data = await busService.getBuses();
```

Benefits:
- No manual token management
- Automatic error handling
- Cleaner, more maintainable code
- Centralized API logic
