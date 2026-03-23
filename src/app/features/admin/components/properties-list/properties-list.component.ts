import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DataTableComponent } from '../../../../shared/components/data-table/data-table.component';
import {
  TableConfig,
  PaginationConfig,
  SortConfig,
} from '../../../../shared/models/table-config.model';
import { AdminPropertiesService } from '../../services/admin-properties.service';
import { AdminProperty } from '../../models/property.model';
import { Eye, Edit, Trash2, Play, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-properties-list',
  standalone: true,
  imports: [CommonModule, DataTableComponent, LucideAngularModule],
  template: `
    <div class="p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-900">Properties</h1>
        <p class="mt-1 text-sm text-gray-600">Manage all properties in the system</p>
      </div>

      <app-data-table
        [config]="tableConfig()"
        [data]="properties()"
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
export class PropertiesListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly propertiesService = inject(AdminPropertiesService);

  // State
  properties = signal<AdminProperty[]>([]);
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

  tableConfig = computed<TableConfig<AdminProperty>>(() => ({
    columns: [
      { field: 'title', header: 'Title', sortable: true, width: '20%' },
      { field: 'postcode', header: 'Postcode', sortable: true },
      {
        field: 'price',
        header: 'Price',
        sortable: true,
        type: 'currency',
      },
      { field: 'bedrooms', header: 'Beds', sortable: true },
      { field: 'bathrooms', header: 'Baths', sortable: true },
      {
        field: 'state',
        header: 'State',
        sortable: true,
        type: 'badge',
      },
      { field: 'lists_count', header: 'Lists', sortable: false },
      {
        field: 'created_at',
        header: 'Created',
        sortable: true,
        type: 'date',
      },
    ],
    searchable: true,
    searchPlaceholder: 'Search properties by title, postcode, or address...',
    selectable: true,
    actions: [
      {
        label: 'View',
        color: 'primary',
        onClick: (row: AdminProperty) => this.viewProperty(row),
      },
      {
        label: 'Delete',
        color: 'danger',
        onClick: (row: AdminProperty) => this.deleteProperty(row),
      },
    ],
    bulkActions: [
      {
        label: 'Run Stage 2',
        color: 'primary',
        onClick: (rows: AdminProperty[]) => this.bulkRunStage2(rows),
        confirmMessage: 'Run Stage 2 for selected properties?',
      },
      {
        label: 'Run Stage 3',
        color: 'success',
        onClick: (rows: AdminProperty[]) => this.bulkRunStage3(rows),
        confirmMessage: 'Run Stage 3 for selected properties?',
      },
      {
        label: 'Delete',
        color: 'danger',
        onClick: (rows: AdminProperty[]) => this.bulkDelete(rows),
        confirmMessage: 'Are you sure you want to delete the selected properties?',
      },
    ],
  }));

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
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

    this.propertiesService.list(params).subscribe({
      next: (response) => {
        this.properties.set(response.results);
        this.totalCount.set(response.count);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load properties:', err);
        alert('Failed to load properties');
        this.isLoading.set(false);
      },
    });
  }

  onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.currentPage.set(1);
    this.loadProperties();
  }

  onSortChange(sort: SortConfig): void {
    this.sortConfig.set(sort);
    this.loadProperties();
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadProperties();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
    this.loadProperties();
  }

  viewProperty(property: AdminProperty): void {
    this.router.navigate(['/properties', property.uuid]);
  }

  deleteProperty(property: AdminProperty): void {
    if (!confirm(`Delete property "${property.title}"?`)) return;

    this.propertiesService.delete(property.uuid).subscribe({
      next: () => {
        alert('Property deleted');
        this.loadProperties();
      },
      error: (err) => {
        console.error('Delete failed:', err);
        alert('Failed to delete property');
      },
    });
  }

  bulkDelete(properties: AdminProperty[]): void {
    const uuids = properties.map((p) => p.uuid);

    this.propertiesService.bulkDelete(uuids).subscribe({
      next: (result) => {
        alert(`Deleted ${result.deleted_count} properties`);
        this.loadProperties();
      },
      error: (err) => {
        console.error('Bulk delete failed:', err);
        alert('Failed to delete properties');
      },
    });
  }

  bulkRunStage2(properties: AdminProperty[]): void {
    const uuids = properties.map((p) => p.uuid);

    this.propertiesService.bulkTransition(uuids, 'run_stage2').subscribe({
      next: (result) => {
        alert(`Processed ${result.processed_count} properties`);
        if (result.errors.length > 0) {
          console.error('Errors:', result.errors);
        }
        this.loadProperties();
      },
      error: (err) => {
        console.error('Bulk stage 2 failed:', err);
        alert('Failed to run stage 2');
      },
    });
  }

  bulkRunStage3(properties: AdminProperty[]): void {
    const uuids = properties.map((p) => p.uuid);

    this.propertiesService.bulkTransition(uuids, 'run_stage3').subscribe({
      next: (result) => {
        alert(`Processed ${result.processed_count} properties`);
        if (result.errors.length > 0) {
          console.error('Errors:', result.errors);
        }
        this.loadProperties();
      },
      error: (err) => {
        console.error('Bulk stage 3 failed:', err);
        alert('Failed to run stage 3');
      },
    });
  }
}
