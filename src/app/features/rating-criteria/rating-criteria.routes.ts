import { Routes } from '@angular/router';

export const RATING_CRITERIA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/rating-criteria-list/rating-criteria-list.component').then(
        (m) => m.RatingCriteriaListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/rating-criteria-create/rating-criteria-create.component').then(
        (m) => m.RatingCriteriaCreateComponent
      ),
  },
  {
    path: ':uuid/edit',
    loadComponent: () =>
      import('./pages/rating-criteria-edit/rating-criteria-edit.component').then(
        (m) => m.RatingCriteriaEditComponent
      ),
  },
];
