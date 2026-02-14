import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchTaskStore } from '../../../../store/search-task.store';

@Component({
  selector: 'app-search-progress',
  imports: [CommonModule],
  templateUrl: './search-progress.html',
  styleUrl: './search-progress.css',
})
export class SearchProgress {
  searchTaskStore = inject(SearchTaskStore);

  status = this.searchTaskStore.status;
  completedItems = this.searchTaskStore.completedItems;
  totalItems = this.searchTaskStore.totalItems;
  failedItems = this.searchTaskStore.failedItems;
  progressPercentage = this.searchTaskStore.progressPercentage;
  errors = this.searchTaskStore.errors;
  usingPollingFallback = this.searchTaskStore.usingPollingFallback;

  showErrors = false;

  statusClass = computed(() => {
    const currentStatus = this.status();
    switch (currentStatus) {
      case 'QUEUED':
        return 'status-queued';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      case 'FAILED':
        return 'status-failed';
      default:
        return '';
    }
  });

  statusLabel = computed(() => {
    const currentStatus = this.status();
    switch (currentStatus) {
      case 'QUEUED':
        return 'Queued';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  });

  toggleErrors(): void {
    this.showErrors = !this.showErrors;
  }

  onCancel(): void {
    // TODO: Future enhancement - call cancel endpoint
    console.log('Cancel requested - not yet implemented');
  }
}
