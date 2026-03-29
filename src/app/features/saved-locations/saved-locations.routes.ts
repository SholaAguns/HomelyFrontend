import { Routes } from '@angular/router';

export const SAVED_LOCATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/saved-location-list/saved-location-list.component').then(
        (m) => m.SavedLocationListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/saved-location-create/saved-location-create.component').then(
        (m) => m.SavedLocationCreateComponent
      ),
  },
  {
    path: ':uuid/edit',
    loadComponent: () =>
      import('./pages/saved-location-edit/saved-location-edit.component').then(
        (m) => m.SavedLocationEditComponent
      ),
  },
];
