export interface AdminStatistics {
  properties: {
    total: number;
    by_state: { [key: string]: number };
    avg_price: number;
    recent_count: number;
  };
  lists: {
    total: number;
    active: number;
  };
  context_services: {
    pending: number;
    in_progress: number;
    complete: number;
    failed: number;
  };
  tasks: {
    queued: number;
    in_progress: number;
    completed: number;
    failed: number;
  };
  last_updated: string;
}

export interface FailedService {
  id: number;
  service_name: string;
  property_uuid: string;
  property_title: string;
  error_message: string;
  retry_count: number;
  last_attempt: string | null;
}

export interface ActiveTask {
  id: number;
  uuid: string;
  task_type: string;
  list_uuid: string;
  list_title: string;
  progress: number;
  total_items: number;
  completed_items: number;
  failed_items: number;
}

export interface ActivityLog {
  id: number;
  from_state: string;
  to_state: string;
  transition: string;
  user: string;
  timestamp: string;
}

export interface SystemStatus {
  failed_services: FailedService[];
  active_tasks: ActiveTask[];
  recent_activity: ActivityLog[];
}
