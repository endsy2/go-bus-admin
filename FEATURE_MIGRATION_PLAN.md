# Feature-Based Architecture Migration Plan

## Target Structure

```
src/
├── features/
│   ├── auth/
│   │   ├── pages/LoginPage/
│   │   ├── services/authService.js
│   │   └── index.js
│   ├── dashboard/
│   │   ├── pages/DashboardPage/
│   │   ├── components/StatsGrid/
│   │   ├── hooks/useStats.js
│   │   └── index.js
│   ├── buses/
│   │   ├── pages/
│   │   │   ├── BusesPage/
│   │   │   ├── BusDetailPage/
│   │   │   └── CreateBusPage/
│   │   ├── components/EditBusDialog/
│   │   ├── services/busService.js
│   │   └── index.js
│   ├── routes/
│   │   ├── pages/
│   │   │   ├── RoutesPage/
│   │   │   ├── RouteDetailPage/
│   │   │   └── CreateRoutePage/
│   │   ├── services/routeService.js
│   │   └── index.js
│   ├── customers/
│   │   ├── pages/
│   │   │   ├── CustomersPage/
│   │   │   ├── CustomerDetailPage/
│   │   │   └── CreateCustomerPage/
│   │   ├── components/
│   │   │   ├── EditCustomerDialog/
│   │   │   └── CreateCustomerDialog/
│   │   ├── services/customerService.js
│   │   └── index.js
│   ├── bookings/
│   │   ├── pages/BookingsPage/
│   │   ├── components/BookingTable/
│   │   ├── hooks/useBookings.js
│   │   ├── services/bookingService.js
│   │   └── index.js
│   ├── reports/
│   │   ├── pages/ReportsPage/
│   │   ├── services/reportService.js
│   │   └── index.js
│   └── team/
│       ├── pages/TeamPage/
│       ├── components/AssignRoleDialog/
│       ├── services/userService.js
│       └── index.js
├── shared/
│   ├── components/
│   │   ├── ui/           (shadcn components)
│   │   ├── common/       (Button, Badge, Icon, Input, Snackbar)
│   │   ├── layout/       (Sidebar, TopBar, NavItem)
│   │   └── feedback/     (ConfirmDialog, UnauthorizedDialog, Pagination)
│   ├── context/          (ThemeContext, LocaleContext)
│   ├── hooks/            (shared hooks if any)
│   ├── utils/            (api, permissions)
│   └── locales/          (translations)
├── services/
│   ├── axiosConfig.js
│   └── index.js
└── lib/
    └── utils.js

## Migration Steps

### Phase 1: Auth Feature
- [x] Move LoginPage → features/auth/pages/
- [ ] Move authService → features/auth/services/
- [ ] Create features/auth/index.js

### Phase 2: Dashboard Feature
- [ ] Move DashboardPage → features/dashboard/pages/
- [ ] Move StatsGrid → features/dashboard/components/
- [ ] Move useStats → features/dashboard/hooks/
- [ ] Create features/dashboard/index.js

### Phase 3: Buses Feature
- [ ] Move BusesPage → features/buses/pages/
- [ ] Move BusDetailPage → features/buses/pages/
- [ ] Move CreateBusPage → features/buses/pages/
- [ ] Move EditBusDialog → features/buses/components/
- [ ] Move busService → features/buses/services/
- [ ] Create features/buses/index.js

### Phase 4: Routes Feature
- [ ] Move RoutesPage → features/routes/pages/
- [ ] Move RouteDetailPage → features/routes/pages/
- [ ] Move CreateRoutePage → features/routes/pages/
- [ ] Move routeService → features/routes/services/
- [ ] Create features/routes/index.js

### Phase 5: Customers Feature
- [ ] Move CustomersPage → features/customers/pages/
- [ ] Move CustomerDetailPage → features/customers/pages/
- [ ] Move CreateCustomerPage → features/customers/pages/
- [ ] Move EditCustomerDialog → features/customers/components/
- [ ] Move CreateCustomerDialog → features/customers/components/
- [ ] Move customerService → features/customers/services/
- [ ] Create features/customers/index.js

### Phase 6: Bookings Feature
- [ ] Move BookingsPage → features/bookings/pages/
- [ ] Move BookingTable → features/bookings/components/
- [ ] Move useBookings → features/bookings/hooks/
- [ ] Move bookingService → features/bookings/services/
- [ ] Create features/bookings/index.js

### Phase 7: Reports Feature
- [ ] Move ReportsPage → features/reports/pages/
- [ ] Move reportService → features/reports/services/
- [ ] Create features/reports/index.js

### Phase 8: Team Feature
- [ ] Move TeamPage → features/team/pages/
- [ ] Move AssignRoleDialog → features/team/components/
- [ ] Move userService → features/team/services/
- [ ] Create features/team/index.js

### Phase 9: Update App.js
- [ ] Update all imports to use feature exports
- [ ] Test all routes

### Phase 10: Cleanup
- [ ] Remove old components/pages folder
- [ ] Remove old services folder (keep axiosConfig and index)
- [ ] Remove old hooks folder
- [ ] Update documentation
