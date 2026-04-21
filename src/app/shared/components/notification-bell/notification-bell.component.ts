import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotificationStore } from '../../../core/stores/notification-store/notification.store';
import { SharingService } from '../../../core/services/sharing-service/sharing.service';
import { AppNotification } from '../../models/project-models';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.component.html',
})
export class NotificationBellComponent {
  protected readonly notificationStore = inject(NotificationStore);
  private router = inject(Router);
  private sharingService = inject(SharingService);

  panelOpen = signal(false);

  togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }

  onNotificationClick(notification: AppNotification): void {
    this.notificationStore.markRead(notification.uuid);
    this.panelOpen.set(false);

    if (notification.notification_type === 'invite_received' && notification.related_object_uuid) {
      this.sharingService.getMyInviteToken(notification.related_object_uuid).subscribe({
        next: (res) =>
          this.router.navigate(['/accept-invite'], { queryParams: { token: res.token } }),
        error: () => this.router.navigate(['/projects']),
      });
    } else if (notification.related_object_uuid && notification.related_object_type === 'project') {
      this.router.navigate(['/projects', notification.related_object_uuid]);
    }
  }

  markAllRead(): void {
    this.notificationStore.markAllRead();
  }

  formatTime(isoString: string): string {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  }
}
