# Property Components Implementation Roadmap

## Context
Backend property creation supports 3 methods:
1. Manual entry via `create_property_endpoint`
2. Single property from URL/text via `create_from_input_endpoint`
3. Bulk search (Rightmove) via `create_from_search_endpoint` with async task tracking

All backend endpoints are complete. Frontend components needed.

---

## Architecture

### Components Hierarchy
```
PropertyCreationComponent (Route: /lists/:listId/properties/new)
├── CreationOptionsComponent (selection page)
├── ManualCreationComponent
│   └── PropertyFormComponent
├── UrlTextCreationComponent
│   ├── InputFieldComponent
│   └── PropertyFormComponent (review/edit)
└── SearchCreationComponent
    ├── SearchCriteriaFormComponent
    ├── SearchProgressComponent (websocket)
    └── SearchResultsListComponent
```

### Services
- `PropertyService` - CRUD + `createFromInput()`
- `PropertyCreationService` - `createFromSearch()`, `getSearchStatus()`
- `PropertyWebSocketService` - Progress updates for bulk search

### Signal Stores
- `PropertyStore` - entities, selected, loading, error
- `SearchTaskStore` - taskStatus, progress, errors

---

## Implementation Phases

### Phase 1: Core Property Components (2-3 days) - DONE
**Goal:** Manual creation + shared form component

#### Tasks
- [X] Create PropertyCreationComponent (router outlet + option selection)
- [X] Create CreationOptionsComponent
  - [X] 3 option cards: Manual | From URL/Text | Search Rightmove
  - [X] Route to respective creation components
- [X] Create PropertyFormComponent (reusable)
  - [X] Reactive form with all Property model fields
  - [ ] Address autocomplete (Ideal Postcodes API) - deferred to Phase 5
  - [X] Validation (required, formats, enums)
  - [X] Signal inputs: `initialData`, `readOnly`, `mode` ('create'|'edit'|'review')
  - [X] Output: `formSubmit`, `formCancel`
- [X] Create ManualCreationComponent
  - [X] Embeds PropertyFormComponent
  - [X] Calls `PropertyService.create()`
  - [X] Handles success/error
  - [X] Redirects to property list
- [X] Update PropertyStore
  - [X] Methods: `create()`, `update()`, `delete()`, `createFromInput()`, `runStage2()`, `runStage3()`
  - [X] RxMethod for API calls
  - [ ] `checkDuplicate()` - deferred to Phase 2

**Files:** ✓ COMPLETE
- `src/app/features/property/components/property-creation/`
  - `property-creation.component.ts` ✓
  - `creation-options/creation-options.component.ts` ✓
  - `manual-creation/manual-creation.component.ts` ✓
- `src/app/features/property/components/property-form/property-form.component.ts` ✓
- `src/app/features/property/store/property.store.ts` ✓

**Deliverables:** ✓ COMPLETE
- Property creation route `/lists/:listId/properties/new` ✓
- Manual creation working end-to-end ✓
- Reusable PropertyFormComponent ✓

---

### Phase 2: URL/Text Extraction (1-2 days)
**Goal:** Create from URL or text input with extraction

#### Tasks
- [ ] Create UrlTextCreationComponent
  - [ ] Toggle: URL | Text
  - [ ] Input field (URL or textarea)
  - [ ] "Extract" button → calls `createFromInput()`
  - [ ] Loading spinner during extraction
  - [ ] Error handling (invalid URL, scraping failed)
- [ ] Extraction flow:
  - [ ] Step 1: Input URL/text
  - [ ] Step 2: Backend extracts data → returns PropertyCreationRequest
  - [ ] Step 3: Display PropertyFormComponent in 'review' mode
  - [ ] Step 4: User edits/confirms → submit to `create_property_endpoint`
- [ ] Update PropertyService
  - [ ] Add `createFromInput(inputData, inputType, propertyListUuid?)` method
  - [ ] Maps to `POST /api/properties/create-from-input/`
  - [ ] Returns extracted property data
- [ ] Duplicate detection
  - [ ] Backend returns `external_id`
  - [ ] Frontend checks if exists in PropertyStore
  - [ ] Show DeduplicationWarningComponent modal
  - [ ] Options: View existing | Force create | Cancel

**Files:**
- `src/app/features/property/components/property-creation/url-text-creation/url-text-creation.component.ts`
- `src/app/features/property/components/deduplication-warning/deduplication-warning.component.ts`
- Update `src/app/features/property/services/property.service.ts`

**Deliverables:**
- URL/text extraction working
- Review/edit extracted data before submission
- Duplicate detection modal

---

### Phase 3: Bulk Search Infrastructure (2 days)
**Goal:** Async task management + WebSocket progress updates

#### Tasks
- [ ] Create PropertyCreationService (new service for bulk operations)
  - [ ] `createFromSearch(propertyListUuid, searchCriteria)` → returns task uuid
  - [ ] `getSearchStatus(propertyListUuid, taskUuid)` → polling fallback
  - [ ] Maps to `POST /api/property-lists/{uuid}/create-from-search/`
  - [ ] Maps to `GET /api/property-lists/{uuid}/scrape-status/{taskUuid}/`
- [ ] Create SearchTaskStore (signal store)
  - [ ] State: `currentTask`, `status`, `completedItems`, `totalItems`, `failedItems`, `errors`, `loading`
  - [ ] Methods: `startSearch()`, `updateProgress()`, `reset()`
  - [ ] RxMethod for WebSocket subscription
- [ ] Create PropertyWebSocketService (or extend existing WebSocketService)
  - [ ] Connect to property list channel: `property_list.{uuid}`
  - [ ] Handle `scrape_progress` events
  - [ ] Observable stream for progress updates
  - [ ] Auto-reconnect with exponential backoff
  - [ ] Update SearchTaskStore on events
- [ ] Polling fallback
  - [ ] If WebSocket fails, poll `getSearchStatus()` every 2 seconds
  - [ ] Stop polling when status = 'completed' | 'failed'

**Files:**
- `src/app/features/property/services/property-creation.service.ts` (new)
- `src/app/features/property/services/search-task.store.ts` (new)
- `src/app/core/services/property-websocket.service.ts` (new or extend existing)

**Deliverables:**
- Async task submission
- WebSocket progress tracking
- Polling fallback

---

### Phase 4: Search Creation UI (2 days)
**Goal:** Rightmove search with real-time progress

#### Tasks
- [ ] Create SearchCreationComponent
  - [ ] Embeds SearchCriteriaFormComponent
  - [ ] Shows SearchProgressComponent when task running
  - [ ] Shows SearchResultsListComponent when complete
- [ ] Create SearchCriteriaFormComponent
  - [ ] Fields: area (text), bedrooms_min/max, price_min/max, radius, property_types (checkboxes), max_days_since_added
  - [ ] Validation (at least area required)
  - [ ] "Start Search" button
  - [ ] Submits to `PropertyCreationService.createFromSearch()`
- [ ] Create SearchProgressComponent
  - [ ] Progress bar: `completedItems / totalItems`
  - [ ] Percentage display
  - [ ] Live updates via SearchTaskStore signals
  - [ ] Status badges: QUEUED | IN_PROGRESS | COMPLETED | FAILED
  - [ ] Error list (expandable)
  - [ ] "Cancel" button (future: calls cancel endpoint)
  - [ ] Reconnecting indicator if WebSocket drops
- [ ] Create SearchResultsListComponent
  - [ ] Summary: "Created X properties, Y duplicates skipped, Z failed"
  - [ ] Link to property list
  - [ ] Option to start new search
- [ ] Error handling
  - [ ] Display errors from SearchTaskStore
  - [ ] Retry button (restarts search with same criteria)
  - [ ] Graceful WebSocket failure → show "Using polling fallback" message

**Files:**
- `src/app/features/property/components/property-creation/search-creation/search-creation.component.ts`
- `src/app/features/property/components/property-creation/search-creation/search-criteria-form/search-criteria-form.component.ts`
- `src/app/features/property/components/property-creation/search-creation/search-progress/search-progress.component.ts`
- `src/app/features/property/components/property-creation/search-creation/search-results-list/search-results-list.component.ts`

**Deliverables:**
- Rightmove search form
- Real-time progress tracking
- Error handling + retry
- Summary screen

---

### Phase 5: Integration & Polish (1 day)

#### Tasks
- [ ] Update PropertyListDetailComponent
  - [ ] "Add Properties" button → routes to `/lists/:listId/properties/new`
- [ ] Update routing
  - [ ] `/lists/:listId/properties/new` → PropertyCreationComponent
  - [ ] Child routes:
    - `/lists/:listId/properties/new/manual` → ManualCreationComponent
    - `/lists/:listId/properties/new/url-text` → UrlTextCreationComponent
    - `/lists/:listId/properties/new/search` → SearchCreationComponent
- [ ] Breadcrumbs
  - [ ] Lists > List Name > Add Properties > [Creation Method]
- [ ] Navigation guards
  - [ ] Warn if leaving page during active search
  - [ ] Block navigation if form dirty (unsaved changes)
- [ ] Notifications
  - [ ] Success toasts on property created
  - [ ] Error toasts on failures
  - [ ] Progress notification ("Search in progress, X/Y complete")
- [ ] Loading states
  - [ ] Skeleton loaders for forms
  - [ ] Spinners for API calls
- [ ] Empty states
  - [ ] No properties in list → prompt to add
- [ ] Responsive design
  - [ ] Mobile-friendly forms
  - [ ] Stacked layout on small screens

**Deliverables:**
- Seamless integration with existing property list flow
- Polished UX
- Mobile responsive

---

## Technical Decisions

### Decision 1: Three Separate Components vs Single Multi-Step Form
**Choice:** Three separate components (ManualCreationComponent, UrlTextCreationComponent, SearchCreationComponent)

**Rationale:**
- Distinct user flows
- Easier to maintain
- Search component significantly more complex (async, websocket)
- Cleaner routing structure

### Decision 2: PropertyFormComponent as Reusable Component
**Choice:** Single PropertyFormComponent with mode parameter ('create' | 'edit' | 'review')

**Rationale:**
- DRY principle
- Consistent validation across all creation methods
- Easier to maintain field definitions
- Shared address autocomplete logic

### Decision 3: WebSocket + Polling Fallback
**Choice:** Primary WebSocket, fallback to polling

**Rationale:**
- Real-time updates for better UX
- Polling as graceful degradation
- Backend supports both patterns
- Matches backend implementation

### Decision 4: Separate Store for Search Tasks
**Choice:** SearchTaskStore separate from PropertyStore

**Rationale:**
- Search task state is transient (not domain entities)
- Clear separation of concerns
- Easier to reset/clear task state
- Doesn't pollute PropertyStore with task metadata

### Decision 5: Duplicate Detection Modal
**Choice:** Show modal on duplicate, allow force create

**Rationale:**
- User should see existing property first
- Prevents accidental duplicates
- Backend supports both update and skip
- Transparent to user

---

## API Integration Summary

### Endpoints Used
| Method | Endpoint | Component | Purpose |
|--------|----------|-----------|---------|
| POST | `/api/properties/` | ManualCreationComponent | Create property manually |
| POST | `/api/properties/create-from-input/` | UrlTextCreationComponent | Extract from URL/text |
| POST | `/api/property-lists/{uuid}/create-from-search/` | SearchCreationComponent | Start bulk search |
| GET | `/api/property-lists/{uuid}/scrape-status/{taskUuid}/` | SearchCreationComponent | Poll task status |

### WebSocket Channels
| Channel | Component | Event | Payload |
|---------|-----------|-------|---------|
| `property_list.{uuid}` | SearchCreationComponent | `scrape_progress` | `{uuid, status, completed_items, total_items, failed_items, progress_percentage, errors}` |

---

## State Management

### PropertyStore
```typescript
type PropertyStore = {
  entities: Signal<Record<string, Property>>;
  ids: Signal<string[]>;
  selectedId: Signal<string | null>;
  loading: Signal<boolean>;
  error: Signal<string | null>;
  // Methods
  create(data: PropertyCreationRequest): void;
  update(uuid: string, data: Partial<Property>): void;
  delete(uuid: string): void;
  checkDuplicate(externalId: string): Property | null;
};
```

### SearchTaskStore
```typescript
type SearchTaskStore = {
  currentTask: Signal<PropertyListTask | null>;
  status: Signal<'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | null>;
  completedItems: Signal<number>;
  totalItems: Signal<number>;
  failedItems: Signal<number>;
  progressPercentage: Signal<number>; // computed
  errors: Signal<string[]>;
  loading: Signal<boolean>;
  websocketConnected: Signal<boolean>;
  // Methods
  startSearch(listUuid: string, criteria: SearchCriteria): void;
  updateProgress(event: ScrapeProgressEvent): void;
  reset(): void;
};
```

---

## Testing Strategy

### Unit Tests
- [ ] PropertyFormComponent (validation, signals, outputs)
- [ ] PropertyService (API calls, error handling)
- [ ] PropertyCreationService (task submission, status polling)
- [ ] PropertyWebSocketService (connection, reconnection, event handling)
- [ ] PropertyStore (state updates, computed signals)
- [ ] SearchTaskStore (progress updates, status transitions)

### Integration Tests
- [ ] Manual creation flow (form → submit → API → success)
- [ ] URL extraction flow (input → extract → review → create)
- [ ] Search flow (criteria → submit → progress → complete)
- [ ] Duplicate detection (check → modal → navigate)
- [ ] WebSocket progress updates (mock events → UI updates)

### E2E Tests (Cypress)
- [ ] Create property manually
- [ ] Create property from Rightmove URL
- [ ] Create properties from search (mock WebSocket)
- [ ] Handle duplicate property warning
- [ ] Cancel search mid-progress (future)

---

## Effort Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| 1. Core Property Components | 2-3 days | PropertyStore, PropertyService |
| 2. URL/Text Extraction | 1-2 days | Phase 1 complete |
| 3. Bulk Search Infrastructure | 2 days | WebSocketService |
| 4. Search Creation UI | 2 days | Phase 3 complete |
| 5. Integration & Polish | 1 day | All phases complete |
| **Total** | **8-10 days** | |

---

## Next Steps

1. **Immediate:**
   - Create feature branch `feature/property-creation-components`
   - Set up component folder structure
   - Implement Phase 1 (Core Property Components)

2. **Short-term:**
   - Test manual creation flow end-to-end
   - Implement Phase 2 (URL/Text extraction)
   - Validate backend integration

3. **Medium-term:**
   - Build WebSocket infrastructure (Phase 3)
   - Implement search UI (Phase 4)
   - Full E2E testing

---

## Open Questions

1. Should CreationOptionsComponent show statistics (e.g., "15 properties created this way")? - No for now
2. Should duplicate modal show full property details or just summary? - Summary with link
3. Max properties limit for search? (Backend default: 100) - Keep backend default
4. Should search criteria be saved/reusable? - Future enhancement
5. Should users be able to cancel mid-search? - Future enhancement (Phase 6)
