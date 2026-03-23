import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../services/admin.service';
import { AdminStatistics, SystemStatus } from '../models/admin-statistics.model';
import {
  CircleCheck,
  CircleX,
  Clock,
  Home,
  ListChecks,
  Loader,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  XCircle,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-gray-50 p-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p class="mt-2 text-gray-600">System overview and management</p>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="flex items-center justify-center py-12">
          <lucide-angular
            [img]="Loader"
            class="h-8 w-8 animate-spin text-blue-600"
          ></lucide-angular>
          <span class="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      }

      <!-- Error State -->
      @if (error()) {
        <div class="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
          <div class="flex items-center">
            <lucide-angular [img]="AlertCircle" class="h-5 w-5 text-red-600"></lucide-angular>
            <p class="ml-3 text-red-800">{{ error() }}</p>
          </div>
        </div>
      }

      <!-- Dashboard Content -->
      @if (statistics() && systemStatus()) {
        <div class="space-y-6">
          <!-- Stats Grid -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <!-- Total Properties -->
            <div class="rounded-lg bg-white p-6 shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Total Properties</p>
                  <p class="mt-2 text-3xl font-bold text-gray-900">
                    {{ statistics()?.properties?.total || 0 }}
                  </p>
                  <p class="mt-1 text-sm text-green-600">
                    +{{ statistics()?.properties?.recent_count || 0 }} this week
                  </p>
                </div>
                <lucide-angular
                  [img]="Home"
                  class="h-12 w-12 text-blue-500 opacity-80"
                ></lucide-angular>
              </div>
            </div>

            <!-- Active Lists -->
            <div class="rounded-lg bg-white p-6 shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Active Lists</p>
                  <p class="mt-2 text-3xl font-bold text-gray-900">
                    {{ statistics()?.lists?.active || 0 }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500">
                    of {{ statistics()?.lists?.total || 0 }} total
                  </p>
                </div>
                <lucide-angular
                  [img]="ListChecks"
                  class="h-12 w-12 text-green-500 opacity-80"
                ></lucide-angular>
              </div>
            </div>

            <!-- Avg Price -->
            <div class="rounded-lg bg-white p-6 shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Avg Property Price</p>
                  <p class="mt-2 text-3xl font-bold text-gray-900">
                    £{{ formatPrice(statistics()?.properties?.avg_price || 0) }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500">Across all properties</p>
                </div>
                <lucide-angular
                  [img]="TrendingUp"
                  class="h-12 w-12 text-purple-500 opacity-80"
                ></lucide-angular>
              </div>
            </div>

            <!-- Failed Services -->
            <div class="rounded-lg bg-white p-6 shadow">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600">Failed Services</p>
                  <p class="mt-2 text-3xl font-bold text-red-600">
                    {{ statistics()?.context_services?.failed || 0 }}
                  </p>
                  <p class="mt-1 text-sm text-gray-500">Need attention</p>
                </div>
                <lucide-angular
                  [img]="AlertCircle"
                  class="h-12 w-12 text-red-500 opacity-80"
                ></lucide-angular>
              </div>
            </div>
          </div>

          <!-- Properties by State -->
          <div class="rounded-lg bg-white shadow">
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900">Properties by State</h2>
            </div>
            <div class="p-6">
              <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                @for (state of getPropertyStates(); track state.key) {
                  <div class="rounded-lg border border-gray-200 p-4">
                    <p class="text-xs font-medium text-gray-600 uppercase">{{ state.label }}</p>
                    <p class="mt-1 text-2xl font-bold text-gray-900">{{ state.count }}</p>
                    <div class="mt-2 h-2 rounded-full bg-gray-200">
                      <div
                        class="h-2 rounded-full bg-blue-600"
                        [style.width.%]="
                          (state.count / (statistics()?.properties?.total || 1)) * 100
                        "
                      ></div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <!-- System Status -->
            <div class="rounded-lg bg-white shadow">
              <div class="border-b border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900">System Status</h2>
              </div>
              <div class="space-y-4 p-6">
                <!-- Context Services -->
                <div>
                  <h3 class="mb-2 text-sm font-medium text-gray-700">Context Services</h3>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Pending</span>
                      <span
                        class="rounded bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                      >
                        {{ statistics()?.context_services?.pending || 0 }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">In Progress</span>
                      <span class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {{ statistics()?.context_services?.in_progress || 0 }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Complete</span>
                      <span
                        class="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                      >
                        {{ statistics()?.context_services?.complete || 0 }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Failed</span>
                      <span class="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                        {{ statistics()?.context_services?.failed || 0 }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Tasks -->
                <div>
                  <h3 class="mt-4 mb-2 text-sm font-medium text-gray-700">Tasks</h3>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Queued</span>
                      <span class="rounded bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                        {{ statistics()?.tasks?.queued || 0 }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">In Progress</span>
                      <span class="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                        {{ statistics()?.tasks?.in_progress || 0 }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Failed Services List -->
            <div class="rounded-lg bg-white shadow">
              <div class="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 class="text-lg font-semibold text-gray-900">Failed Services</h2>
                <button
                  (click)="refreshData()"
                  class="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  <lucide-angular [img]="RefreshCw" class="mr-1 h-4 w-4"></lucide-angular>
                  Refresh
                </button>
              </div>
              <div class="divide-y divide-gray-200">
                @if ((systemStatus()?.failed_services?.length || 0) === 0) {
                  <div class="p-6 text-center text-gray-500">
                    <lucide-angular
                      [img]="CircleCheck"
                      class="mx-auto mb-2 h-12 w-12 text-green-500"
                    ></lucide-angular>
                    <p>No failed services</p>
                  </div>
                } @else {
                  @for (service of systemStatus()?.failed_services; track service.id) {
                    <div class="p-4 hover:bg-gray-50">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <p class="text-sm font-medium text-gray-900">
                            {{ service.service_name }}
                          </p>
                          <p class="mt-1 text-xs text-gray-600">{{ service.property_title }}</p>
                          <p class="mt-1 line-clamp-2 text-xs text-red-600">
                            {{ service.error_message }}
                          </p>
                          <p class="mt-1 text-xs text-gray-500">
                            Retry count: {{ service.retry_count }}
                          </p>
                        </div>
                        <button
                          (click)="retryService(service.id)"
                          class="ml-2 text-blue-600 hover:text-blue-700"
                          title="Retry"
                        >
                          <lucide-angular [img]="RefreshCw" class="h-4 w-4"></lucide-angular>
                        </button>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>
          </div>

          <!-- Active Tasks -->
          <div class="rounded-lg bg-white shadow">
            <div class="border-b border-gray-200 p-6">
              <h2 class="text-lg font-semibold text-gray-900">Active Tasks</h2>
            </div>
            <div class="p-6">
              @if ((systemStatus()?.active_tasks?.length || 0) === 0) {
                <div class="py-6 text-center text-gray-500">
                  <lucide-angular
                    [img]="Clock"
                    class="mx-auto mb-2 h-12 w-12 text-gray-400"
                  ></lucide-angular>
                  <p>No active tasks</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (task of systemStatus()?.active_tasks; track task.uuid) {
                    <div class="rounded-lg border border-gray-200 p-4">
                      <div class="mb-2 flex items-center justify-between">
                        <div>
                          <p class="text-sm font-medium text-gray-900">{{ task.task_type }}</p>
                          <p class="text-xs text-gray-600">{{ task.list_title }}</p>
                        </div>
                        <button
                          (click)="cancelTask(task.uuid)"
                          class="text-red-600 hover:text-red-700"
                          title="Cancel Task"
                        >
                          <lucide-angular [img]="XCircle" class="h-5 w-5"></lucide-angular>
                        </button>
                      </div>
                      <div class="space-y-1">
                        <div class="flex items-center justify-between text-xs">
                          <span class="text-gray-600"
                            >{{ task.completed_items }} / {{ task.total_items }} completed</span
                          >
                          <span class="font-medium text-gray-900">{{ task.progress }}%</span>
                        </div>
                        <div class="h-2 rounded-full bg-gray-200">
                          <div
                            class="h-2 rounded-full bg-blue-600 transition-all"
                            [style.width.%]="task.progress"
                          ></div>
                        </div>
                        @if (task.failed_items > 0) {
                          <p class="text-xs text-red-600">{{ task.failed_items }} failed items</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Last Updated -->
          <div class="text-center text-sm text-gray-500">
            Last updated: {{ formatDate(statistics()?.last_updated) }}
          </div>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private readonly adminService = inject(AdminService);

  // Signals
  statistics = signal<AdminStatistics | null>(null);
  systemStatus = signal<SystemStatus | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);

  // Lucide icons
  readonly Home = Home;
  readonly ListChecks = ListChecks;
  readonly TrendingUp = TrendingUp;
  readonly AlertCircle = AlertCircle;
  readonly CircleCheck = CircleCheck;
  readonly CircleX = CircleX;
  readonly Clock = Clock;
  readonly Loader = Loader;
  readonly RefreshCw = RefreshCw;
  readonly XCircle = XCircle;

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    this.error.set(null);

    Promise.all([
      this.adminService.getDashboardStatistics().toPromise(),
      this.adminService.getSystemStatus().toPromise(),
    ])
      .then(([stats, status]) => {
        this.statistics.set(stats!);
        this.systemStatus.set(status!);
        this.isLoading.set(false);
      })
      .catch((err) => {
        this.error.set('Failed to load dashboard data');
        this.isLoading.set(false);
        console.error('Dashboard load error:', err);
      });
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  retryService(contextDataId: number): void {
    if (!confirm('Retry this service?')) return;

    this.adminService.retryContextService(contextDataId).subscribe({
      next: (result) => {
        alert(result.message);
        this.loadDashboardData();
      },
      error: (err) => {
        alert('Failed to retry service');
        console.error('Retry error:', err);
      },
    });
  }

  cancelTask(taskUuid: string): void {
    if (!confirm('Cancel this task?')) return;

    this.adminService.cancelTask(taskUuid).subscribe({
      next: (result) => {
        alert(result.message);
        this.loadDashboardData();
      },
      error: (err) => {
        alert('Failed to cancel task');
        console.error('Cancel error:', err);
      },
    });
  }

  getPropertyStates(): { key: string; label: string; count: number }[] {
    const stats = this.statistics();
    if (!stats) return [];

    const byState = stats.properties.by_state;
    return [
      { key: 'NEW', label: 'New', count: byState['NEW'] || 0 },
      {
        key: 'STAGE2_IN_PROGRESS',
        label: 'Stage 2 In Progress',
        count: byState['STAGE2_IN_PROGRESS'] || 0,
      },
      { key: 'STAGE2_COMPLETE', label: 'Stage 2 Complete', count: byState['STAGE2_COMPLETE'] || 0 },
      {
        key: 'STAGE3_IN_PROGRESS',
        label: 'Stage 3 In Progress',
        count: byState['STAGE3_IN_PROGRESS'] || 0,
      },
      { key: 'STAGE3_COMPLETE', label: 'Stage 3 Complete', count: byState['STAGE3_COMPLETE'] || 0 },
    ];
  }

  formatPrice(price: number): string {
    return price.toLocaleString('en-GB', { maximumFractionDigits: 0 });
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString();
  }
}
