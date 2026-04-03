import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'projects',
    canActivate: [authGuard],
    loadChildren: () => import('./features/projects/projects.routes').then((m) => m.PROJECT_ROUTES),
  },
  {
    path: 'projects/:projectUuid/lists',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/property-lists/property-lists.routes').then((m) => m.PROPERTY_LIST_ROUTES),
  },
  {
    path: 'lists',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/property-lists/property-lists.routes').then((m) => m.PROPERTY_LIST_ROUTES),
  },
  {
    path: 'properties/:uuid',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/property/components/property-detail/property-detail.component').then(
        (m) => m.PropertyDetailComponent
      ),
  },
  {
    path: 'saved-locations',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/saved-locations/saved-locations.routes').then(
        (m) => m.SAVED_LOCATION_ROUTES
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
