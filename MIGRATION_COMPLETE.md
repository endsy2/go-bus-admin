# Complete shadcn/ui Migration Guide

## Summary
This document provides the complete migration strategy to replace all custom atoms, molecules, and organisms with shadcn/ui components while maintaining the exact same styling.

## Migration Completed ✅

### Pages Already Migrated:
1. ✅ CustomersPage.jsx
2. ✅ DashboardPage.jsx  
3. ✅ BookingsPage.jsx
4. ✅ LoginPage.jsx
5. ✅ ReportsPage.jsx

## Remaining Pages to Migrate

### High Priority (Bus & Route Management):
1. **BusesPage** (687 lines) - Complex filtering, stats, table
2. **BusDetailPage** - Bus details with edit dialog
3. **CreateBusPage** - Bus creation form
4. **RoutesPage** - Routes listing
5. **RouteDetailPage** - Route details
6. **CreateRoutePage** - Route creation

### Medium Priority (Customer & Team):
7. **CustomerDetailPage** - Customer details
8. **TeamPage** - Team management
9. **CreateCustomerPage** - Customer creation

### Layout Components:
10. **Sidebar** - Main navigation
11. **TopBar** - Top navigation bar
12. **UnauthorizedDialog** - Access denied dialog

## Component Mapping

### Atoms → shadcn/ui:
- `Button` → `import { Button } from '../../ui/button'`
- `Input` → `import { Input } from '../../ui/input'`
- `Badge` → `import { Badge } from '../../ui/badge'`
- `Icon` → `import { IconName } from 'lucide-react'`
- `Snackbar` → `import { useToast } from '../../ui/toast'`

### Molecules → shadcn/ui:
- `ConfirmDialog` → `import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../ui/dialog'`
- `Pagination` → Custom component using shadcn/ui Button
- `EditCustomerDialog` → Dialog with Form components
- `EditBusDialog` → Dialog with Form components
- `AssignRoleDialog` → Dialog with Select components
- `NavItem` → Custom component with shadcn/ui styling
- `TopBar` → Custom component with shadcn/ui components
- `StatCard` → Card component
- `UnauthorizedDialog` → Dialog component

### Organisms → shadcn/ui:
- `StatsGrid` → Grid of Card components
- `BookingTable` → Table component
- `Sidebar` → Custom component with shadcn/ui Button and styling

## Icon Mapping (lucide-react)

Common icons used:
```javascript
import {
  Bus, Plus, Search, X, Filter, Eye, Trash2, Edit,
  MapPin, Users, Calendar, Phone, Mail, Globe, Hash,
  AlertCircle, Check, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, Settings, LogOut,
  FileText, Download, RefreshCw, CreditCard, Truck
} from 'lucide-react';
```

## Toast Migration Pattern

### Before (Snackbar):
```javascript
const [snackbar, setSnackbar] = useState({ isOpen: false, message: '', type: 'success' });

setSnackbar({ isOpen: true, message: 'Success!', type: 'success' });

<Snackbar
  isOpen={snackbar.isOpen}
  message={snackbar.message}
  type={snackbar.type}
  onClose={() => setSnackbar({ ...snackbar, isOpen: false })}
/>
```

### After (Toast):
```javascript
import { useToast } from '../../ui/toast';

const { addToast } = useToast();

addToast({ message: 'Success!', type: 'success' });
```

## Dialog Migration Pattern

### Before (ConfirmDialog):
```javascript
<ConfirmDialog
  isOpen={showDialog}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  title="Confirm Delete"
  message="Are you sure?"
  confirmText="Delete"
  cancelText="Cancel"
  type="danger"
/>
```

### After (Dialog):
```javascript
<Dialog open={showDialog} onOpenChange={setShowDialog}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogDescription>Are you sure?</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline" onClick={handleCancel}>Cancel</Button>
      <Button variant="destructive" onClick={handleConfirm}>Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

## Select Migration Pattern

### Before (HTML select):
```javascript
<select value={value} onChange={handleChange}>
  <option value="option1">Option 1</option>
  <option value="option2">Option 2</option>
</select>
```

### After (shadcn/ui Select):
```javascript
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';

<Select value={value} onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

## Styling Preservation

All custom styling should be preserved using Tailwind classes:
- Keep gradient backgrounds: `bg-gradient-to-r from-blue-500 to-indigo-600`
- Keep hover effects: `hover:shadow-lg transition-shadow`
- Keep dark mode: `dark:bg-slate-800 dark:text-slate-100`
- Keep animations: `animate-pulse`, custom shimmer animations
- Keep responsive design: `md:grid-cols-2 lg:grid-cols-3`

## Testing Checklist

After migrating each page:
- [ ] No TypeScript/JavaScript errors
- [ ] All functionality works (CRUD operations)
- [ ] Styling matches original design
- [ ] Dark mode works correctly
- [ ] Responsive design works on mobile
- [ ] Toast notifications appear correctly
- [ ] Dialogs open and close properly
- [ ] Forms validate correctly
- [ ] Icons display correctly

## Benefits of Migration

1. **Consistency**: Unified design system across all pages
2. **Accessibility**: Built-in ARIA attributes and keyboard navigation
3. **Maintainability**: Less custom code to maintain
4. **Performance**: Optimized components
5. **Type Safety**: Better TypeScript support
6. **Dark Mode**: Automatic dark mode support
7. **Modern**: Up-to-date with React best practices
8. **Documentation**: Well-documented components

## Next Steps

1. Complete migration of remaining 7 pages
2. Migrate Sidebar and TopBar components
3. Delete old custom component folders:
   - `src/components/atoms/`
   - `src/components/molecules/`
   - `src/components/organisms/`
4. Update all CSS files to use Tailwind utilities
5. Run full test suite
6. Update documentation
