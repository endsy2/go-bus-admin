# Architecture Diagram

## 📊 Visual Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Application                              │
│                          (App.jsx)                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌─────────────────┐            ┌──────────────────┐
│    Features     │            │     Shared       │
│   (Business)    │◄───────────│   (Reusable)     │
└─────────────────┘            └──────────────────┘
```

## 🎯 Feature Structure

```
┌──────────────────────────────────────────────────────────────┐
│                      Feature Module                           │
│  (e.g., customers, buses, routes)                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Pages     │  │ Components  │  │   Hooks     │         │
│  │             │  │             │  │             │         │
│  │ - List      │  │ - Dialogs   │  │ - useData   │         │
│  │ - Detail    │  │ - Forms     │  │ - useForm   │         │
│  │ - Create    │  │ - Cards     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐                           │
│  │  Services   │  │   index.js  │                           │
│  │             │  │             │                           │
│  │ - API calls │  │ - Exports   │                           │
│  │ - Business  │  │ - Public    │                           │
│  │   logic     │  │   API       │                           │
│  └─────────────┘  └─────────────┘                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 🔧 Shared Resources

```
┌──────────────────────────────────────────────────────────────┐
│                    Shared Resources                           │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Components                              │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │                                                      │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │  │    UI    │  │  Common  │  │  Layout  │         │    │
│  │  │          │  │          │  │          │         │    │
│  │  │ - button │  │ - Button │  │ - Sidebar│         │    │
│  │  │ - dialog │  │ - Badge  │  │ - TopBar │         │    │
│  │  │ - input  │  │ - Icon   │  │ - NavItem│         │    │
│  │  │ - card   │  │ - Input  │  │          │         │    │
│  │  └──────────┘  └──────────┘  └──────────┘         │    │
│  │                                                      │    │
│  │  ┌──────────┐                                       │    │
│  │  │ Feedback │                                       │    │
│  │  │          │                                       │    │
│  │  │ - Dialog │                                       │    │
│  │  │ - Pagination                                     │    │
│  │  └──────────┘                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Hooks   │  │ Context  │  │  Utils   │  │Constants │   │
│  │          │  │          │  │          │  │          │   │
│  │ - useApi │  │ - Theme  │  │ - api    │  │ - routes │   │
│  │ - useAuth│  │ - Locale │  │ - perms  │  │ - config │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌─────────────┐
│   User      │
│  Action     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Page     │ ◄─── Feature
│  Component  │
└──────┬──────┘
       │
       ├──────► ┌─────────────┐
       │        │   Hooks     │ ◄─── Feature
       │        └──────┬──────┘
       │               │
       ▼               ▼
┌─────────────┐  ┌─────────────┐
│  Feature    │  │   Service   │ ◄─── Feature
│ Components  │  │   (API)     │
└──────┬──────┘  └──────┬──────┘
       │                │
       │                ▼
       │         ┌─────────────┐
       │         │   Backend   │
       │         │     API     │
       │         └──────┬──────┘
       │                │
       │                ▼
       │         ┌─────────────┐
       └────────►│   Shared    │
                 │ Components  │
                 └─────────────┘
```

## 🏗️ Import Hierarchy

```
┌─────────────────────────────────────────────────────────────┐
│                      Import Rules                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Features                                                    │
│     │                                                        │
│     ├──► Can import from Shared                             │
│     │                                                        │
│     └──► Cannot import from other Features                  │
│                                                              │
│  Shared                                                      │
│     │                                                        │
│     ├──► Can import from other Shared                       │
│     │                                                        │
│     └──► Cannot import from Features                        │
│                                                              │
│  Pages (in Features)                                         │
│     │                                                        │
│     ├──► Can import from same Feature                       │
│     │                                                        │
│     └──► Can import from Shared                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Feature Example: Customers

```
customers/
│
├── pages/
│   ├── CustomersPage.jsx ──────┐
│   ├── CustomerDetailPage.jsx ─┤
│   └── CreateCustomerPage.jsx ─┤
│                                │
├── components/                  │
│   ├── CreateCustomerDialog ◄──┤
│   ├── EditCustomerDialog ◄────┤
│   └── CustomerRow ◄───────────┤
│                                │
├── hooks/                       │
│   └── useCustomers.js ◄────────┤
│                                │
├── services/                    │
│   └── customerService.js ◄─────┤
│                                │
└── index.js ◄───────────────────┘
     │
     └──► Exports public API
```

## 🎨 Component Hierarchy

```
App.jsx
│
├── ThemeProvider (Shared Context)
│   │
│   └── LocaleProvider (Shared Context)
│       │
│       ├── Sidebar (Shared Layout)
│       │   │
│       │   └── NavItem (Shared Layout)
│       │
│       ├── TopBar (Shared Layout)
│       │
│       └── Routes
│           │
│           ├── DashboardPage (Feature)
│           │   │
│           │   ├── StatsGrid (Feature)
│           │   │   └── StatCard (Feature)
│           │   │
│           │   └── BookingTable (Feature)
│           │
│           ├── CustomersPage (Feature)
│           │   │
│           │   ├── CreateCustomerDialog (Feature)
│           │   │   ├── Dialog (Shared UI)
│           │   │   ├── Input (Shared Common)
│           │   │   └── Button (Shared Common)
│           │   │
│           │   └── Pagination (Shared Feedback)
│           │
│           └── ... other features
```

## 🔐 Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    Dependency Layers                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Layer 1: UI Primitives (shadcn/ui)                         │
│  ├── button, dialog, input, card, etc.                      │
│  └── No dependencies on app code                            │
│                                                              │
│  Layer 2: Common Components                                 │
│  ├── Button, Badge, Icon, Input                             │
│  └── Depends on: Layer 1                                    │
│                                                              │
│  Layer 3: Layout & Feedback                                 │
│  ├── Sidebar, TopBar, Dialogs, Pagination                   │
│  └── Depends on: Layer 1, Layer 2                           │
│                                                              │
│  Layer 4: Context & Utils                                   │
│  ├── Theme, Locale, API, Permissions                        │
│  └── Depends on: Layer 1                                    │
│                                                              │
│  Layer 5: Feature Components                                │
│  ├── Feature-specific components                            │
│  └── Depends on: Layer 1-4                                  │
│                                                              │
│  Layer 6: Feature Pages                                     │
│  ├── Page components                                        │
│  └── Depends on: Layer 1-5                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📝 File Naming Convention

```
┌─────────────────────────────────────────────────────────────┐
│                   Naming Conventions                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Folders:        lowercase-with-dashes                       │
│                  Example: customers, bus-management          │
│                                                              │
│  Components:     PascalCase.jsx                              │
│                  Example: CustomersPage.jsx                  │
│                                                              │
│  Hooks:          camelCase.js (with 'use' prefix)            │
│                  Example: useCustomers.js                    │
│                                                              │
│  Services:       camelCase.js (with 'Service' suffix)        │
│                  Example: customerService.js                 │
│                                                              │
│  Utils:          camelCase.js                                │
│                  Example: formatDate.js                      │
│                                                              │
│  Constants:      UPPER_SNAKE_CASE or camelCase               │
│                  Example: API_ENDPOINTS or config.js         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Benefits Visualization

```
Before (Atomic Design)          After (Feature-Based)
─────────────────────          ──────────────────────

atoms/                          features/
├── Button/                       ├── customers/
├── Input/                        │   ├── components/
└── Badge/                        │   ├── hooks/
                                  │   ├── services/
molecules/                        │   └── pages/
├── Dialog/                       │
├── Form/                         ├── buses/
└── Card/                         │   ├── components/
                                  │   ├── hooks/
organisms/                        │   ├── services/
├── Header/                       │   └── pages/
├── Sidebar/                      │
└── Table/                        └── ... more features

pages/                          shared/
├── CustomersPage/                ├── components/
├── BusesPage/                    │   ├── ui/
└── DashboardPage/                │   ├── common/
                                  │   ├── layout/
❌ Hard to find feature code      │   └── feedback/
❌ Scattered across folders       │
❌ Unclear boundaries             ├── hooks/
                                  ├── context/
                                  └── utils/

                                ✅ Feature code together
                                ✅ Clear organization
                                ✅ Easy to maintain
```

---

This architecture provides a scalable, maintainable structure that grows with your application!
