# Quick Start: Architecture Migration

## 🚀 Quick Migration Guide

Follow these steps to migrate your project to the new architecture:

### Step 1: Run the Migration Script

```bash
# On Linux/Mac
chmod +x migrate-architecture.sh
./migrate-architecture.sh

# On Windows (Git Bash)
bash migrate-architecture.sh

# Or manually create directories and copy files (see MIGRATION_SCRIPT.md)
```

### Step 2: Verify Directory Structure

Check that these directories exist:
```
src/
├── features/
│   ├── auth/
│   ├── dashboard/
│   ├── buses/
│   ├── routes/
│   ├── customers/
│   ├── bookings/
│   ├── reports/
│   └── team/
└── shared/
    ├── components/
    ├── context/
    └── utils/
```

### Step 3: Update Import Paths

Use your IDE's find-and-replace feature (Ctrl+Shift+H or Cmd+Shift+H):

#### Replace UI Component Imports
```javascript
// Find
from '../../ui/
// Replace with
from '@/shared/components/ui/
```

#### Replace Common Component Imports
```javascript
// Find
from '../../atoms/Button/Button'
// Replace with
from '@/shared/components/common/Button'

// Find
from '../../atoms/Badge/Badge'
// Replace with
from '@/shared/components/common/Badge'

// Find
from '../../atoms/Icon/Icon'
// Replace with
from '@/shared/components/common/Icon'

// Find
from '../../atoms/Input/Input'
// Replace with
from '@/shared/components/common/Input'
```

#### Replace Layout Component Imports
```javascript
// Find
from '../../organisms/Sidebar/Sidebar'
// Replace with
from '@/shared/components/layout/Sidebar'

// Find
from '../../molecules/TopBar/TopBar'
// Replace with
from '@/shared/components/layout/TopBar'

// Find
from '../../molecules/NavItem/NavItem'
// Replace with
from '@/shared/components/layout/NavItem'
```

#### Replace Feedback Component Imports
```javascript
// Find
from '../../molecules/ConfirmDialog/ConfirmDialog'
// Replace with
from '@/shared/components/feedback/ConfirmDialog'

// Find
from '../../molecules/Pagination/Pagination'
// Replace with
from '@/shared/components/feedback/Pagination'
```

#### Replace Context Imports
```javascript
// Find
from '../../../context/ThemeContext'
// Replace with
from '@/shared/context/ThemeContext'

// Find
from '../../../context/LocaleContext'
// Replace with
from '@/shared/context/LocaleContext'
```

#### Replace Utils Imports
```javascript
// Find
from '../../../utils/api'
// Replace with
from '@/shared/utils/api'

// Find
from '../../../utils/permissions'
// Replace with
from '@/shared/utils/permissions'
```

#### Replace Service Imports
```javascript
// Find
from '../../../services/
// Replace with
from '@/features/[feature-name]/services/

// Example:
// from '../../../services/customerService'
// becomes
// from '@/features/customers/services/customerService'
```

### Step 4: Update App.js

Open `src/App.js` and update imports:

```javascript
// OLD IMPORTS - Remove these
import DashboardPage from './components/pages/DashboardPage/DashboardPage';
import LoginPage from './components/pages/LoginPage/LoginPage';
import BusesPage from './components/pages/BusesPage/BusesPage';
import BusDetailPage from './components/pages/BusDetailPage/BusDetailPage';
import CreateBusPage from './components/pages/CreateBusPage/CreateBusPage';
import RoutesPage from './components/pages/RoutesPage/RoutesPage';
import RouteDetailPage from './components/pages/RouteDetailPage/RouteDetailPage';
import CreateRoutePage from './components/pages/createRoutePage/createRoutePage';
import CustomersPage from './components/pages/CustomersPage/CustomersPage';
import CustomerDetailPage from './components/pages/CustomerDetailPage/CustomerDetailPage';
import CreateCustomerPage from './components/pages/CreateCustomerPage/CreateCustomerPage';
import BookingsPage from './components/pages/BookingsPage/BookingsPage';
import ReportsPage from './components/pages/ReportsPage/ReportsPage';
import TeamPage from './components/pages/TeamPage/TeamPage';

// NEW IMPORTS - Add these
import { LoginPage } from '@/features/auth';
import { DashboardPage } from '@/features/dashboard';
import { BusesPage, BusDetailPage, CreateBusPage } from '@/features/buses';
import { RoutesPage, RouteDetailPage, CreateRoutePage } from '@/features/routes';
import { CustomersPage, CustomerDetailPage, CreateCustomerPage } from '@/features/customers';
import { BookingsPage } from '@/features/bookings';
import { ReportsPage } from '@/features/reports';
import { TeamPage } from '@/features/team';
```

### Step 5: Fix lib/utils.js Import

Update `src/lib/utils.js` if it exists (no changes needed, just verify it's there).

### Step 6: Test the Application

```bash
# Start development server
npm run dev

# Check for errors in console
# Test each feature/page
```

### Step 7: Fix Any Remaining Import Errors

If you see import errors:

1. **Check the error message** - it will tell you which file and import is failing
2. **Find the file** in the new structure
3. **Update the import path** using the @ alias

Common patterns:
```javascript
// Feature pages
'@/features/[feature]/pages/[PageName]'

// Feature components
'@/features/[feature]/components/[ComponentName]'

// Shared UI
'@/shared/components/ui/[component]'

// Shared common
'@/shared/components/common/[Component]'

// Shared layout
'@/shared/components/layout/[Component]'
```

### Step 8: Clean Up (Optional - After Everything Works)

Once you've verified everything works:

```bash
# Backup first!
git add .
git commit -m "Backup before cleanup"

# Remove old directories
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

## 🔍 Verification Checklist

- [ ] All directories created
- [ ] Files copied to new locations
- [ ] jsconfig.json created
- [ ] Feature index.js files created
- [ ] Import paths updated in all files
- [ ] App.js updated
- [ ] Application runs without errors
- [ ] All pages load correctly
- [ ] All features work as expected
- [ ] No console errors
- [ ] Old directories removed (optional)

## 🐛 Common Issues & Solutions

### Issue: "Module not found" errors

**Solution:** 
1. Check the import path uses @ alias
2. Verify the file exists in the new location
3. Restart the dev server

### Issue: "Cannot find module '@/shared/...'"

**Solution:**
1. Verify `jsconfig.json` exists in project root
2. Restart your IDE
3. Clear cache: `rm -rf node_modules/.cache`

### Issue: Components not rendering

**Solution:**
1. Check component is exported in feature's index.js
2. Verify import statement is correct
3. Check for circular dependencies

### Issue: Styles not applying

**Solution:**
1. Verify Tailwind CSS is configured
2. Check component uses correct className
3. Ensure global styles are imported

## 📞 Need Help?

1. Check `NEW_ARCHITECTURE_README.md` for detailed documentation
2. Review `MIGRATION_SCRIPT.md` for step-by-step guide
3. Check `ARCHITECTURE_MIGRATION_PLAN.md` for architecture details

## 🎉 Success!

Once all steps are complete and the application runs without errors, you've successfully migrated to the new architecture!

**Benefits you'll see:**
- ✅ Better code organization
- ✅ Easier to find files
- ✅ Clearer feature boundaries
- ✅ Improved maintainability
- ✅ Better team collaboration
- ✅ Scalable structure

---

**Next Steps:**
1. Read `NEW_ARCHITECTURE_README.md` for best practices
2. Start developing with the new structure
3. Enjoy the improved developer experience!
