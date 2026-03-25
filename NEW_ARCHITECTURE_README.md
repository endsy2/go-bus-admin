# Component-Based + Feature-Based Architecture

## 🎯 Overview

This project now uses a **Component-Based + Feature-Based Architecture** that organizes code by features while keeping shared components separate. This approach provides better scalability, maintainability, and team collaboration.

## 📁 New Structure

```
src/
├── features/                    # Feature modules (business logic)
│   ├── auth/                   # Authentication
│   ├── dashboard/              # Dashboard & analytics
│   ├── buses/                  # Bus management
│   ├── routes/                 # Route management
│   ├── customers/              # Customer management
│   ├── bookings/               # Booking management
│   ├── reports/                # Reports & analytics
│   └── team/                   # Team & user management
│
├── shared/                      # Shared resources
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── common/             # Common components (Button, Input, etc.)
│   │   ├── layout/             # Layout components (Sidebar, TopBar)
│   │   └── feedback/           # Feedback components (Dialogs, Pagination)
│   ├── hooks/                  # Shared hooks
│   ├── context/                # Global context providers
│   ├── utils/                  # Utility functions
│   └── constants/              # Constants & config
│
├── locales/                    # Internationalization
├── lib/                        # Third-party lib configs
├── App.jsx                     # Root component
└── index.js                    # Entry point
```

## 🎨 Feature Structure

Each feature follows this consistent structure:

```
features/[feature-name]/
├── components/          # Feature-specific components
├── hooks/              # Feature-specific hooks
├── services/           # API calls & business logic
├── pages/              # Feature pages/routes
└── index.js            # Public API exports
```

### Example: Customers Feature

```
features/customers/
├── components/
│   ├── CreateCustomerDialog.jsx
│   ├── EditCustomerDialog.jsx
│   └── CustomerRow.jsx
├── hooks/
│   └── useCustomers.js
├── services/
│   └── customerService.js
├── pages/
│   ├── CustomersPage.jsx
│   ├── CustomerDetailPage.jsx
│   └── CreateCustomerPage.jsx
└── index.js
```

## 🔧 How to Use

### Importing from Features

```javascript
// Import from feature's public API
import { CustomersPage, CreateCustomerDialog } from '@/features/customers';
import { DashboardPage, useStats } from '@/features/dashboard';
import { BusesPage, busService } from '@/features/buses';
```

### Importing Shared Components

```javascript
// UI primitives
import { Button } from '@/shared/components/ui/button';
import { Dialog } from '@/shared/components/ui/dialog';

// Common components
import { Icon } from '@/shared/components/common/Icon';
import { Badge } from '@/shared/components/common/Badge';

// Layout components
import { Sidebar } from '@/shared/components/layout/Sidebar';
import { TopBar } from '@/shared/components/layout/TopBar';

// Feedback components
import { ConfirmDialog } from '@/shared/components/feedback/ConfirmDialog';
import { Pagination } from '@/shared/components/feedback/Pagination';
```

### Importing Context & Utils

```javascript
// Context
import { useTheme } from '@/shared/context/ThemeContext';
import { useLocale } from '@/shared/context/LocaleContext';

// Utils
import { apiRequest } from '@/shared/utils/api';
import { hasPermission } from '@/shared/utils/permissions';
```

## 📝 Path Aliases

The project uses path aliases configured in `jsconfig.json`:

```json
{
  "@/*": ["*"],
  "@/shared/*": ["shared/*"],
  "@/features/*": ["features/*"]
}
```

This allows clean imports without relative paths:

```javascript
// ❌ Old way
import Button from '../../../atoms/Button/Button';

// ✅ New way
import { Button } from '@/shared/components/common/Button';
```

## 🚀 Migration Steps

### 1. Run Migration Script

```bash
# Make script executable
chmod +x migrate-architecture.sh

# Run migration
./migrate-architecture.sh
```

### 2. Update Import Paths

Use find-and-replace in your IDE:

**Find:** `from '../../atoms/Button/Button'`  
**Replace:** `from '@/shared/components/common/Button'`

**Find:** `from '../../ui/button'`  
**Replace:** `from '@/shared/components/ui/button'`

**Find:** `from '../../../context/ThemeContext'`  
**Replace:** `from '@/shared/context/ThemeContext'`

### 3. Update App.js

```javascript
// Old imports
import DashboardPage from './components/pages/DashboardPage/DashboardPage';
import CustomersPage from './components/pages/CustomersPage/CustomersPage';

// New imports
import { DashboardPage } from '@/features/dashboard';
import { CustomersPage } from '@/features/customers';
```

### 4. Test & Verify

```bash
npm run dev
```

### 5. Clean Up (After Verification)

```bash
# Remove old structure
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

## 🎯 Benefits

### 1. **Feature Isolation**
- All code for a feature is in one place
- Easy to find and modify feature-specific code
- Clear ownership and boundaries

### 2. **Scalability**
- Easy to add new features
- Easy to remove features
- Can split into micro-frontends if needed

### 3. **Maintainability**
- Clear structure and organization
- Reduced cognitive load
- Easier onboarding for new developers

### 4. **Reusability**
- Shared components are explicitly in `shared/`
- Features export public APIs
- No hidden dependencies

### 5. **Team Collaboration**
- Teams can own specific features
- Less merge conflicts
- Parallel development

## 📚 Best Practices

### 1. Feature Independence
- Features should not import from other features directly
- Use shared components for cross-feature needs
- Export public APIs through `index.js`

### 2. Shared Components
- Only put truly reusable components in `shared/`
- Feature-specific components stay in the feature
- Document shared component usage

### 3. Service Layer
- Keep API calls in service files
- Services handle data transformation
- Features can have their own services

### 4. Hooks
- Feature-specific hooks in feature's `hooks/` folder
- Shared hooks in `shared/hooks/`
- Follow React hooks naming convention

### 5. Naming Conventions
- Features: lowercase (e.g., `customers`, `buses`)
- Components: PascalCase (e.g., `CustomersPage.jsx`)
- Services: camelCase (e.g., `customerService.js`)
- Hooks: camelCase with `use` prefix (e.g., `useCustomers.js`)

## 🔍 Example Workflows

### Adding a New Feature

1. Create feature directory:
```bash
mkdir -p src/features/my-feature/{components,hooks,services,pages}
```

2. Create index.js:
```javascript
// src/features/my-feature/index.js
export { default as MyFeaturePage } from './pages/MyFeaturePage';
export { myFeatureService } from './services/myFeatureService';
```

3. Import in App.js:
```javascript
import { MyFeaturePage } from '@/features/my-feature';
```

### Adding a Shared Component

1. Create component:
```javascript
// src/shared/components/common/MyComponent.jsx
export const MyComponent = ({ children }) => {
  return <div>{children}</div>;
};
```

2. Use in features:
```javascript
import { MyComponent } from '@/shared/components/common/MyComponent';
```

### Adding a Feature-Specific Component

1. Create in feature:
```javascript
// src/features/customers/components/CustomerCard.jsx
export const CustomerCard = ({ customer }) => {
  return <div>{customer.name}</div>;
};
```

2. Export in feature index:
```javascript
// src/features/customers/index.js
export { CustomerCard } from './components/CustomerCard';
```

## 🐛 Troubleshooting

### Import Errors

If you see import errors:
1. Check `jsconfig.json` is in project root
2. Restart your IDE/editor
3. Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Path Alias Not Working

1. Verify `jsconfig.json` syntax
2. Check file paths are correct
3. Restart development server

### Component Not Found

1. Check component is exported in feature's `index.js`
2. Verify import path uses correct alias
3. Check file extension (.jsx vs .js)

## 📖 Additional Resources

- [Feature-Sliced Design](https://feature-sliced.design/)
- [React Project Structure Best Practices](https://www.robinwieruch.de/react-folder-structure/)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

## 🤝 Contributing

When adding new features or components:
1. Follow the established structure
2. Export public APIs through index files
3. Update this README if needed
4. Add JSDoc comments for complex functions
5. Write tests for critical functionality

---

**Migration Date:** March 25, 2026  
**Architecture:** Component-Based + Feature-Based  
**Status:** ✅ Ready for Development
