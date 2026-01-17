import { Routes } from '@angular/router';

export const PROPERTY_LIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import(
        './components/property-list-list/property-list-list.component'
      ).then((m) => m.PropertyListListComponent),
  },
  {
    path: 'new',
    loadComponent: () =>
      import(
        './components/property-list-create/property-list-create.component'
      ).then((m) => m.PropertyListCreateComponent),
  },
  {
    path: ':uuid',
    loadComponent: () =>
      import(
        './components/property-list-detail/property-list-detail.component'
      ).then((m) => m.PropertyListDetailComponent),
  },
];
