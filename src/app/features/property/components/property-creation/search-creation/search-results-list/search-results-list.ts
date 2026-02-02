import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SearchTaskStore } from '../../../../store/search-task.store';

@Component({
  selector: 'app-search-results-list',
  imports: [CommonModule],
  templateUrl: './search-results-list.html',
  styleUrl: './search-results-list.css',
})
export class SearchResultsList {
  private router = inject(Router);
  searchTaskStore = inject(SearchTaskStore);

  propertyListUuid = input.required<string>();
  newSearchRequested = output<void>();

  completedItems = this.searchTaskStore.completedItems;
  failedItems = this.searchTaskStore.failedItems;
  totalItems = this.searchTaskStore.totalItems;
  status = this.searchTaskStore.status;

  get duplicatesSkipped(): number {
    const total = this.totalItems();
    const completed = this.completedItems();
    const failed = this.failedItems();
    // Duplicates skipped = total items - (completed + failed)
    return Math.max(0, total - (completed + failed));
  }

  navigateToPropertyList(): void {
    this.router.navigate(['/lists', this.propertyListUuid()]);
  }

  startNewSearch(): void {
    this.searchTaskStore.reset();
    this.newSearchRequested.emit();
  }
}
