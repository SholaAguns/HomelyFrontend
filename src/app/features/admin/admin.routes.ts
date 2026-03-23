import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./components/admin-layout/admin-layout.component').then(
        (m) => m.AdminLayoutComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/admin-dashboard.component').then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'properties',
        loadComponent: () =>
          import('./components/properties-list/properties-list.component').then(
            (m) => m.PropertiesListComponent
          ),
      },
      {
        path: 'lists',
        loadComponent: () =>
          import('./components/lists-list/lists-list.component').then((m) => m.ListsListComponent),
      },
    ],
  },
];
