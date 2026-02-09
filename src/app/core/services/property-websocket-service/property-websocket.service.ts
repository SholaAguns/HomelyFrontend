import { Injectable, inject } from '@angular/core';
import { Observable, retry, timer, map, catchError, EMPTY } from 'rxjs';
import { WebSocketService } from '../websocket.service';
import { ScrapeProgressEvent } from '../../../shared/models/property-models';

@Injectable({
  providedIn: 'root',
})
export class PropertyWebSocketService {
  private webSocketService = inject(WebSocketService);

  connectToPropertyList(propertyListUuid: string): Observable<ScrapeProgressEvent> {
    const channel = `property-list/${propertyListUuid}/`;

    return this.webSocketService.connect(channel).pipe(
      map((message: any) => {
        if (
          message.type === 'scrape_progress' ||
          message.type === 'scrape_complete' ||
          message.type === 'scrape_failed'
        ) {
          return message.data as ScrapeProgressEvent;
        }
        throw new Error('Unknown message type');
      }),
      catchError((error) => {
        console.error('PropertyWebSocket error:', error);
        return EMPTY;
      })
    );
  }

  disconnect(): void {
    this.webSocketService.disconnect();
  }
}
