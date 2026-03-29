import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UiStore } from '../../../core/stores/ui.store';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {
  protected readonly uiStore = inject(UiStore);

  protected readonly navItems = [
    { path: '/lists', icon: 'list', label: 'Property Lists' },
    { path: '/rating-criteria', icon: 'star', label: 'Rating Criteria' },
    { path: '/saved-locations', icon: 'map-pin', label: 'Saved Locations' },
    { path: '/profile', icon: 'user', label: 'Profile' },
    { path: '/settings', icon: 'settings', label: 'Settings' },
  ];
}
