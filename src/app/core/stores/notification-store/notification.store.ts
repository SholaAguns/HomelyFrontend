import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { AppNotification } from '../../../shared/models/project-models';
import { AppNotificationService } from '../../services/app-notification-service/app-notification.service';

type NotificationState = {
  notifications: AppNotification[];
  unreadCount: number;
  isConnected: boolean;
};

const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isConnected: false,
};

export const NotificationStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ notifications }) => ({
    unreadNotifications: computed(() => notifications().filter((n) => !n.is_read)),
  })),
  withMethods((store, svc = inject(AppNotificationService)) => ({
    connect(token: string): void {
      svc.connect(token);
      patchState(store, { isConnected: true });

      svc.incoming$.subscribe((notification) => {
        patchState(store, {
          notifications: [notification, ...store.notifications()],
          unreadCount: store.unreadCount() + 1,
        });
      });

      svc.getAll().subscribe((notifications) => {
        patchState(store, { notifications });
      });

      svc.getUnreadCount().subscribe(({ count }) => {
        patchState(store, { unreadCount: count });
      });
    },

    disconnect(): void {
      svc.disconnect();
      patchState(store, initialState);
    },

    markRead(uuid: string): void {
      svc.markRead(uuid).subscribe(() => {
        patchState(store, {
          notifications: store
            .notifications()
            .map((n) => (n.uuid === uuid ? { ...n, is_read: true } : n)),
          unreadCount: Math.max(0, store.unreadCount() - 1),
        });
      });
    },

    markAllRead(): void {
      svc.markAllRead().subscribe(() => {
        patchState(store, {
          notifications: store.notifications().map((n) => ({ ...n, is_read: true })),
          unreadCount: 0,
        });
      });
    },
  }))
);
