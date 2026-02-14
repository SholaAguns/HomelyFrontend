import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'lists',
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
    path: '**',
    redirectTo: '',
  },
];
