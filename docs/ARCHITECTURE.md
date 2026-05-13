# Application Architecture

## Overview

Agency Client Portal Aggregator follows a clean, layered architecture with clear separation of concerns. The application uses React Router v7 for client-side routing with role-based access control.

## Directory Structure

```
src/
├── app/                          # Application-level setup
│   ├── App.jsx                  # Root component with providers
│   ├── components/              # App-level components (DemoRoleSwitcher)
│   ├── layout/                  # Layout wrappers (RootLayout, AuthLayout)
│   ├── providers/               # Context providers
│   │   ├── auth/                # Authentication context and hooks
│   │   ├── repositories/        # Data repositories
│   │   └── session/             # Session management
│   └── routing/                 # React Router configuration
│       ├── router.jsx           # Router definition with routes
│       ├── ProtectedRoute.jsx   # Role-based access control wrapper
│       └── PageWrapper.jsx      # Wrapper to inject props into pages
├── domain/                       # Business logic
│   ├── policies/                # Business rules and policies
│   └── services/                # Domain services (auth, tracking, etc.)
├── entities/                     # Domain models
│   ├── client/
│   ├── profile/
│   ├── task/
│   ├── update/
│   └── ...                      # Other domain models
├── features/                     # Feature modules
│   ├── admin-client-setup/
│   ├── admin-overview-editor/
│   ├── client-overview/
│   ├── dashboard-links/
│   ├── needed-from-client/
│   ├── reports/
│   └── tasks/
├── pages/                        # Page components
│   ├── admin/
│   ├── auth/
│   ├── client/
│   ├── system/
│   ├── team/
│   └── legacy/
├── shared/                       # Shared utilities and components
│   ├── charts/                  # Chart components
│   ├── data/                    # Data utilities and hooks
│   ├── icons/                   # Icon system
│   ├── layout/                  # Layout components (AppShell, TopNav)
│   ├── notifications/           # Toast notification system
│   ├── theme/                   # Theme provider
│   └── ui/                      # UI components
├── widgets/                      # Complex, reusable widget components
│   ├── client-overview/
│   ├── dashboard-embed/
│   └── reports/
└── App.jsx                       # Root component export
```

## Routing Architecture

The application uses **React Router v7** with hash-based routing for GitHub Pages compatibility.

### Router Configuration (`src/app/routing/router.jsx`)

- Defines all routes with nested structure
- Supports lazy-loaded page components
- Configured with `basename: '/agency-reports'` for GitHub Pages deployment
- Routes are organized by user role:
  - **Public**: Landing page
  - **Auth**: Login, accept invite, access denied
  - **Client**: Client overview, dashboard, reports
  - **Admin**: Client management, overview editor
  - **Team**: Task management
  - **Legacy**: Placeholder pages

### Role-Based Access Control

**ProtectedRoute** component (`src/app/routing/ProtectedRoute.jsx`):
- Wraps routes that require authentication
- Checks user role against `allowedRoles` array
- Redirects unauthorized users to `/access-denied`
- Redirects unauthenticated users to `/login`

### Page Wrapper (`src/app/routing/PageWrapper.jsx`)

Pages expect `runtime`, `routeParams`, and `onAuthChange` props. The `createPageWrapper` utility:
- Extracts these from hooks (useAuth, useSearchParams)
- Injects them as props for backward compatibility
- Minimizes changes to existing page components

## Authentication & Authorization

### AuthProvider (`src/app/providers/auth/AuthProvider.jsx`)

Central authentication context providing:
- `viewer`: Current authenticated user with role and client IDs
- `runtime`: Computed runtime state including default client, repositories, data client
- `onAuthChange`: Callback to refresh auth state
- `repositories`: Access to portal data repositories

### useAuth Hook (`src/app/providers/auth/useAuth.js`)

Custom hook for accessing authentication context in any component:

```jsx
const { viewer, runtime, onAuthChange, repositories } = useAuth()
```

## Layout System

### RootLayout (`src/app/layout/RootLayout.jsx`)

Main application layout with:
- AppShell wrapper for authenticated users
- Role-filtered navigation
- Demo role switcher
- Outlet for nested routes

### AuthLayout (`src/app/layout/AuthLayout.jsx`)

Auth page layout (login, accept invite):
- Simple wrapper without AppShell
- Demo role switcher visible
- Used for pages in 'auth' layout type

## Data Management

### Repository Pattern

Data access is abstracted through repositories:
- `portalRepository`: In-memory repository with seed data (local storage backed)
- `portalDataClient`: Async wrapper for potential future API integration

Location: `src/app/providers/repositories/`

### Domain Services

Business logic is organized in services:
- `authService`: User authentication and session management
- `clientOverviewService`: Client overview data aggregation
- `activityTrackingService`: User activity tracking
- Other domain-specific services

Location: `src/domain/services/`

## Component Organization

### Shared Components (`src/shared/`)

Reusable across the application:
- **UI Components**: Button, Card, Badge, Tabs, etc. (shadcn/Tailwind)
- **Charts**: Line, Bar, Donut charts
- **Icons**: Centralized icon registry
- **Layout**: AppShell, TopNav, PageHeader

### Feature Components (`src/features/`)

Domain-specific feature modules with:
- Feature-specific components
- Feature-specific state/model management
- Feature-specific business logic

### Page Components (`src/pages/`)

Organized by user role:
- Compose features and shared components
- Handle route-level concerns
- Receive runtime context from wrapper

### Widget Components (`src/widgets/`)

Complex, reusable UI units that:
- Combine multiple features
- Used across different pages
- Self-contained with their own state

## State Management

- **Authentication**: Managed by AuthProvider context
- **Session**: Stored in localStorage with TTL
- **Viewer/Runtime**: Derived from session + repository data
- **Page-level state**: Local component state (useState)
- **Feature state**: Managed within feature modules

No centralized state manager (Redux, Zustand, etc.) - uses React context and local state.

## Design System

**Framework**: Tailwind CSS v4 with semantic tokens

**Typography**: Geist Variable font

**Colors**: Semantic roles (brand, action, success, text-primary, etc.)

**Components**: Built with shadcn/ui patterns using Radix UI primitives

Reference: `docs/design-system.md`

## Development Workflow

### Adding a New Route

1. Create page component in `src/pages/{role}/{feature}/`
2. Add route metadata to `src/app/routing/router.jsx`
3. Wrap with `createPageWrapper` if page needs runtime/routeParams
4. Protect with `ProtectedRoute` if role-based access needed

### Adding a New Feature

1. Create feature module in `src/features/{feature-name}/`
2. Include components and model/state management
3. Export components from feature index
4. Use in pages or other features

### Adding Shared Components

1. Create component in `src/shared/{category}/`
2. Export from category index
3. Use Tailwind utilities for styling (no CSS files)

## Deployment

**Platform**: GitHub Pages

**Build**: `npm run build` outputs to `dist/`

**Deploy**: `npm run go` runs build and deploys via gh-pages

**Routing**: Client-side routing with React Router, base path `/agency-reports/`

## Testing

- **Unit tests**: Vitest with `.test.js` files
- **E2E tests**: Playwright
- **No snapshots**: Focus on behavior testing

## Key Technologies

- **React 19**: UI framework
- **React Router v7**: Client-side routing
- **Tailwind CSS v4**: Styling
- **Radix UI**: Headless components
- **shadcn/ui**: Component library
- **Vite**: Build tooling
- **Vitest**: Unit testing
- **Playwright**: E2E testing

## Migration Notes (Hash Routing → React Router)

- Removed hash-based routing (`window.location.hash`)
- Migrated to standard URL paths (`/client/overview` instead of `#client-overview`)
- Preserved role-based access control via ProtectedRoute
- Pages still work with old prop interface via PageWrapper
- Session and auth logic unchanged

This ensures a clean, maintainable architecture that scales with the product while keeping code organized and easy to navigate.
