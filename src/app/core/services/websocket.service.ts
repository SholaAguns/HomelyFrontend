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
      console.log('🔌 WEBSOCKET SERVICE: Creating connection to', url);

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        console.log('✅ WEBSOCKET SERVICE: Connected successfully to', url);
        this.reconnectAttempts = 0;
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('📨 WEBSOCKET SERVICE: Message received', data);
        observer.next(data);
      };

      this.socket.onerror = (error) => {
        console.error('❌ WEBSOCKET SERVICE: Error', error);
        observer.error(error);
      };

      this.socket.onclose = (event) => {
        console.log('🔌 WEBSOCKET SERVICE: Connection closed', {
          code: event.code,
          reason: event.reason,
          wasClean: event.wasClean,
        });
        observer.error(new Error('WebSocket closed'));
      };

      return () => {
        console.log('🔌 WEBSOCKET SERVICE: Cleaning up connection');
        if (this.socket) {
          this.socket.close();
        }
      };
    }).pipe(
      retry({
        count: this.maxReconnectAttempts,
        delay: (error, retryCount) => {
          this.reconnectAttempts = retryCount;
          console.log(`🔄 WebSocket reconnect attempt ${retryCount}`);
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
