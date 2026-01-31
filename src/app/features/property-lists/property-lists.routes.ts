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
  {
    path: ':uuid/properties/new',
    loadComponent: () =>
      import(
        '../property/components/property-creation/property-creation.component'
      ).then((m) => m.PropertyCreationComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../property/components/property-creation/creation-options/creation-options.component'
          ).then((m) => m.CreationOptionsComponent),
      },
      {
        path: 'manual',
        loadComponent: () =>
          import(
            '../property/components/property-creation/manual-creation/manual-creation.component'
          ).then((m) => m.ManualCreationComponent),
      },
      {
        path: 'url-text',
        loadComponent: () =>
          import(
            '../property/components/property-creation/url-text-creation/url-text-creation.component'
          ).then((m) => m.UrlTextCreationComponent),
      },
      {
        path: 'search',
        loadComponent: () =>
          import(
            '../property/components/property-creation/search-creation/search-creation.component'
          ).then((m) => m.SearchCreationComponent),
      },
    ],
  },
];
