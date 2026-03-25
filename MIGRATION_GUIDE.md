# Migration Guide: Fetch to Axios Services

This guide helps you migrate remaining pages from `fetch` API to the new axios services.

## What's Been Done

✅ Installed axios
✅ Created axios configuration with interceptors (`src/services/axiosConfig.js`)
✅ Created service modules for all API endpoints
✅ Updated `App.js` to use `userService`
✅ Updated `LoginPage.js` to use `authService` and `userService`
✅ Updated `BusesPage.js` to use `busService` and `routeService`
✅ Updated hooks (`useStats.js`, `useBookings.js`) to use services

## Pages That Need Migration

The following pages still use the old `apiRequest` from `src/utils/api.js`:

1. `src/components/pages/BusDetailPage/BusDetailPage.js`
2. `src/components/pages/CreateBusPage/CreateBusPage.js`
3. `src/components/pages/CustomersPage/CustomersPage.js`
4. `src/components/pages/CustomerDetailPage/CustomerDetailPage.js`
5. `src/components/pages/CreateCustomerPage/CreateCustomerPage.js`
6. `src/components/pages/RoutesPage/RoutesPage.js`
7. `src/components/pages/RouteDetailPage/RouteDetailPage.js`
8. `src/components/pages/createRoutePage/CreateRoutePage.js`
9. `src/components/pages/TeamPage/TeamPage.js`
10. `src/components/pages/ReportsPage/ReportsPage.js`

## Migration Steps

### Step 1: Import the service

Replace:
```javascript
import { apiRequest } from '../../../utils/api';
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8080';
```

With:
```javascript
import { busService, routeService, customerService } from '../../../services';
// Import only the services you need
```

### Step 2: Replace fetch calls

#### Before (using apiRequest):
```javascript
const response = await apiRequest(`${BASE_URL}/api/buses/${busId}`, {
  method: 'GET'
});
const result = await response.json();
if (response.ok) {
  const data = result.data || result;
  setBus(data);
}
```

#### After (using service):
```javascript
try {
  const result = await busService.getBusById(busId);
  const data = result.data || result;
  setBus(data);
} catch (error) {
  const errorMessage = error.response?.data?.message || 'Failed to fetch bus';
  setError(errorMessage);
}
```

### Step 3: Update POST/PUT/DELETE requests

#### Before:
```javascript
const response = await apiRequest(`${BASE_URL}/api/buses`, {
  method: 'POST',
  body: JSON.stringify(busData)
});
```

#### After:
```javascript
const result = await busService.createBus(busData);
```

## Service Method Reference

### Bus Operations
- `busService.getBuses(params)` - GET /api/buses/filter
- `busService.getBusById(id)` - GET /api/buses/:id
- `busService.createBus(data)` - POST /api/buses
- `busService.updateBus(id, data)` - PUT /api/buses/:id
- `busService.deleteBus(id)` - DELETE /api/buses/:id

### Route Operations
- `routeService.getRoutes(params)` - GET /api/routes
- `routeService.getRouteById(id)` - GET /api/routes/:id
- `routeService.createRoute(data)` - POST /api/routes
- `routeService.updateRoute(id, data)` - PUT /api/routes/:id
- `routeService.deleteRoute(id)` - DELETE /api/routes/:id

### Customer Operations
- `customerService.getCustomers(params)` - GET /api/customers
- `customerService.getCustomerById(id)` - GET /api/customers/:id
- `customerService.createCustomer(data)` - POST /api/customers
- `customerService.updateCustomer(id, data)` - PUT /api/customers/:id
- `customerService.deleteCustomer(id)` - DELETE /api/customers/:id

### User Operations
- `userService.getAllUsers(params)` - GET /api/users
- `userService.getUserById(id)` - GET /api/users/:id
- `userService.createUser(data)` - POST /api/users
- `userService.updateUser(id, data)` - PUT /api/users/:id
- `userService.deleteUser(id)` - DELETE /api/users/:id
- `userService.assignRole(userId, roleData)` - POST /api/users/:id/role

### Booking Operations
- `bookingService.getBookings(params)` - GET /api/bookings
- `bookingService.getBookingById(id)` - GET /api/bookings/:id
- `bookingService.createBooking(data)` - POST /api/bookings
- `bookingService.updateBooking(id, data)` - PUT /api/bookings/:id
- `bookingService.deleteBooking(id)` - DELETE /api/bookings/:id
- `bookingService.confirmBooking(id)` - POST /api/bookings/:id/confirm
- `bookingService.cancelBooking(id)` - POST /api/bookings/:id/cancel

### Report Operations
- `reportService.getDashboardStats()` - GET /api/reports/dashboard
- `reportService.getRevenueReport(params)` - GET /api/reports/revenue
- `reportService.getBookingReport(params)` - GET /api/reports/bookings

## Error Handling Pattern

```javascript
try {
  const result = await busService.getBusById(busId);
  const data = result.data || result;
  // Handle success
} catch (error) {
  // Error response structure:
  // error.response.data.message - Error message from API
  // error.response.status - HTTP status code
  // error.message - Network error message
  
  const errorMessage = error.response?.data?.message 
    || error.response?.data?.data?.message 
    || error.message 
    || 'An error occurred';
  
  setError(errorMessage);
  console.error('Error:', error);
}
```

## Benefits of Migration

1. **Automatic Token Management**: No need to manually add Authorization headers
2. **Token Refresh**: Automatically refreshes expired tokens
3. **Cleaner Code**: Less boilerplate, more readable
4. **Centralized Logic**: All API calls in one place
5. **Better Error Handling**: Consistent error handling across the app
6. **Type Safety**: Easier to add TypeScript later
7. **Testing**: Easier to mock services for testing

## Next Steps

1. Migrate remaining pages one by one
2. Test each page after migration
3. Remove old `src/utils/api.js` once all pages are migrated
4. Consider adding request/response logging for debugging
5. Add TypeScript types for better type safety (optional)
