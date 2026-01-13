# Frontend Implementation Roadmap

Angular frontend for Homely property list web application.

---

## Tech Stack

- **Framework:** Angular 19+
- **Styling:** Tailwind CSS
- **State Management:** Angular Signals + Signal Stores
- **Real-time:** RxJS WebSocket
- **HTTP:** Angular HttpClient with interceptors
- **Forms:** Reactive Forms with Signal integration
- **Routing:** Angular Router with functional guards
- **Build:** Angular CLI

---

## Architecture Overview

### Core Modules
- **Core Module:** Singleton services (auth, WebSocket, API)
- **Shared Module:** Reusable components, pipes, directives
- **Feature Modules:** Property lists, properties, context reports, ratings

### State Management Strategy
- **Signal Stores:** Feature-based signal stores for property lists, properties, context data, ratings
- **Computed Signals:** Derived state for filtering, sorting, aggregations
- **RxJS Integration:** Handle async operations (API calls, WebSocket events) via `rxMethod()`
- **Entity Management:** Custom entity adapters using signals for normalized data

### Component Structure
- **Smart Components:** Inject signal stores, read signals, call store methods
- **Presentational Components:** Signal inputs, output events
- **Layout Components:** Shell, navigation, headers

---

## Implementation Phases

## Phase 1: Foundation & Setup
**Goal:** Angular project scaffolding, core infrastructure, authentication

### Tasks
- [ ] Initialize Angular project with Tailwind CSS
- [ ] Configure ESLint, Prettier, Git hooks
- [ ] Set up project structure (core, shared, feature modules)
- [ ] Install dependencies (RxJS, date-fns, @ngrx/signals, etc.)
- [ ] Configure environment files (API URLs, WebSocket endpoints)
- [ ] Create core services:
  - [ ] AuthService (login, register, token management with signals)
  - [ ] ApiService (base HTTP service with interceptors)
  - [ ] WebSocketService (connection management, reconnection logic)
  - [ ] NotificationService (toast/snackbar notifications)
- [ ] Create core signal stores:
  - [ ] AuthStore (user, token, loading, error signals)
  - [ ] UiStore (sidebar, theme, notifications)
- [ ] HTTP interceptors:
  - [ ] Auth interceptor (add JWT tokens)
  - [ ] Error interceptor (global error handling)
- [ ] Functional guards:
  - [ ] authGuard (route protection using signals)
  - [ ] guestGuard (redirect authenticated users)
- [ ] Create shared utilities:
  - [ ] Address normalization
  - [ ] Date formatting
  - [ ] Currency pipes
  - [ ] Signal helper utilities
- [ ] Set up routing structure:
  - [ ] Root routing with functional guards
  - [ ] Lazy-loaded feature modules

**Deliverables:**
- Functional Angular app with authentication flow
- API service layer with interceptors
- WebSocket service with reconnection
- Basic layout shell (header, sidebar, main content area)

---

## Phase 2: Stage 1 - Property List & Property Management
**Goal:** CRUD operations for property lists and properties

### 2.1 Property List Module

#### Tasks
- [ ] Create PropertyList feature module
- [ ] Signal store setup:
  - [ ] PropertyListStore with entity management
  - [ ] Signals: lists, selectedList, loading, error
  - [ ] Computed signals: listsCount, activeListsOnly
  - [ ] Methods: load(), create(), update(), delete(), select()
  - [ ] RxMethod for API calls with loading/error handling
- [ ] Components:
  - [ ] PropertyListListComponent (dashboard view)
  - [ ] PropertyListDetailComponent (single list view)
  - [ ] PropertyListFormComponent (create/edit form)
  - [ ] PropertyListCardComponent (list card display)
- [ ] Routing:
  - [ ] /lists (all lists)
  - [ ] /lists/:id (single list detail)
  - [ ] /lists/new (create list)

#### UI Features
- [ ] Property list creation form
- [ ] Property list grid/card display
- [ ] Delete confirmation dialogs
- [ ] State badges (Draft, Active)
- [ ] Empty states (no lists)

### 2.2 Property Module

#### Tasks
- [ ] Create Property feature module
- [ ] Signal store setup:
  - [ ] PropertyStore with entity management
  - [ ] Signals: properties, selectedProperty, loading, error
  - [ ] Computed signals: propertiesByList, propertiesByState, selectedListProperties
  - [ ] Methods: load(), create(), update(), delete(), select(), checkDuplicate()
  - [ ] RxMethod for API calls and deduplication checks
- [ ] Components:
  - [ ] PropertyListComponent (properties in a list)
  - [ ] PropertyDetailComponent (single property view)
  - [ ] PropertyFormComponent (manual entry form)
  - [ ] PropertyCardComponent (property card display)
  - [ ] PropertyExtractionFormComponent (text/URL extraction)
  - [ ] DeduplicationWarningComponent (duplicate detection dialog)
- [ ] Routing:
  - [ ] /lists/:listId/properties (properties in list)
  - [ ] /properties/:id (property detail)
  - [ ] /lists/:listId/properties/new (add property)

#### Property Creation Methods
- [ ] Manual form entry:
  - [ ] Address autocomplete (Ideal Postcodes API)
  - [ ] Validation (required fields, formats)
  - [ ] Field type handling (enums, booleans)
- [ ] Text extraction:
  - [ ] Textarea input
  - [ ] Backend parsing call
  - [ ] Review/edit extracted data
- [ ] URL extraction:
  - [ ] URL input (Rightmove/Zoopla)
  - [ ] Backend scraping call
  - [ ] Review/edit extracted data
- [ ] Deduplication:
  - [ ] Check on form submit
  - [ ] Display warning modal with existing property link
  - [ ] Allow force create option

#### UI Features
- [ ] Property cards with state badges
- [ ] Property detail view (tabbed interface)
- [ ] Edit property inline/modal
- [ ] Delete confirmation
- [ ] Field change confirmation dialogs (service rerun warnings)

### 2.3 Collaboration Features

#### Tasks
- [ ] Components:
  - [ ] CollaboratorManagementComponent (add viewers/contributors)
  - [ ] CommentListComponent (property/list comments)
  - [ ] CommentFormComponent (add comment)
  - [ ] UserSearchComponent (search users to add)
- [ ] WebSocket integration:
  - [ ] Listen for collaborative edit events
  - [ ] Display notifications (User X edited property Y)
  - [ ] Real-time comment updates
- [ ] UI features:
  - [ ] Collaborator list display
  - [ ] Add/remove collaborators
  - [ ] Comment threads with tagging
  - [ ] Activity feed

### 2.4 Context Options & Rating Criteria Setup

#### Tasks
- [ ] Components:
  - [ ] ContextOptionsFormComponent (configure services)
  - [ ] RatingCriteriaFormComponent (create/edit criteria)
  - [ ] RatingCriteriaListComponent (browse existing criteria)
  - [ ] CriterionConfigComponent (individual criterion setup)
- [ ] Forms:
  - [ ] Service toggles (crime, schools, broadband, mobile, POI)
  - [ ] POI type selection (checkboxes)
  - [ ] POI radius configuration
  - [ ] Criterion importance weights (radio buttons)
  - [ ] Dealbreaker configuration (toggles + thresholds)
  - [ ] Ordinal mapping editor (key-value pairs)
- [ ] Routing:
  - [ ] /lists/:id/context-options (configure context)
  - [ ] /lists/:id/rating-criteria (configure rating)
  - [ ] /rating-criteria (browse all criteria)

**Deliverables:**
- Full property list & property CRUD
- 3 property creation methods
- Deduplication detection
- Collaboration features (viewers, contributors, comments)
- Context options & rating criteria configuration

---

## Phase 3: Stage 2 - Context Retrieval
**Goal:** Asynchronous context service execution with progressive loading

### 3.1 Context Data State Management

#### Tasks
- [ ] Signal store setup:
  - [ ] ContextDataStore with entity management
  - [ ] Signals: contextDataByProperty, serviceStates, loading, error
  - [ ] Computed signals: progressByProperty, completedServices, failedServices
  - [ ] Methods: triggerServices(), retryService(), updateProgress()
  - [ ] RxMethod for API calls and WebSocket event handling
- [ ] WebSocket integration:
  - [ ] Subscribe to property list channel
  - [ ] Handle service_update events via RxJS
  - [ ] Update signal store state on events
  - [ ] Auto-update UI reactively

### 3.2 Context Reports UI

#### Tasks
- [ ] Components:
  - [ ] ContextReportsComponent (all reports for property)
  - [ ] CrimeReportComponent (crime statistics display)
  - [ ] SchoolsReportComponent (school ratings display)
  - [ ] BroadbandReportComponent (broadband info display)
  - [ ] MobileCoverageComponent (mobile coverage display)
  - [ ] PoiReportComponent (places of interest display)
  - [ ] ServiceStatusComponent (loading/complete/failed indicator)
  - [ ] ProgressBarComponent (overall progress)
- [ ] Features:
  - [ ] "Retrieve Context Reports" button (individual/bulk)
  - [ ] Progressive loading (show completed services immediately)
  - [ ] Loading spinners for in-progress services
  - [ ] Error indicators for failed services
  - [ ] Retry button for failed services
  - [ ] Progress bar (X/Y services complete)
  - [ ] Service detail modals/expandable sections

### 3.3 Automatic Rerun Handling

#### Tasks
- [ ] Field change detection:
  - [ ] Track dirty fields in property form
  - [ ] Check field-service dependency matrix
  - [ ] Show confirmation dialog if services affected
- [ ] Confirmation dialog component:
  - [ ] List affected services
  - [ ] API cost warning
  - [ ] "Don't ask again" checkbox
  - [ ] Cancel/Confirm buttons
- [ ] Context options modification:
  - [ ] Detect new services added
  - [ ] Auto-trigger for existing properties
  - [ ] Confirmation for service removal

**Deliverables:**
- Context service triggering (individual/bulk)
- Real-time progressive loading via WebSocket
- Service status tracking (pending/in-progress/complete/failed)
- Retry mechanism for failed services
- Field change detection & rerun confirmation

---

## Phase 4: Stage 3 - Rating System
**Goal:** Property rating calculation and comparison

### 4.1 Rating State Management

#### Tasks
- [ ] Signal store setup:
  - [ ] RatingStore with entity management
  - [ ] Signals: ratingsByProperty, criterionScores, loading, error
  - [ ] Computed signals: sortedProperties, disqualifiedProperties, topRatedProperties
  - [ ] Methods: calculateRating(), updateScores(), sortBy(), filterBy()
  - [ ] RxMethod for API calls and automatic re-rating
- [ ] WebSocket integration:
  - [ ] Handle rating_complete events via RxJS
  - [ ] Auto-update signal store reactively

### 4.2 Rating Display UI

#### Tasks
- [ ] Components:
  - [ ] RatingOverviewComponent (overall rating display)
  - [ ] RatingBreakdownComponent (criterion scores table)
  - [ ] StarRatingComponent (star visualization)
  - [ ] CriterionScoreCardComponent (individual criterion card)
  - [ ] DisqualificationBannerComponent (dealbreaker failure notice)
- [ ] Features:
  - [ ] "Calculate Rating" button (individual/bulk)
  - [ ] Overall rating display (numeric + stars)
  - [ ] Criterion breakdown table:
    - [ ] Criterion name + importance badge
    - [ ] Progress bar (normalized score)
    - [ ] Raw value display
    - [ ] Weighted score
  - [ ] Expandable "View All Criteria" section
  - [ ] Disqualification warning banner

### 4.3 Property Comparison

#### Tasks
- [ ] Components:
  - [ ] PropertyComparisonComponent (sorted list view)
  - [ ] ComparisonTableComponent (side-by-side table)
  - [ ] ComparisonFiltersComponent (filter/sort controls)
- [ ] Features:
  - [ ] Sort by rating (high/low)
  - [ ] Filter (disqualified, state, price range)
  - [ ] Side-by-side comparison table (select 2-4 properties)
  - [ ] Highlight differences
  - [ ] Export comparison (CSV/PDF)

### 4.4 Rating Criteria Management UI

#### Tasks
- [ ] Copy-on-write handling:
  - [ ] Detect shared criteria on edit
  - [ ] Show fork dialog
  - [ ] Create new criteria instance
  - [ ] Trigger re-rating
- [ ] Reference tracking:
  - [ ] Show "Shared with X other lists" indicator
  - [ ] Display criteria provenance (derived from X)

**Deliverables:**
- Rating calculation triggering (individual/bulk)
- Rating display with breakdown
- Property comparison & sorting
- Rating criteria copy-on-write
- Automatic re-rating on data changes

---

## Phase 5: Polish & Optimization

### 5.1 Performance Optimization

#### Tasks
- [ ] Implement lazy loading for all feature modules
- [ ] Virtual scrolling for long property lists
- [ ] Image lazy loading
- [ ] OnPush change detection strategy (automatic with signals)
- [ ] Memoized computed signals
- [ ] Debounce search/filter inputs
- [ ] Optimize bundle size (analyze with webpack-bundle-analyzer)

### 5.2 User Experience Enhancements

#### Tasks
- [ ] Loading skeletons (property cards, reports)
- [ ] Optimistic UI updates
- [ ] Smooth animations (page transitions, expansions)
- [ ] Keyboard shortcuts
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Responsive design (mobile/tablet layouts)
- [ ] Dark mode support
- [ ] Empty states for all views
- [ ] Error boundaries
- [ ] Offline detection & messaging

### 5.3 Additional Features

#### Tasks
- [ ] Saved locations management (user profile)
- [ ] Export property list (CSV, PDF)
- [ ] Print-friendly property details
- [ ] Property image gallery (if available)
- [ ] Map integration (Google Maps property location)
- [ ] Search & filter (properties, lists)
- [ ] Bulk operations (bulk delete, bulk rate)
- [ ] User preferences (theme, notification settings)

**Deliverables:**
- Performant, accessible Angular app
- Mobile-responsive design
- Enhanced UX features

---

## Phase 6: Testing & Deployment

### 6.1 Testing

#### Tasks
- [ ] Unit tests:
  - [ ] Services (auth, API, WebSocket)
  - [ ] Components (snapshot, behavior, signal inputs)
  - [ ] Signal stores (state updates, computed signals, methods)
  - [ ] Pipes, directives
- [ ] Integration tests:
  - [ ] Feature workflows (create property → retrieve context → calculate rating)
  - [ ] WebSocket integration
  - [ ] Form submissions
- [ ] E2E tests (Cypress):
  - [ ] Authentication flow
  - [ ] Property creation flow (all 3 methods)
  - [ ] Context retrieval flow
  - [ ] Rating calculation flow
  - [ ] Collaboration features

### 6.2 Deployment

#### Tasks
- [ ] Production build configuration
- [ ] Environment variable management
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Deploy to Render (static site hosting)
- [ ] Configure custom domain
- [ ] Set up error monitoring (Sentry)
- [ ] Set up analytics (Google Analytics/Plausible)

**Deliverables:**
- Comprehensive test coverage
- Production deployment
- Monitoring & analytics

---

## Component Hierarchy

```
AppComponent
├── CoreModule
│   ├── AuthService
│   ├── ApiService
│   ├── WebSocketService
│   └── NotificationService
├── SharedModule
│   ├── HeaderComponent
│   ├── SidebarComponent
│   ├── LoadingSpinnerComponent
│   ├── ConfirmDialogComponent
│   ├── CurrencyPipe
│   └── DateAgoPipe
└── Feature Modules
    ├── PropertyListModule
    │   ├── PropertyListListComponent
    │   ├── PropertyListDetailComponent
    │   ├── PropertyListFormComponent
    │   └── PropertyListCardComponent
    ├── PropertyModule
    │   ├── PropertyListComponent
    │   ├── PropertyDetailComponent
    │   ├── PropertyFormComponent
    │   ├── PropertyCardComponent
    │   └── DeduplicationWarningComponent
    ├── ContextModule
    │   ├── ContextReportsComponent
    │   ├── CrimeReportComponent
    │   ├── SchoolsReportComponent
    │   ├── BroadbandReportComponent
    │   ├── MobileCoverageComponent
    │   └── PoiReportComponent
    └── RatingModule
        ├── RatingOverviewComponent
        ├── RatingBreakdownComponent
        ├── PropertyComparisonComponent
        └── RatingCriteriaFormComponent
```

---

## State Shape (Signal Stores)

```typescript
// AuthStore (global)
type AuthStore = {
  user: Signal<User | null>;
  token: Signal<string | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  isAuthenticated: Signal<boolean>; // computed
};

// PropertyListStore (feature)
type PropertyListStore = {
  entities: Signal<Record<string, PropertyList>>;
  ids: Signal<string[]>;
  selectedId: Signal<string | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  // Computed signals
  all: Signal<PropertyList[]>;
  selected: Signal<PropertyList | null>;
  count: Signal<number>;
  activeLists: Signal<PropertyList[]>;
};

// PropertyStore (feature)
type PropertyStore = {
  entities: Signal<Record<string, Property>>;
  ids: Signal<string[]>;
  selectedId: Signal<string | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  // Computed signals
  all: Signal<Property[]>;
  selected: Signal<Property | null>;
  byList: Signal<(listId: string) => Property[]>;
  byState: Signal<(state: string) => Property[]>;
};

// ContextDataStore (feature)
type ContextDataStore = {
  entities: Signal<Record<string, ContextData>>;
  byProperty: Signal<Record<string, string[]>>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  // Computed signals
  progressByProperty: Signal<(propId: string) => { total: number; complete: number; failed: number }>;
  completedServices: Signal<(propId: string) => ContextData[]>;
  failedServices: Signal<(propId: string) => ContextData[]>;
};

// RatingStore (feature)
type RatingStore = {
  entities: Signal<Record<string, PropertyRating>>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  sortBy: Signal<string>;
  sortOrder: Signal<'asc' | 'desc'>;
  // Computed signals
  sorted: Signal<PropertyRating[]>;
  disqualified: Signal<PropertyRating[]>;
  topRated: Signal<PropertyRating[]>;
};

// UiStore (global)
type UiStore = {
  sidebarOpen: Signal<boolean>;
  theme: Signal<'light' | 'dark'>;
  viewMode: Signal<'grid' | 'list'>;
  activeFilters: Signal<FilterState>;
};

// WebSocketStore (global)
type WebSocketStore = {
  connected: Signal<boolean>;
  subscribedChannels: Signal<string[]>;
  reconnecting: Signal<boolean>;
};
```

---

## Routing Structure

```
/ (redirect to /lists)
/login
/register
/lists
  /new
  /:listId
    /properties
      /new
      /:propertyId
    /context-options
    /rating-criteria
    /comparison
/properties/:id
/rating-criteria
/profile
  /saved-locations
/settings
```

---

## Key Decisions

### Decision #1: Angular Signals for State Management
**Rationale:** Native Angular reactive primitives, simpler than NgRx, better DX, automatic change detection, smaller bundle size

### Decision #2: Signal Stores Pattern
**Rationale:** Encapsulate state logic in feature-based stores using `@ngrx/signals` or custom implementation

### Decision #3: WebSocket Auto-Reconnection
**Rationale:** Critical for progressive loading; implement exponential backoff + event replay

### Decision #4: Lazy Loading for Feature Modules
**Rationale:** Large app; improve initial load time

### Decision #5: OnPush Change Detection with Signals
**Rationale:** Signals provide automatic performance optimization; OnPush + signals = optimal change detection

### Decision #6: Reactive Forms with Signal Integration
**Rationale:** Complex validation, dynamic forms; integrate with signals via `toSignal()` for form value changes

---

## Development Guidelines

- **Code Style:** Follow Angular style guide, ESLint + Prettier
- **Naming:** PascalCase for components, camelCase for services/variables
- **Testing:** Minimum 70% coverage for services, 50% for components
- **Commits:** Conventional commits (feat, fix, refactor, docs)
- **PR Reviews:** Required before merge to main
- **Documentation:** JSDoc for complex methods, README for each module

---

## Dependencies

### Core
- @angular/core: ^19.x
- @angular/common: ^19.x
- @angular/router: ^19.x
- @angular/forms: ^19.x

### State Management
- @ngrx/signals: ^19.x (optional, for signal store utilities)
- rxjs: ^7.x

### UI
- tailwindcss: ^3.x
- @tailwindcss/forms: ^0.5.x
- lucide-angular: ^0.x (icons)

### Utilities
- date-fns: ^4.x
- lodash-es: ^4.x

### Development
- typescript: ~5.7.x
- @angular-eslint/*: ^19.x
- prettier: ^3.x
- jest: ^29.x (or Jasmine/Karma)
- cypress: ^13.x

---

## Next Steps

1. Resolve `.gitignore` merge conflict
2. Complete Angular project initialization
3. Install dependencies (@ngrx/signals, Tailwind CSS utilities)
4. Begin Phase 1: Foundation & Setup

---

## Signal Store Example Pattern

```typescript
// property-list.store.ts
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { PropertyListService } from './property-list.service';

type PropertyListState = {
  entities: Record<string, PropertyList>;
  ids: string[];
  selectedId: string | null;
  loading: boolean;
  error: string | null;
};

const initialState: PropertyListState = {
  entities: {},
  ids: [],
  selectedId: null,
  loading: false,
  error: null,
};

export const PropertyListStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, ids, selectedId }) => ({
    all: computed(() => ids().map(id => entities()[id])),
    selected: computed(() => {
      const id = selectedId();
      return id ? entities()[id] : null;
    }),
    count: computed(() => ids().length),
  })),
  withMethods((store, service = inject(PropertyListService)) => ({
    load: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(() => service.getAll()),
        tap({
          next: (lists) => {
            const entities = lists.reduce((acc, list) => ({ ...acc, [list.id]: list }), {});
            const ids = lists.map(list => list.id);
            patchState(store, { entities, ids, loading: false });
          },
          error: (error) => patchState(store, { error: error.message, loading: false }),
        })
      )
    ),
    select: (id: string) => patchState(store, { selectedId: id }),
  }))
);
```
