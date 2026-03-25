# ✅ Architecture Migration Checklist

Print this or keep it open while migrating!

## Pre-Migration

- [ ] Backup your code (commit to git)
- [ ] Read QUICK_START_MIGRATION.md
- [ ] Understand new structure (ARCHITECTURE_DIAGRAM.md)
- [ ] Close all running dev servers

## Phase 1: Setup (15 minutes)

- [ ] Run migration script: `bash migrate-architecture.sh`
- [ ] Verify directories created in `src/features/`
- [ ] Verify directories created in `src/shared/`
- [ ] Check `jsconfig.json` exists in project root
- [ ] Verify feature index.js files exist

## Phase 2: Update Imports (2-3 hours)

### UI Components
- [ ] Replace `from '../../ui/` with `from '@/shared/components/ui/`
- [ ] Replace `from '../ui/` with `from '@/shared/components/ui/`

### Common Components
- [ ] Replace Button imports: `from '@/shared/components/common/Button'`
- [ ] Replace Badge imports: `from '@/shared/components/common/Badge'`
- [ ] Replace Icon imports: `from '@/shared/components/common/Icon'`
- [ ] Replace Input imports: `from '@/shared/components/common/Input'`
- [ ] Replace Snackbar imports: `from '@/shared/components/common/Snackbar'`

### Layout Components
- [ ] Replace Sidebar imports: `from '@/shared/components/layout/Sidebar'`
- [ ] Replace TopBar imports: `from '@/shared/components/layout/TopBar'`
- [ ] Replace NavItem imports: `from '@/shared/components/layout/NavItem'`

### Feedback Components
- [ ] Replace ConfirmDialog: `from '@/shared/components/feedback/ConfirmDialog'`
- [ ] Replace UnauthorizedDialog: `from '@/shared/components/feedback/UnauthorizedDialog'`
- [ ] Replace Pagination: `from '@/shared/components/feedback/Pagination'`

### Context
- [ ] Replace ThemeContext: `from '@/shared/context/ThemeContext'`
- [ ] Replace LocaleContext: `from '@/shared/context/LocaleContext'`

### Utils
- [ ] Replace api utils: `from '@/shared/utils/api'`
- [ ] Replace permissions: `from '@/shared/utils/permissions'`

### Services (Feature-specific)
- [ ] Update authService imports
- [ ] Update busService imports
- [ ] Update routeService imports
- [ ] Update customerService imports
- [ ] Update bookingService imports
- [ ] Update reportService imports
- [ ] Update userService imports

## Phase 3: Update App.js (30 minutes)

- [ ] Import LoginPage from `@/features/auth`
- [ ] Import DashboardPage from `@/features/dashboard`
- [ ] Import BusesPage, BusDetailPage, CreateBusPage from `@/features/buses`
- [ ] Import RoutesPage, RouteDetailPage, CreateRoutePage from `@/features/routes`
- [ ] Import CustomersPage, CustomerDetailPage, CreateCustomerPage from `@/features/customers`
- [ ] Import BookingsPage from `@/features/bookings`
- [ ] Import ReportsPage from `@/features/reports`
- [ ] Import TeamPage from `@/features/team`
- [ ] Remove all old page imports
- [ ] Save and check for syntax errors

## Phase 4: Fix Import Errors (1-2 hours)

- [ ] Start dev server: `npm run dev`
- [ ] Check console for errors
- [ ] Fix "Module not found" errors
- [ ] Fix "Cannot resolve" errors
- [ ] Restart dev server if needed
- [ ] Clear browser cache

## Phase 5: Test Features (1 hour)

### Auth
- [ ] Login page loads
- [ ] Login works
- [ ] Logout works

### Dashboard
- [ ] Dashboard loads
- [ ] Stats display correctly
- [ ] Booking table shows data

### Buses
- [ ] Buses list loads
- [ ] Bus detail page works
- [ ] Create bus works
- [ ] Edit bus works
- [ ] Delete bus works

### Routes
- [ ] Routes list loads
- [ ] Route detail works
- [ ] Create route works
- [ ] Edit route works

### Customers
- [ ] Customers list loads
- [ ] Customer detail works
- [ ] Create customer works
- [ ] Edit customer works
- [ ] Delete customer works

### Bookings
- [ ] Bookings list loads
- [ ] Booking details work

### Reports
- [ ] Reports page loads
- [ ] Charts display

### Team
- [ ] Team page loads
- [ ] Assign roles works

## Phase 6: Verify Functionality (30 minutes)

- [ ] All pages load without errors
- [ ] No console errors
- [ ] Navigation works
- [ ] Dialogs open/close
- [ ] Forms submit correctly
- [ ] Data loads from API
- [ ] Theme switching works
- [ ] Language switching works
- [ ] Responsive design works

## Phase 7: Clean Up (Optional - 15 minutes)

- [ ] Commit current working state
- [ ] Remove `src/components/atoms/`
- [ ] Remove `src/components/molecules/`
- [ ] Remove `src/components/organisms/`
- [ ] Remove `src/components/pages/`
- [ ] Remove `src/components/ui/`
- [ ] Remove `src/context/`
- [ ] Remove `src/hooks/`
- [ ] Remove `src/services/`
- [ ] Remove `src/utils/`
- [ ] Test again after cleanup
- [ ] Commit final changes

## Phase 8: Documentation (30 minutes)

- [ ] Update project README
- [ ] Document new structure for team
- [ ] Add feature-specific READMEs
- [ ] Update onboarding docs
- [ ] Share with team

## Troubleshooting

### If you see "Module not found"
- [ ] Check file exists in new location
- [ ] Verify import path uses @ alias
- [ ] Restart dev server
- [ ] Clear node_modules/.cache

### If path aliases don't work
- [ ] Verify jsconfig.json exists
- [ ] Restart IDE
- [ ] Restart dev server
- [ ] Check jsconfig.json syntax

### If components don't render
- [ ] Check component exported in index.js
- [ ] Verify import statement
- [ ] Check for circular dependencies
- [ ] Look for typos in import paths

### If styles don't apply
- [ ] Check Tailwind config
- [ ] Verify className usage
- [ ] Check global styles imported
- [ ] Clear browser cache

## Success Criteria

- [ ] ✅ Application runs without errors
- [ ] ✅ All features work correctly
- [ ] ✅ All imports use @ aliases
- [ ] ✅ No console errors
- [ ] ✅ Tests pass (if applicable)
- [ ] ✅ Team understands new structure
- [ ] ✅ Documentation updated

## Time Tracking

| Phase | Estimated | Actual | Notes |
|-------|-----------|--------|-------|
| Setup | 15 min | | |
| Update Imports | 2-3 hours | | |
| Update App.js | 30 min | | |
| Fix Errors | 1-2 hours | | |
| Test Features | 1 hour | | |
| Verify | 30 min | | |
| Clean Up | 15 min | | |
| Documentation | 30 min | | |
| **Total** | **4-6 hours** | | |

## Notes

Use this space for notes during migration:

```
Issues encountered:


Solutions applied:


Things to remember:


```

---

**Start Time:** ___________  
**End Time:** ___________  
**Total Time:** ___________  

**Status:** 
- [ ] In Progress
- [ ] Complete
- [ ] Needs Review

**Migrated By:** ___________  
**Date:** ___________  
**Reviewed By:** ___________
