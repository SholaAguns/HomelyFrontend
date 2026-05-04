import { Injectable, inject } from '@angular/core';
import { Observable, filter } from 'rxjs';
import { SseService } from '../sse.service';

export interface SseEvent {
  type: string;
  data?: any;
}

const PROPERTY_EVENTS = new Set([
  'connected',
  'service_update',
  'stage2_complete',
  'rating_complete',
  'rating_failed',
]);

const LIST_EVENTS = new Set([
  'connected',
  'service_update',
  'stage2_complete',
  'rating_complete',
  'scrape_progress',
  'scrape_complete',
  'scrape_failed',
]);

@Injectable({ providedIn: 'root' })
export class PropertySseService {
  private sseService = inject(SseService);

  connectToProperty(propertyUuid: string): Observable<SseEvent> {
    return this.sseService
      .connect(`property/properties/${propertyUuid}/stream/`)
      .pipe(filter((e: SseEvent) => PROPERTY_EVENTS.has(e.type)));
  }

  connectToPropertyList(listUuid: string): Observable<SseEvent> {
    return this.sseService
      .connect(`property/property-lists/${listUuid}/stream/`)
      .pipe(filter((e: SseEvent) => LIST_EVENTS.has(e.type)));
  }
}
