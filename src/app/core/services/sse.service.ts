import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth-service/auth.service';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SseService {
  private authService = inject(AuthService);

  connect(apiPath: string): Observable<any> {
    return new Observable((observer) => {
      const token = this.authService.getAccessToken();
      const url = `${environment.apiUrl}/${apiPath}?token=${token}`;
      const eventSource = new EventSource(url);

      eventSource.onmessage = (event) => {
        try {
          observer.next(JSON.parse(event.data));
        } catch {
          // skip malformed frames
        }
      };

      eventSource.onerror = () => {
        // EventSource auto-reconnects on transient errors.
        // Only error the observable if permanently closed.
        if (eventSource.readyState === EventSource.CLOSED) {
          observer.error(new Error('SSE connection permanently closed'));
        }
      };

      return () => {
        eventSource.close();
      };
    });
  }
}
