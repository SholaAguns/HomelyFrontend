import { Component, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectStore } from '../../store/project.store';

@Component({
  selector: 'app-project-stats-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (projectStore.selectedStats()) {
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div class="rounded-lg bg-blue-50 p-4">
          <div class="text-sm font-medium text-blue-600">Total Properties</div>
          <div class="mt-1 text-2xl font-bold text-gray-900">
            {{ projectStore.selectedStats()!.total_properties }}
          </div>
        </div>

        <div class="rounded-lg bg-green-50 p-4">
          <div class="text-sm font-medium text-green-600">Property Lists</div>
          <div class="mt-1 text-2xl font-bold text-gray-900">
            {{ projectStore.selectedStats()!.property_lists_count }}
          </div>
        </div>

        @if (projectStore.selectedStats()!.avg_price) {
          <div class="rounded-lg bg-purple-50 p-4">
            <div class="text-sm font-medium text-purple-600">Avg Price</div>
            <div class="mt-1 text-2xl font-bold text-gray-900">
              £{{ projectStore.selectedStats()!.avg_price | number: '1.0-0' }}
            </div>
          </div>
        }

        @if (projectStore.selectedStats()!.max_price) {
          <div class="rounded-lg bg-orange-50 p-4">
            <div class="text-sm font-medium text-orange-600">Price Range</div>
            <div class="mt-1 text-sm font-bold text-gray-900">
              £{{ projectStore.selectedStats()!.min_price | number: '1.0-0' }} - £{{
                projectStore.selectedStats()!.max_price | number: '1.0-0'
              }}
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="rounded-lg bg-gray-50 p-4">
        <p class="text-sm text-gray-600">Loading statistics...</p>
      </div>
    }
  `,
})
export class ProjectStatsPanelComponent implements OnInit {
  @Input() projectUuid!: string;
  readonly projectStore = inject(ProjectStore);

  ngOnInit() {
    if (this.projectUuid) {
      this.projectStore.loadStats(this.projectUuid);
    }
  }
}
