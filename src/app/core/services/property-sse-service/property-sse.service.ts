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

const COMMENT_EVENTS = new Set(['connected', 'comment_created', 'comment_deleted']);

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

  connectToProjectComments(projectUuid: string): Observable<SseEvent> {
    return this.sseService
      .connect(`property/projects/${projectUuid}/comments/stream/`)
      .pipe(filter((e: SseEvent) => COMMENT_EVENTS.has(e.type)));
  }
}
