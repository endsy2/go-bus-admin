# Architecture Migration Plan
## From Atomic Design to Component-Based + Feature-Based Architecture

## Current Structure (Atomic Design)
```
src/
├── components/
│   ├── atoms/          # Basic building blocks
│   ├── molecules/      # Simple component groups
│   ├── organisms/      # Complex components
│   ├── pages/          # Page components
│   └── ui/             # shadcn/ui components
├── context/
├── hooks/
├── services/
├── utils/
└── locales/
```

## New Structure (Component-Based + Feature-Based)

```
src/
├── features/                    # Feature modules
│   ├── auth/                   # Authentication feature
│   │   ├── components/         # Feature-specific components
│   │   │   └── LoginForm.jsx
│   │   ├── hooks/              # Feature-specific hooks
│   │   │   └── useAuth.js
│   │   ├── services/           # Feature-specific API calls
│   │   │   └── authService.js
│   │   ├── pages/              # Feature pages
│   │   │   └── LoginPage.jsx
│   │   └── index.js            # Public exports
│   │
│   ├── dashboard/              # Dashboard feature
│   │   ├── components/
│   │   │   ├── StatsGrid.jsx
│   │   │   ├── StatCard.jsx
│   │   │   └── BookingTable.jsx
│   │   ├── hooks/
│   │   │   ├── useStats.js
│   │   │   └── useBookings.js
│   │   ├── pages/
│   │   │   └── DashboardPage.jsx
│   │   └── index.js
│   │
│   ├── buses/                  # Bus management feature
│   │   ├── components/
│   │   │   ├── BusList.jsx
│   │   │   ├── BusCard.jsx
│   │   │   ├── BusForm.jsx
│   │   │   └── EditBusDialog.jsx
│   │   ├── hooks/
│   │   │   └── useBuses.js
│   │   ├── services/
│   │   │   └── busService.js
│   │   ├── pages/
│   │   │   ├── BusesPage.jsx
│   │   │   ├── BusDetailPage.jsx
│   │   │   └── CreateBusPage.jsx
│   │   └── index.js
│   │
│   ├── routes/                 # Route management feature
│   │   ├── components/
│   │   │   ├── RouteList.jsx
│   │   │   ├── RouteCard.jsx
│   │   │   └── RouteForm.jsx
│   │   ├── hooks/
│   │   │   └── useRoutes.js
│   │   ├── services/
│   │   │   └── routeService.js
│   │   ├── pages/
│   │   │   ├── RoutesPage.jsx
│   │   │   ├── RouteDetailPage.jsx
│   │   │   └── CreateRoutePage.jsx
│   │   └── index.js
│   │
│   ├── customers/              # Customer management feature
│   │   ├── components/
│   │   │   ├── CustomerList.jsx
│   │   │   ├── CustomerRow.jsx
│   │   │   ├── CreateCustomerDialog.jsx
│   │   │   └── EditCustomerDialog.jsx
│   │   ├── hooks/
│   │   │   └── useCustomers.js
│   │   ├── services/
│   │   │   └── customerService.js
│   │   ├── pages/
│   │   │   ├── CustomersPage.jsx
│   │   │   ├── CustomerDetailPage.jsx
│   │   │   └── CreateCustomerPage.jsx
│   │   └── index.js
│   │
│   ├── bookings/               # Booking management feature
│   │   ├── components/
│   │   │   ├── BookingList.jsx
│   │   │   └── BookingCard.jsx
│   │   ├── hooks/
│   │   │   └── useBookings.js
│   │   ├── services/
│   │   │   └── bookingService.js
│   │   ├── pages/
│   │   │   └── BookingsPage.jsx
│   │   └── index.js
│   │
│   ├── reports/                # Reports feature
│   │   ├── components/
│   │   │   └── ReportChart.jsx
│   │   ├── services/
│   │   │   └── reportService.js
│   │   ├── pages/
│   │   │   └── ReportsPage.jsx
│   │   └── index.js
│   │
│   └── team/                   # Team management feature
│       ├── components/
│       │   ├── TeamList.jsx
│       │   └── AssignRoleDialog.jsx
│       ├── hooks/
│       │   └── useTeam.js
│       ├── services/
│       │   └── userService.js
│       ├── pages/
│       │   └── TeamPage.jsx
│       └── index.js
│
├── shared/                      # Shared across features
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   │   ├── button.jsx
│   │   │   ├── input.jsx
│   │   │   ├── dialog.jsx
│   │   │   └── ...
│   │   ├── common/             # Common components
│   │   │   ├── Button.jsx      # Wrapper for ui/button
│   │   │   ├── Input.jsx       # Wrapper for ui/input
│   │   │   ├── Badge.jsx
│   │   │   ├── Icon.jsx
│   │   │   └── Snackbar.jsx
│   │   ├── layout/             # Layout components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── NavItem.jsx
│   │   │   └── MainLayout.jsx
│   │   └── feedback/           # Feedback components
│   │       ├── ConfirmDialog.jsx
│   │       ├── UnauthorizedDialog.jsx
│   │       └── Pagination.jsx
│   │
│   ├── hooks/                  # Shared hooks
│   │   ├── useAuth.js
│   │   ├── usePermissions.js
│   │   └── useApi.js
│   │
│   ├── context/                # Global context
│   │   ├── ThemeContext.jsx
│   │   ├── LocaleContext.jsx
│   │   └── AuthContext.jsx
│   │
│   ├── utils/                  # Utility functions
│   │   ├── api.js
│   │   ├── permissions.js
│   │   ├── formatters.js
│   │   └── validators.js
│   │
│   ├── constants/              # Constants
│   │   ├── routes.js
│   │   ├── permissions.js
│   │   └── config.js
│   │
│   └── types/                  # TypeScript types (if using TS)
│       └── index.ts
│
├── locales/                    # Internationalization
│   ├── en.json
│   ├── km.json
│   └── index.js
│
├── lib/                        # Third-party lib configs
│   └── utils.js                # cn() utility
│
├── App.jsx                     # Root component
├── main.jsx                    # Entry point
└── index.css                   # Global styles
```

## Key Principles

### 1. Feature-Based Organization
- Each feature is self-contained
- Features have their own components, hooks, services, and pages
- Easy to locate and modify feature-specific code

### 2. Shared Resources
- Common components in `shared/components`
- Reusable hooks in `shared/hooks`
- Global utilities in `shared/utils`

### 3. Clear Boundaries
- Features don't import from other features directly
- Shared code is explicitly in `shared/`
- Each feature exports public API through `index.js`

### 4. Scalability
- Easy to add new features
- Easy to remove features
- Easy to split features into micro-frontends

## Migration Steps

1. ✅ Create new directory structure
2. ✅ Move shared components to `shared/components`
3. ✅ Move feature-specific components to respective features
4. ✅ Move services to feature directories
5. ✅ Move hooks to feature directories
6. ✅ Update all imports
7. ✅ Update routing
8. ✅ Test all features

## Benefits

### Before (Atomic Design)
- Hard to find feature-related code
- Components scattered across atoms/molecules/organisms
- Unclear ownership of components
- Difficult to understand feature scope

### After (Feature-Based)
- All feature code in one place
- Clear feature boundaries
- Easy to understand and maintain
- Better for team collaboration
- Easier to test features in isolation

## Example: Customer Feature

### Before
```
src/components/
├── atoms/Button, Input, Badge
├── molecules/CreateCustomerDialog, EditCustomerDialog
├── organisms/CustomerTable
└── pages/CustomersPage, CustomerDetailPage
src/services/customerService.js
src/hooks/useCustomers.js
```

### After
```
src/features/customers/
├── components/
│   ├── CustomerList.jsx
│   ├── CustomerRow.jsx
│   ├── CreateCustomerDialog.jsx
│   └── EditCustomerDialog.jsx
├── hooks/
│   └── useCustomers.js
├── services/
│   └── customerService.js
├── pages/
│   ├── CustomersPage.jsx
│   ├── CustomerDetailPage.jsx
│   └── CreateCustomerPage.jsx
└── index.js (exports public API)
```

## Import Examples

### Before
```javascript
import Button from '../../atoms/Button/Button';
import CreateCustomerDialog from '../../molecules/CreateCustomerDialog';
import { customerService } from '../../../services/customerService';
```

### After
```javascript
// From within customers feature
import { CreateCustomerDialog } from '../components/CreateCustomerDialog';
import { customerService } from '../services/customerService';

// From shared
import { Button } from '@/shared/components/common/Button';

// From another feature (through public API)
import { useBuses } from '@/features/buses';
```

## Path Aliases (jsconfig.json)
```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/features/*": ["features/*"],
      "@/shared/*": ["shared/*"]
    }
  }
}
```
