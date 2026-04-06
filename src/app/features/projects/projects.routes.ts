import { Routes } from '@angular/router';

export const PROJECT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/project-list/project-list.component').then(
        (m) => m.ProjectListComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./components/project-create/project-create.component').then(
        (m) => m.ProjectCreateComponent
      ),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import('./components/project-detail/project-detail.component').then(
        (m) => m.ProjectDetailComponent
      ),
  },
  {
    path: ':uuid/settings',
    loadComponent: () =>
      import('./components/project-settings/project-settings.component').then(
        (m) => m.ProjectSettingsComponent
      ),
  },
  {
    path: 'rating-criteria/new',
    loadComponent: () =>
      import('./components/rating-criteria-form/rating-criteria-form.component').then(
        (m) => m.RatingCriteriaFormComponent
      ),
  },
  {
    path: 'rating-criteria/:uuid/edit',
    loadComponent: () =>
      import('./components/rating-criteria-form/rating-criteria-form.component').then(
        (m) => m.RatingCriteriaFormComponent
      ),
  },
];
