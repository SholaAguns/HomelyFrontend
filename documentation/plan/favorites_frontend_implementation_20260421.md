# Favorites Frontend Implementation Plan

Date: 2026-04-21

## Backend Status
✅ Endpoints implemented:
- `POST /api/property/favorites/` - Add favorite
- `DELETE /api/property/favorites/{property_uuid}/` - Remove favorite  
- `GET /api/property/favorites/` - Get all user favorites
- `GET /api/property/projects/{uuid}/favorites/` - Get project favorites
- Property serializer includes `is_favorited` boolean field

## Implementation Tasks

### 1. Update Models
**File:** `src/app/shared/models/property-models.ts`
- Add `is_favorited: boolean;` to `Property` interface

### 2. Create Favorites Service
**File:** `src/app/core/services/favorites-service/favorites.service.ts`

Pattern: Follow `saved-location.service.ts`
```typescript
@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private api = inject(ApiService);
  private endpoint = 'property/favorites/';
  
  getAllFavorites(): Observable<Property[]>
  getProjectFavorites(projectUuid: string): Observable<Property[]>
  addFavorite(propertyUuid: string): Observable<void>
  removeFavorite(propertyUuid: string): Observable<void>
}
```

Methods map to:
- `getAllFavorites()` → GET /api/property/favorites/
- `getProjectFavorites(uuid)` → GET /api/property/projects/{uuid}/favorites/
- `addFavorite(uuid)` → POST /api/property/favorites/ body: {property_uuid}
- `removeFavorite(uuid)` → DELETE /api/property/favorites/{uuid}/

### 3. Create Favorites Feature Module

**Directory:** `src/app/features/favorites/`

**Components:**

#### 3.1 Favorites Page Component
**File:** `favorites-page.component.ts`
- Standalone component
- Route: `/favorites`
- Loads all favorites via `favoritesService.getAllFavorites()`
- Displays property grid/list
- Shows project badges on each card
- Empty state when no favorites
- Click property → navigate to detail
- Click project badge → navigate to project

#### 3.2 Favorites Routes
**File:** `favorites.routes.ts`
```typescript
export const FAVORITES_ROUTES: Routes = [
  { path: '', component: FavoritesPageComponent }
];
```

### 4. Update App Routing
**File:** `src/app/app.routes.ts`
- Add favorites route: `{ path: 'favorites', loadChildren: () => import('./features/favorites/favorites.routes') }`

### 5. Create Property Card Component (if not exists)
Check for existing property card component in:
- `src/app/features/property/components/`
- `src/app/shared/components/`

**If none exists, create:** `property-card.component.ts`
- Input: `@Input() property: Property`
- Output: `@Output() favoriteToggle = new EventEmitter<string>()`
- Display: property details, images, state badge
- Favorite icon toggle button
- Click card → navigate to property detail

### 6. Add Favorite Toggle UI

#### 6.1 Property Card Favorite Icon
**Location:** Property card component template
- Add star icon (Material Icons or SVG)
- Filled star if `property.is_favorited === true`
- Outlined star if `property.is_favorited === false`
- Click handler calls `favoriteToggle.emit(property.uuid)`
- Parent component handles actual API call via service

#### 6.2 Property Detail Favorite Icon
**File:** `src/app/features/property/components/property-detail/property-detail.component.ts`
- Add favorite toggle button to header
- Call `favoritesService.addFavorite()` or `removeFavorite()`
- Update local `property.is_favorited` optimistically
- Handle errors via NotificationService

### 7. Update Project Detail Component

**File:** `src/app/features/projects/components/project-detail/project-detail.component.ts`

**Add:**
- `projectFavorites` signal for favorites array
- Load via `favoritesService.getProjectFavorites(projectUuid)`
- Collapsible "Favorites" section in template
- Default state: `isExpanded = projectFavorites().length < 6`
- Show property cards for favorited properties
- Unfavorite button on each card
- Empty state: "No properties favorited in this project"

### 8. Navigation Updates
**File:** `src/app/shared/components/header` or sidebar
- Add "Favorites" nav link
- Route to `/favorites`
- Icon: star

## File Structure
```
src/app/
├── core/services/
│   └── favorites-service/
│       ├── favorites.service.ts
│       └── favorites.service.spec.ts
├── features/
│   ├── favorites/
│   │   ├── components/
│   │   │   └── favorites-page/
│   │   │       ├── favorites-page.component.ts
│   │   │       └── favorites-page.component.html
│   │   └── favorites.routes.ts
│   ├── property/components/
│   │   └── property-card/ (create if missing)
│   │       ├── property-card.component.ts
│   │       └── property-card.component.html
│   └── projects/components/
│       └── project-detail/ (update existing)
└── shared/models/
    └── property-models.ts (update)
```

## Implementation Order

1. - done Update Property interface (add is_favorited field)
2. - done Create FavoritesService
3. - done Create PropertyCardComponent with favorite icon
4. - done Create FavoritesPageComponent
5. - done Create favorites.routes.ts
6. - done Update app.routes.ts
7. - done Update PropertyDetailComponent with favorite toggle
8. - done Update ProjectDetailComponent with favorites section
9. - done Add Favorites nav link to sidebar
10. - [ ] Test all flows

## Optimistic Updates Pattern

When toggling favorites:
```typescript
toggleFavorite(property: Property) {
  const wasFavorited = property.is_favorited;
  property.is_favorited = !wasFavorited; // Optimistic update
  
  const action = wasFavorited 
    ? this.favoritesService.removeFavorite(property.uuid)
    : this.favoritesService.addFavorite(property.uuid);
  
  action.subscribe({
    error: () => {
      property.is_favorited = wasFavorited; // Rollback on error
      this.notificationService.error('Failed to update favorite');
    }
  });
}
```

## UI Patterns

**Star Icon States:**
- Favorited: Filled yellow/gold star ⭐
- Not favorited: Outlined gray star ☆

**Favorite Button:**
- Position: Top-right corner of property card
- Size: 24px icon
- Hover: Scale slightly, show tooltip "Add to favorites" / "Remove from favorites"
- Click: Immediate visual feedback (optimistic)

## Testing Notes

After implementation:
- Test add/remove favorite from property card
- Test add/remove from property detail
- Test favorites page displays all favorites
- Test project favorites section shows only project properties
- Test favorites persist across page refreshes
- Test unfavorite removes from favorites page
- Test empty states
- Unit test FavoritesService methods
- Component tests for toggle handlers
