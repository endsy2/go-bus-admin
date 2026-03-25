# Architecture Migration Script

## Step-by-Step Migration Guide

### Phase 1: Create Shared Components Structure

Run these commands to copy UI components:

```bash
# Create shared UI components
cp src/components/ui/dialog.jsx src/shared/components/ui/dialog.jsx
cp src/components/ui/badge.jsx src/shared/components/ui/badge.jsx
cp src/components/ui/card.jsx src/shared/components/ui/card.jsx
cp src/components/ui/label.jsx src/shared/components/ui/label.jsx
cp src/components/ui/select.jsx src/shared/components/ui/select.jsx
cp src/components/ui/table.jsx src/shared/components/ui/table.jsx
cp src/components/ui/avatar.jsx src/shared/components/ui/avatar.jsx
cp src/components/ui/checkbox.jsx src/shared/components/ui/checkbox.jsx
cp src/components/ui/separator.jsx src/shared/components/ui/separator.jsx
cp src/components/ui/toast.jsx src/shared/components/ui/toast.jsx

# Create shared common components
cp src/components/atoms/Button/Button.js src/shared/components/common/Button.jsx
cp src/components/atoms/Badge/Badge.js src/shared/components/common/Badge.jsx
cp src/components/atoms/Icon/Icon.js src/shared/components/common/Icon.jsx
cp src/components/atoms/Input/Input.js src/shared/components/common/Input.jsx
cp src/components/atoms/Snackbar/Snackbar.js src/shared/components/common/Snackbar.jsx

# Create shared layout components
cp src/components/organisms/Sidebar/Sidebar.js src/shared/components/layout/Sidebar.jsx
cp src/components/molecules/TopBar/TopBar.js src/shared/components/layout/TopBar.jsx
cp src/components/molecules/NavItem/NavItem.js src/shared/components/layout/NavItem.jsx

# Create shared feedback components
cp src/components/molecules/ConfirmDialog/ConfirmDialog.js src/shared/components/feedback/ConfirmDialog.jsx
cp src/components/molecules/UnauthorizedDialog/UnauthorizedDialog.js src/shared/components/feedback/UnauthorizedDialog.jsx
cp src/components/molecules/Pagination/Pagination.js src/shared/components/feedback/Pagination.jsx

# Move context
cp src/context/ThemeContext.js src/shared/context/ThemeContext.jsx
cp src/context/LocaleContext.js src/shared/context/LocaleContext.jsx

# Move utils
cp src/utils/api.js src/shared/utils/api.js
cp src/utils/permissions.js src/shared/utils/permissions.js

# Move locales
cp -r src/locales src/
```

### Phase 2: Create Feature Structures

```bash
# Auth Feature
cp src/components/pages/LoginPage/LoginPage.js src/features/auth/pages/LoginPage.jsx
cp src/services/authService.js src/features/auth/services/authService.js

# Dashboard Feature
cp src/components/pages/DashboardPage/DashboardPage.js src/features/dashboard/pages/DashboardPage.jsx
cp src/components/organisms/StatsGrid/StatsGrid.js src/features/dashboard/components/StatsGrid.jsx
cp src/components/molecules/StatCard/StatCard.js src/features/dashboard/components/StatCard.jsx
cp src/components/organisms/BookingTable/BookingTable.js src/features/dashboard/components/BookingTable.jsx
cp src/hooks/useStats.js src/features/dashboard/hooks/useStats.js
cp src/hooks/useBookings.js src/features/dashboard/hooks/useBookings.js

# Buses Feature
cp src/components/pages/BusesPage/BusesPage.js src/features/buses/pages/BusesPage.jsx
cp src/components/pages/BusDetailPage/BusDetailPage.js src/features/buses/pages/BusDetailPage.jsx
cp src/components/pages/CreateBusPage/CreateBusPage.js src/features/buses/pages/CreateBusPage.jsx
cp src/components/molecules/EditBusDialog/EditBusDialog.js src/features/buses/components/EditBusDialog.jsx
cp src/services/busService.js src/features/buses/services/busService.js

# Routes Feature
cp src/components/pages/RoutesPage/RoutesPage.js src/features/routes/pages/RoutesPage.jsx
cp src/components/pages/RouteDetailPage/RouteDetailPage.js src/features/routes/pages/RouteDetailPage.jsx
cp src/components/pages/createRoutePage/createRoutePage.js src/features/routes/pages/CreateRoutePage.jsx
cp src/services/routeService.js src/features/routes/services/routeService.js

# Customers Feature
cp src/components/pages/CustomersPage/CustomersPage.jsx src/features/customers/pages/CustomersPage.jsx
cp src/components/pages/CustomerDetailPage/CustomerDetailPage.jsx src/features/customers/pages/CustomerDetailPage.jsx
cp src/components/pages/CreateCustomerPage/CreateCustomerPage.js src/features/customers/pages/CreateCustomerPage.jsx
cp src/components/molecules/CreateCustomerDialog/CreateCustomerDialog.js src/features/customers/components/CreateCustomerDialog.jsx
cp src/components/molecules/EditCustomerDialog/EditCustomerDialog.jsx src/features/customers/components/EditCustomerDialog.jsx
cp src/components/molecules/CustomerRow/CustomerRow.js src/features/customers/components/CustomerRow.jsx
cp src/services/customerService.js src/features/customers/services/customerService.js

# Bookings Feature
cp src/components/pages/BookingsPage/BookingsPage.js src/features/bookings/pages/BookingsPage.jsx
cp src/services/bookingService.js src/features/bookings/services/bookingService.js

# Reports Feature
cp src/components/pages/ReportsPage/ReportsPage.js src/features/reports/pages/ReportsPage.jsx
cp src/services/reportService.js src/features/reports/services/reportService.js

# Team Feature
cp src/components/pages/TeamPage/TeamPage.js src/features/team/pages/TeamPage.jsx
cp src/components/molecules/AssignRoleDialog/AssignRoleDialog.js src/features/team/components/AssignRoleDialog.jsx
cp src/services/userService.js src/features/team/services/userService.js
```

### Phase 3: Update Import Paths

After copying files, you need to update all import paths. Here's a find-and-replace guide:

#### In all files, replace:
```javascript
// Old imports
import Button from '../../atoms/Button/Button'
import Badge from '../../atoms/Badge/Badge'
import Icon from '../../atoms/Icon/Icon'
import Input from '../../atoms/Input/Input'

// New imports
import { Button } from '@/shared/components/common/Button'
import { Badge } from '@/shared/components/common/Badge'
import { Icon } from '@/shared/components/common/Icon'
import { Input } from '@/shared/components/common/Input'

// Old UI imports
import { Button } from '../../ui/button'
import { Dialog } from '../../ui/dialog'

// New UI imports
import { Button } from '@/shared/components/ui/button'
import { Dialog } from '@/shared/components/ui/dialog'

// Old context imports
import { useTheme } from '../../../context/ThemeContext'
import { useLocale } from '../../../context/LocaleContext'

// New context imports
import { useTheme } from '@/shared/context/ThemeContext'
import { useLocale } from '@/shared/context/LocaleContext'

// Old utils imports
import { apiRequest } from '../../../utils/api'
import { hasPermission } from '../../../utils/permissions'

// New utils imports
import { apiRequest } from '@/shared/utils/api'
import { hasPermission } from '@/shared/utils/permissions'
```

### Phase 4: Create Path Aliases

Create or update `jsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/shared/*": ["shared/*"],
      "@/features/*": ["features/*"]
    }
  },
  "include": ["src"]
}
```

### Phase 5: Create Feature Index Files

Create index.js files for each feature to export public APIs:

```javascript
// src/features/customers/index.js
export { default as CustomersPage } from './pages/CustomersPage';
export { default as CustomerDetailPage } from './pages/CustomerDetailPage';
export { default as CreateCustomerPage } from './pages/CreateCustomerPage';
export { CreateCustomerDialog } from './components/CreateCustomerDialog';
export { EditCustomerDialog } from './components/EditCustomerDialog';
export { customerService } from './services/customerService';
```

### Phase 6: Update App.js Routing

Update your routing to use the new feature structure:

```javascript
// Old
import DashboardPage from './components/pages/DashboardPage/DashboardPage';
import CustomersPage from './components/pages/CustomersPage/CustomersPage';

// New
import { DashboardPage } from './features/dashboard';
import { CustomersPage } from './features/customers';
```

### Phase 7: Clean Up Old Structure

After verifying everything works, remove old directories:

```bash
rm -rf src/components/atoms
rm -rf src/components/molecules
rm -rf src/components/organisms
rm -rf src/components/pages
rm -rf src/components/ui
rm -rf src/context
rm -rf src/hooks
rm -rf src/services
rm -rf src/utils
```

## Verification Checklist

- [ ] All files copied to new structure
- [ ] All import paths updated
- [ ] jsconfig.json created with path aliases
- [ ] Feature index files created
- [ ] App.js routing updated
- [ ] Application runs without errors
- [ ] All features work correctly
- [ ] Old directories removed

## Rollback Plan

If issues occur:
1. Keep old structure until migration is complete
2. Test each feature individually
3. Use git to track changes and rollback if needed
