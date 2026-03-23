import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import {
  TableConfig,
  PaginationConfig,
  SortConfig,
} from '../../../../shared/models/table-config.model';
import { AdminListsService } from '../../services/admin-lists.service';
import { AdminPropertyList } from '../../models/property.model';

@Component({
  selector: 'app-lists-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Property Lists</h1>
        <p class="mt-1 text-sm text-gray-600">Manage property lists</p>
      </div>

      <app-data-table
        [config]="tableConfig()"
        [data]="lists()"
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
export class ListsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly listsService = inject(AdminListsService);

  // State
  lists = signal<AdminPropertyList[]>([]);
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

  tableConfig = computed<TableConfig<AdminPropertyList>>(() => ({
    columns: [
      { field: 'title', header: 'Title', sortable: true, width: '30%' },
      { field: 'owner_username', header: 'Owner', sortable: true },
      {
        field: 'state',
        header: 'State',
        sortable: true,
        type: 'badge',
        badgeColors: {
          DRAFT: 'bg-gray-100 text-gray-800',
          ACTIVE: 'bg-green-100 text-green-800',
        },
      },
      { field: 'properties_count', header: 'Properties', sortable: false },
      {
        field: 'created_at',
        header: 'Created',
        sortable: true,
        type: 'date',
      },
    ],
    searchable: true,
    searchPlaceholder: 'Search lists by title or owner...',
    selectable: true,
    actions: [
      {
        label: 'View',
        color: 'primary',
        onClick: (row: AdminPropertyList) => this.viewList(row),
      },
      {
        label: 'Delete',
        color: 'danger',
        onClick: (row: AdminPropertyList) => this.deleteList(row),
      },
    ],
    bulkActions: [
      {
        label: 'Delete',
        color: 'danger',
        onClick: (rows: AdminPropertyList[]) => this.bulkDelete(rows),
        confirmMessage: 'Are you sure you want to delete the selected lists?',
      },
    ],
  }));

  ngOnInit(): void {
    this.loadLists();
  }

  loadLists(): void {
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

    this.listsService.list(params).subscribe({
      next: (response) => {
        this.lists.set(response.results);
        this.totalCount.set(response.count);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load lists:', err);
        alert('Failed to load lists');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadLists();
  }

  onSortChange(sort: SortConfig): void {
    this.sortConfig.set(sort);
    this.loadLists();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLists();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadLists();
  }

  viewList(list: AdminPropertyList): void {
    this.router.navigate(['/lists', list.uuid]);
  }

  deleteList(list: AdminPropertyList): void {
    if (!confirm(`Delete list "${list.title}"?`)) return;

    this.listsService.delete(list.uuid).subscribe({
      next: () => {
        alert('List deleted');
        this.loadLists();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete list');
      },
    });
  }

  bulkDelete(lists: AdminPropertyList[]): void {
    const uuids = lists.map((l) => l.uuid);

    this.listsService.bulkDelete(uuids).subscribe({
      next: (result) => {
        alert(`Deleted ${result.deleted_count} lists`);
        this.loadLists();
      },
      error: (err) => {
        console.error('Bulk delete failed:', err);
        alert('Failed to delete lists');
      },
    });
  }
}
