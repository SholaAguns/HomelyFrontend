export type ServiceName = 'crime' | 'schools' | 'broadband' | 'mobile' | 'poi';
export type ServiceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETE' | 'FAILED';

export interface ContextData {
  id: string;
  property_id: string;
  service_name: ServiceName;
  status: ServiceStatus;
  data: unknown;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  cached: boolean;
}

export interface ServiceProgress {
  total: number;
  complete: number;
  in_progress: number;
  failed: number;
  pending: number;
}

export interface WebSocketServiceUpdate {
  type: 'service_update' | 'stage2_complete';
  service?: string;
  status?: string;
  property_id: string;
  data?: unknown;
  progress?: ServiceProgress;
}
