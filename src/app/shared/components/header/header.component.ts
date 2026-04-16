import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { UiStore } from '../../../core/stores/ui.store';
import { AuthStore } from '../../../core/stores/auth-store/auth.store';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink, NotificationBellComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  protected readonly uiStore = inject(UiStore);
  protected readonly authStore = inject(AuthStore);
  private router = inject(Router);

  onToggleSidebar(): void {
    this.uiStore.toggleSidebar();
  }

  onToggleTheme(): void {
    this.uiStore.toggleTheme();
  }

  onLogout(): void {
    this.authStore.logout();
    this.router.navigate(['/']);
  }
}
