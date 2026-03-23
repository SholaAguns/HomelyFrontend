export interface TableColumn<T = any> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  type?: 'text' | 'number' | 'date' | 'badge' | 'currency' | 'custom';
  customRenderer?: (row: T) => string;
  badgeColors?: { [key: string]: string };
}

export interface TableFilter {
  field: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'daterange' | 'text' | 'number';
  options?: { label: string; value: any }[];
}

export interface TableAction<T = any> {
  label: string;
  icon?: any;
  onClick: (row: T) => void;
  color?: 'primary' | 'danger' | 'success' | 'warning';
  visible?: (row: T) => boolean;
}

export interface BulkAction<T = any> {
  label: string;
  icon?: any;
  onClick: (rows: T[]) => void;
  color?: 'primary' | 'danger' | 'success' | 'warning';
  confirmMessage?: string;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  pageSizeOptions?: number[];
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface TableConfig<T = any> {
  columns: TableColumn<T>[];
  filters?: TableFilter[];
  actions?: TableAction<T>[];
  bulkActions?: BulkAction<T>[];
  selectable?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export interface TableState {
  page: number;
  pageSize: number;
  search: string;
  sort: SortConfig | null;
  filters: { [key: string]: any };
  selectedIds: Set<string | number>;
}
