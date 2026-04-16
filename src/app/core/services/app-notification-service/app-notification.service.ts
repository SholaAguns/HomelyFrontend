import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../api-service/api.service';
import { AppNotification } from '../../../shared/models/project-models';

@Injectable({ providedIn: 'root' })
export class AppNotificationService {
  private api = inject(ApiService);
  private socket: WebSocket | null = null;
  private notificationSubject = new Subject<AppNotification>();

  readonly incoming$: Observable<AppNotification> = this.notificationSubject.asObservable();

  connect(token: string): void {
    if (this.socket) return;
    this.socket = new WebSocket(`${environment.wsUrl}/notifications/?token=${token}`);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'notification' && data.payload) {
          this.notificationSubject.next(data.payload as AppNotification);
        }
      } catch {
        // ignore malformed messages
      }
    };

    this.socket.onclose = () => {
      this.socket = null;
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  getAll(): Observable<AppNotification[]> {
    return this.api.get<AppNotification[]>('property/notifications/');
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.api.get<{ count: number }>('property/notifications/unread-count/');
  }

  markRead(uuid: string): Observable<AppNotification> {
    return this.api.post<AppNotification>(`property/notifications/${uuid}/read/`, {});
  }

  markAllRead(): Observable<void> {
    return this.api.post<void>('property/notifications/read-all/', {});
  }
}
