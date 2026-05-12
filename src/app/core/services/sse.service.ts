import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SseService {
  connect(apiPath: string): Observable<any> {
    return new Observable((observer) => {
      const url = `${environment.apiUrl}/${apiPath}`;
      const eventSource = new EventSource(url, { withCredentials: true });

      eventSource.onmessage = (event) => {
        try {
          observer.next(JSON.parse(event.data));
        } catch {
          // skip malformed frames
        }
      };

      eventSource.onerror = () => {
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
