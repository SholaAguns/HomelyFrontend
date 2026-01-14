import { Injectable } from '@angular/core';
import {Observable, retry, Subject, timer} from 'rxjs';
import { retryWhen, tap, delayWhen } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private messageSubject = new Subject<any>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(channel: string): Observable<any> {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.createSocket(channel);
    }

    return this.messageSubject.asObservable().pipe(
      retry({
        count: this.maxReconnectAttempts,
        delay: () => {
          this.reconnectAttempts++;
          console.log(`WebSocket reconnect attempt ${this.reconnectAttempts}`);
          const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
          return timer(delay);
        }
      })
    );
  }

  private createSocket(channel: string): void {
    const url = `${environment.wsUrl}/${channel}`;
    this.socket = new WebSocket(url);

    this.socket.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    };

    this.socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.messageSubject.next(data);
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    this.socket.onclose = () => {
      console.log('WebSocket closed');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.messageSubject.error(new Error('WebSocket closed'));
      }
    };
  }

  send(data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}
