import { Injectable, inject } from '@angular/core';
import { Observable, map, catchError, EMPTY, filter } from 'rxjs';
import { WebSocketService } from '../websocket.service';
import { ScrapeProgressEvent } from '../../../shared/models/property-models';
import { WebSocketServiceUpdate } from '../../../shared/models/context-data.models';

type ScrapeMessage = {
  type: 'scrape_progress' | 'scrape_complete' | 'scrape_failed';
  data: ScrapeProgressEvent;
};

@Injectable({
  providedIn: 'root',
})
export class PropertyWebSocketService {
  private webSocketService = inject(WebSocketService);

  connectToPropertyList(propertyListUuid: string): Observable<ScrapeProgressEvent> {
    const channel = `property-list/${propertyListUuid}/`;

    return this.webSocketService.connect(channel).pipe(
      map((message: ScrapeMessage) => {
        if (
          message.type === 'scrape_progress' ||
          message.type === 'scrape_complete' ||
          message.type === 'scrape_failed'
        ) {
          return message.data;
        }
        throw new Error('Unknown message type');
      }),
      catchError((error) => {
        console.error('PropertyWebSocket error:', error);
        return EMPTY;
      })
    );
  }

  connectToProperty(propertyUuid: string): Observable<WebSocketServiceUpdate> {
    const channel = `property/${propertyUuid}/`;

    return this.webSocketService.connect(channel).pipe(
      filter(
        (message: WebSocketServiceUpdate) =>
          message.type === 'service_update' || message.type === 'stage2_complete'
      ),
      map((message: WebSocketServiceUpdate) => message),
      catchError((error) => {
        console.error('PropertyWebSocket error:', error);
        return EMPTY;
      })
    );
  }

  subscribeToPropertyList(propertyListUuid: string): Observable<WebSocketServiceUpdate> {
    const channel = `property-list/${propertyListUuid}/`;

    return this.webSocketService.connect(channel).pipe(
      filter(
        (message: WebSocketServiceUpdate) =>
          message.type === 'service_update' || message.type === 'stage2_complete'
      ),
      map((message: WebSocketServiceUpdate) => message),
      catchError((error) => {
        console.error('PropertyWebSocket context service error:', error);
        return EMPTY;
      })
    );
  }

  disconnect(): void {
    this.webSocketService.disconnect();
  }
}
