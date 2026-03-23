import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TableConfig,
  TableColumn,
  PaginationConfig,
  SortConfig,
  TableState,
} from '../../models/table-config.model';
import {
  ChevronDown,
  ChevronUp,
  Search,
  ChevronLeft,
  ChevronRight,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="rounded-lg bg-white shadow">
      <!-- Header: Search & Actions -->
      <div class="border-b border-gray-200 p-4">
        <div class="flex items-center justify-between">
          <!-- Search -->
          @if (config().searchable) {
            <div class="relative max-w-md flex-1">
              <lucide-angular
                [img]="Search"
                class="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-gray-400"
              ></lucide-angular>
              <input
                type="text"
                [(ngModel)]="searchQuery"
                (ngModelChange)="onSearchChange($event)"
                [placeholder]="config().searchPlaceholder || 'Search...'"
                class="w-full rounded-lg border border-gray-300 py-2 pr-4 pl-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          }

          <!-- Create Button Slot -->
          <div class="ml-4">
            <ng-content select="[createButton]"></ng-content>
          </div>
        </div>

        <!-- Bulk Actions Bar -->
        @if (selectedCount() > 0 && config().bulkActions?.length) {
          <div class="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
            <span class="text-sm font-medium text-blue-900"> {{ selectedCount() }} selected </span>
            @for (action of config().bulkActions; track action.label) {
              <button
                (click)="handleBulkAction(action)"
                [class]="getBulkActionClass(action.color)"
                class="rounded px-3 py-1.5 text-sm font-medium transition-colors"
              >
                {{ action.label }}
              </button>
            }
            <button
              (click)="clearSelection()"
              class="ml-auto text-sm text-blue-600 hover:text-blue-800"
            >
              Clear selection
            </button>
          </div>
        }
      </div>

      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              @if (config().selectable) {
                <th class="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    [checked]="isAllSelected()"
                    [indeterminate]="isSomeSelected()"
                    (change)="toggleSelectAll()"
                    class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              }
              @for (column of config().columns; track column.field) {
                <th
                  [style.width]="column.width"
                  class="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
                >
                  @if (column.sortable) {
                    <button
                      (click)="onSort(column.field.toString())"
                      class="flex items-center gap-1 hover:text-gray-900"
                    >
                      {{ column.header }}
                      @if (currentSort()?.field === column.field) {
                        @if (currentSort()?.direction === 'asc') {
                          <lucide-angular [img]="ChevronUp" class="h-4 w-4"></lucide-angular>
                        } @else {
                          <lucide-angular [img]="ChevronDown" class="h-4 w-4"></lucide-angular>
                        }
                      }
                    </button>
                  } @else {
                    {{ column.header }}
                  }
                </th>
              }
              @if (config().actions?.length) {
                <th class="w-32 px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase">
                  Actions
                </th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            @if (isLoading()) {
              <tr>
                <td [attr.colspan]="getTotalColumns()" class="px-4 py-12 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            } @else if (data().length === 0) {
              <tr>
                <td [attr.colspan]="getTotalColumns()" class="px-4 py-12 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            } @else {
              @for (row of data(); track getRowId(row)) {
                <tr class="hover:bg-gray-50">
                  @if (config().selectable) {
                    <td class="px-4 py-3">
                      <input
                        type="checkbox"
                        [checked]="isSelected(row)"
                        (change)="toggleSelect(row)"
                        class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  }
                  @for (column of config().columns; track column.field) {
                    <td class="px-4 py-3 text-sm text-gray-900">
                      @switch (column.type) {
                        @case ('badge') {
                          <span
                            [class]="getBadgeClass(getCellValue(row, column), column.badgeColors)"
                            class="rounded-full px-2 py-1 text-xs font-medium"
                          >
                            {{ getCellValue(row, column) }}
                          </span>
                        }
                        @case ('currency') {
                          £{{ formatCurrency(getCellValue(row, column)) }}
                        }
                        @case ('date') {
                          {{ formatDate(getCellValue(row, column)) }}
                        }
                        @case ('custom') {
                          {{
                            column.customRenderer
                              ? column.customRenderer(row)
                              : getCellValue(row, column)
                          }}
                        }
                        @default {
                          {{ getCellValue(row, column) }}
                        }
                      }
                    </td>
                  }
                  @if (config().actions?.length) {
                    <td class="px-4 py-3 text-right text-sm">
                      <div class="flex justify-end gap-2">
                        @for (action of getVisibleActions(row); track action.label) {
                          <button
                            (click)="action.onClick(row)"
                            [class]="getActionClass(action.color)"
                            class="rounded px-2 py-1 text-xs font-medium transition-colors"
                          >
                            {{ action.label }}
                          </button>
                        }
                      </div>
                    </td>
                  }
                </tr>
              }
            }
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      @if (pagination()) {
        <div class="border-t border-gray-200 bg-gray-50 px-4 py-3">
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-700">
              Showing
              <span class="font-medium">{{ getStartRecord() }}</span>
              to
              <span class="font-medium">{{ getEndRecord() }}</span>
              of
              <span class="font-medium">{{ pagination()!.total }}</span>
              results
            </div>
            <div class="flex items-center gap-2">
              <!-- Page Size -->
              <select
                [(ngModel)]="pageSize"
                (ngModelChange)="onPageSizeChange($event)"
                class="rounded border border-gray-300 py-1 pr-8 pl-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
              >
                @for (size of pagination()!.pageSizeOptions || [10, 25, 50, 100]; track size) {
                  <option [value]="size">{{ size }} per page</option>
                }
              </select>

              <!-- Previous -->
              <button
                (click)="onPageChange(pagination()!.page - 1)"
                [disabled]="pagination()!.page === 1"
                class="rounded border border-gray-300 p-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <lucide-angular [img]="ChevronLeft" class="h-5 w-5"></lucide-angular>
              </button>

              <!-- Page Numbers -->
              <span class="text-sm text-gray-700">
                Page {{ pagination()!.page }} of {{ getTotalPages() }}
              </span>

              <!-- Next -->
              <button
                (click)="onPageChange(pagination()!.page + 1)"
                [disabled]="pagination()!.page >= getTotalPages()"
                class="rounded border border-gray-300 p-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <lucide-angular [img]="ChevronRight" class="h-5 w-5"></lucide-angular>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class DataTableComponent<T = any> {
  // Inputs
  config = input.required<TableConfig<T>>();
  data = input.required<T[]>();
  pagination = input<PaginationConfig | null>(null);
  isLoading = input<boolean>(false);
  idField = input<keyof T | string>('id');

  // Outputs
  searchChange = output<string>();
  sortChange = output<SortConfig>();
  pageChange = output<number>();
  pageSizeChange = output<number>();

  // Icons
  readonly Search = Search;
  readonly ChevronUp = ChevronUp;
  readonly ChevronDown = ChevronDown;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;

  // Internal state
  searchQuery = signal('');
  pageSize = signal(10);
  currentSort = signal<SortConfig | null>(null);
  selectedIds = signal<Set<any>>(new Set());

  selectedCount = computed(() => this.selectedIds().size);

  constructor() {
    // Initialize page size from pagination
    effect(() => {
      const pag = this.pagination();
      if (pag) {
        this.pageSize.set(pag.pageSize);
      }
    });
  }

  onSearchChange(query: string): void {
    this.searchChange.emit(query);
  }

  onSort(field: string): void {
    const current = this.currentSort();
    let newSort: SortConfig;

    if (current?.field === field) {
      newSort = { field, direction: current.direction === 'asc' ? 'desc' : 'asc' };
    } else {
      newSort = { field, direction: 'asc' };
    }

    this.currentSort.set(newSort);
    this.sortChange.emit(newSort);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  getRowId(row: T): any {
    const idFieldName = this.idField() as keyof T;
    return row[idFieldName];
  }

  toggleSelect(row: T): void {
    const id = this.getRowId(row);
    const newSet = new Set(this.selectedIds());
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    this.selectedIds.set(newSet);
  }

  toggleSelectAll(): void {
    if (this.isAllSelected()) {
      this.selectedIds.set(new Set());
    } else {
      const allIds = this.data().map((row) => this.getRowId(row));
      this.selectedIds.set(new Set(allIds));
    }
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  isSelected(row: T): boolean {
    return this.selectedIds().has(this.getRowId(row));
  }

  isAllSelected(): boolean {
    return this.data().length > 0 && this.selectedIds().size === this.data().length;
  }

  isSomeSelected(): boolean {
    const count = this.selectedIds().size;
    return count > 0 && count < this.data().length;
  }

  getSelectedRows(): T[] {
    const selectedSet = this.selectedIds();
    return this.data().filter((row) => selectedSet.has(this.getRowId(row)));
  }

  handleBulkAction(action: any): void {
    const selected = this.getSelectedRows();
    if (action.confirmMessage) {
      if (confirm(action.confirmMessage)) {
        action.onClick(selected);
        this.clearSelection();
      }
    } else {
      action.onClick(selected);
      this.clearSelection();
    }
  }

  getCellValue(row: T, column: TableColumn<T>): any {
    const field = column.field as keyof T;
    return row[field];
  }

  getVisibleActions(row: T): any[] {
    return this.config().actions?.filter((action) => !action.visible || action.visible(row)) || [];
  }

  getTotalColumns(): number {
    let count = this.config().columns.length;
    if (this.config().selectable) count++;
    if (this.config().actions?.length) count++;
    return count;
  }

  getStartRecord(): number {
    const pag = this.pagination();
    if (!pag) return 0;
    return (pag.page - 1) * pag.pageSize + 1;
  }

  getEndRecord(): number {
    const pag = this.pagination();
    if (!pag) return 0;
    return Math.min(pag.page * pag.pageSize, pag.total);
  }

  getTotalPages(): number {
    const pag = this.pagination();
    if (!pag) return 1;
    return Math.ceil(pag.total / pag.pageSize);
  }

  getBadgeClass(value: any, colors?: { [key: string]: string }): string {
    const colorMap = colors || {
      NEW: 'bg-gray-100 text-gray-800',
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETE: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      STAGE2_IN_PROGRESS: 'bg-blue-100 text-blue-800',
      STAGE2_COMPLETE: 'bg-green-100 text-green-800',
      STAGE3_IN_PROGRESS: 'bg-purple-100 text-purple-800',
      STAGE3_COMPLETE: 'bg-green-100 text-green-800',
    };
    return colorMap[value] || 'bg-gray-100 text-gray-800';
  }

  getActionClass(color?: string): string {
    const colorMap = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-600 text-white hover:bg-gray-700';
  }

  getBulkActionClass(color?: string): string {
    const colorMap = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      danger: 'bg-red-600 text-white hover:bg-red-700',
      success: 'bg-green-600 text-white hover:bg-green-700',
      warning: 'bg-yellow-600 text-white hover:bg-yellow-700',
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-600 text-white hover:bg-gray-700';
  }

  formatCurrency(value: any): string {
    if (!value) return '0';
    return Number(value).toLocaleString('en-GB', { maximumFractionDigits: 0 });
  }

  formatDate(value: any): string {
    if (!value) return '';
    return new Date(value).toLocaleDateString();
  }
}
