import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import {
  TableConfig,
  PaginationConfig,
  SortConfig,
} from '../../../../shared/models/table-config.model';
import { AdminContextDataService } from '../../services/admin-context-data.service';
import { AdminContextData } from '../../models/property.model';

@Component({
  selector: 'app-context-data-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Context Data</h1>
        <p class="mt-1 text-sm text-gray-600">Manage context service data and statuses</p>
      </div>

      <app-data-table
        [config]="tableConfig()"
        [data]="contextData()"
        [pagination]="paginationConfig()"
        [isLoading]="isLoading()"
        [idField]="'id'"
        (searchChange)="onSearchChange($event)"
        (sortChange)="onSortChange($event)"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      >
      </app-data-table>
    </div>
  `,
})
export class ContextDataListComponent implements OnInit {
  private readonly contextDataService = inject(AdminContextDataService);

  // State
  contextData = signal<AdminContextData[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  pageSize = signal(25);
  totalCount = signal(0);
  searchQuery = signal('');
  sortConfig = signal<SortConfig | null>(null);

  // Computed
  paginationConfig = computed<PaginationConfig>(() => ({
    page: this.currentPage(),
    pageSize: this.pageSize(),
    total: this.totalCount(),
    pageSizeOptions: [10, 25, 50, 100],
  }));

  tableConfig = computed<TableConfig<AdminContextData>>(() => ({
    columns: [
      { field: 'property_title', header: 'Property', sortable: false, width: '25%' },
      { field: 'service_name', header: 'Service', sortable: true },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        type: 'badge',
        badgeColors: {
          PENDING: 'bg-yellow-100 text-yellow-800',
          IN_PROGRESS: 'bg-blue-100 text-blue-800',
          COMPLETE: 'bg-green-100 text-green-800',
          FAILED: 'bg-red-100 text-red-800',
        },
      },
      { field: 'retry_count', header: 'Retries', sortable: true },
      {
        field: 'last_attempt_at',
        header: 'Last Attempt',
        sortable: true,
        type: 'date',
      },
      {
        field: 'created_at',
        header: 'Created',
        sortable: true,
        type: 'date',
      },
    ],
    searchable: true,
    searchPlaceholder: 'Search by property title...',
    selectable: true,
    actions: [
      {
        label: 'Retry',
        color: 'primary',
        onClick: (row: AdminContextData) => this.retryService(row),
        visible: (row: AdminContextData) => row.status === 'FAILED',
      },
      {
        label: 'Delete',
        color: 'danger',
        onClick: (row: AdminContextData) => this.deleteService(row),
      },
    ],
    bulkActions: [
      {
        label: 'Retry Failed',
        color: 'primary',
        onClick: (rows: AdminContextData[]) => this.bulkRetry(rows),
        confirmMessage: 'Retry selected failed services?',
      },
    ],
  }));

  ngOnInit(): void {
    this.loadContextData();
  }

  loadContextData(): void {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      page_size: this.pageSize(),
    };

    if (this.searchQuery()) {
      params.search = this.searchQuery();
    }

    if (this.sortConfig()) {
      const sort = this.sortConfig()!;
      params.ordering = sort.direction === 'desc' ? `-${sort.field}` : sort.field;
    }

    this.contextDataService.list(params).subscribe({
      next: (response) => {
        this.contextData.set(response.results);
        this.totalCount.set(response.count);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load context data:', err);
        alert('Failed to load context data');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadContextData();
  }

  onSortChange(sort: SortConfig): void {
    this.sortConfig.set(sort);
    this.loadContextData();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadContextData();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadContextData();
  }

  retryService(contextData: AdminContextData): void {
    if (!confirm(`Retry ${contextData.service_name} for ${contextData.property_title}?`)) return;

    this.contextDataService.retry(contextData.id).subscribe({
      next: (result) => {
        alert(result.message);
        this.loadContextData();
      },
      error: (err) => {
        console.error('Retry failed:', err);
        alert('Failed to retry service');
      },
    });
  }

  deleteService(contextData: AdminContextData): void {
    if (!confirm(`Delete ${contextData.service_name} data for ${contextData.property_title}?`))
      return;

    this.contextDataService.delete(contextData.id).subscribe({
      next: () => {
        alert('Context data deleted');
        this.loadContextData();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete context data');
      },
    });
  }

  bulkRetry(contextData: AdminContextData[]): void {
    const failedIds = contextData.filter((cd) => cd.status === 'FAILED').map((cd) => cd.id);

    if (failedIds.length === 0) {
      alert('No failed services selected');
      return;
    }

    this.contextDataService.bulkRetry(failedIds).subscribe({
      next: (result) => {
        alert(`Retried ${result.retried_count} services`);
        this.loadContextData();
      },
      error: (err) => {
        console.error('Bulk retry failed:', err);
        alert('Failed to retry services');
      },
    });
  }
}
