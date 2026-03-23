import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import {
  TableConfig,
  PaginationConfig,
  SortConfig,
} from '../../../../shared/models/table-config.model';
import { AdminTasksService } from '../../services/admin-tasks.service';
import { AdminPropertyListTask } from '../../models/property.model';

@Component({
  selector: 'app-tasks-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Tasks</h1>
        <p class="mt-1 text-sm text-gray-600">Monitor property list tasks</p>
      </div>

      <app-data-table
        [config]="tableConfig()"
        [data]="tasks()"
        [pagination]="paginationConfig()"
        [isLoading]="isLoading()"
        [idField]="'uuid'"
        (searchChange)="onSearchChange($event)"
        (sortChange)="onSortChange($event)"
        (pageChange)="onPageChange($event)"
        (pageSizeChange)="onPageSizeChange($event)"
      >
      </app-data-table>
    </div>
  `,
})
export class TasksListComponent implements OnInit {
  private readonly tasksService = inject(AdminTasksService);

  // State
  tasks = signal<AdminPropertyListTask[]>([]);
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

  tableConfig = computed<TableConfig<AdminPropertyListTask>>(() => ({
    columns: [
      { field: 'list_title', header: 'Property List', sortable: false, width: '25%' },
      { field: 'task_type', header: 'Type', sortable: true },
      {
        field: 'status',
        header: 'Status',
        sortable: true,
        type: 'badge',
        badgeColors: {
          QUEUED: 'bg-gray-100 text-gray-800',
          IN_PROGRESS: 'bg-blue-100 text-blue-800',
          COMPLETED: 'bg-green-100 text-green-800',
          FAILED: 'bg-red-100 text-red-800',
          CANCELLED: 'bg-orange-100 text-orange-800',
        },
      },
      {
        field: 'progress_percentage',
        header: 'Progress',
        sortable: false,
        type: 'custom',
        customRenderer: (row: AdminPropertyListTask) =>
          `${row.progress_percentage}% (${row.completed_items}/${row.total_items})`,
      },
      { field: 'failed_items', header: 'Failed', sortable: false },
      {
        field: 'created_at',
        header: 'Created',
        sortable: true,
        type: 'date',
      },
    ],
    searchable: false,
    selectable: false,
    actions: [
      {
        label: 'Cancel',
        color: 'danger',
        onClick: (row: AdminPropertyListTask) => this.cancelTask(row),
        visible: (row: AdminPropertyListTask) =>
          row.status === 'QUEUED' || row.status === 'IN_PROGRESS',
      },
    ],
  }));

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading.set(true);

    const params: any = {
      page: this.currentPage(),
      page_size: this.pageSize(),
    };

    if (this.sortConfig()) {
      const sort = this.sortConfig()!;
      params.ordering = sort.direction === 'desc' ? `-${sort.field}` : sort.field;
    }

    this.tasksService.list(params).subscribe({
      next: (response) => {
        this.tasks.set(response.results);
        this.totalCount.set(response.count);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load tasks:', err);
        alert('Failed to load tasks');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    // Not used for tasks
  }

  onSortChange(sort: SortConfig): void {
    this.sortConfig.set(sort);
    this.loadTasks();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTasks();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadTasks();
  }

  cancelTask(task: AdminPropertyListTask): void {
    if (!confirm(`Cancel task "${task.task_type}" for ${task.list_title}?`)) return;

    this.tasksService.cancel(task.uuid).subscribe({
      next: (result) => {
        alert(result.message);
        this.loadTasks();
      },
      error: (err) => {
        console.error('Cancel failed:', err);
        alert('Failed to cancel task');
      },
    });
  }
}
