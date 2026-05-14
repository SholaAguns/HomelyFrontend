declare const window: Window & { __env?: { apiUrl?: string; wsUrl?: string } };

export const environment = {
  production: true,
  apiUrl: window.__env?.apiUrl || 'https://api.homely.app/api',
  wsUrl: window.__env?.wsUrl || 'wss://api.homely.app/ws',
};
