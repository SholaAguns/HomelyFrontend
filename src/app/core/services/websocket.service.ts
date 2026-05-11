import { Injectable } from '@angular/core';
import { Observable, retry, Subject, timer, Observer } from 'rxjs';
import { retryWhen, tap, delayWhen } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(channel: string): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      const url = `${environment.wsUrl}/${channel}`;

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        observer.next(data);
      };

      this.socket.onerror = (error) => {
        observer.error(error);
      };

      this.socket.onclose = () => {
        observer.error(new Error('WebSocket closed'));
      };

      return () => {
        if (this.socket) {
          this.socket.close();
        }
      };
    }).pipe(
      retry({
        count: this.maxReconnectAttempts,
        delay: (error, retryCount) => {
          this.reconnectAttempts = retryCount;
          const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
          return timer(delay);
        },
      })
    );
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
