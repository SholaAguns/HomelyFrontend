import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { SearchTaskStore } from '../../../store/search-task.store';
import { PropertyListStore } from '../../../../property-lists/store/property-list.store';
import { SearchCriteriaForm } from './search-criteria-form/search-criteria-form';
import { SearchProgress } from './search-progress/search-progress';
import { SearchResultsList } from './search-results-list/search-results-list';
import { SearchCriteria } from '../../../../../shared/models/property-models';

type SearchView = 'criteria' | 'progress' | 'results';

@Component({
  selector: 'app-search-creation',
  standalone: true,
  imports: [CommonModule, SearchCriteriaForm, SearchProgress, SearchResultsList],
  templateUrl: './search-creation.component.html',
  styleUrl: './search-creation.component.css',
})
export class SearchCreationComponent {
  private route = inject(ActivatedRoute);
  searchTaskStore = inject(SearchTaskStore);
  propertyListStore = inject(PropertyListStore);

  propertyListUuid: string = '';
  lastSearchCriteria: SearchCriteria | null = null;

  status = this.searchTaskStore.status;
  loading = this.searchTaskStore.loading;

  existingSearchCriteria = computed<SearchCriteria | null>(() => {
    const selectedList = this.propertyListStore.selected();
    return selectedList?.search_criteria || null;
  });

  currentView = computed<SearchView>(() => {
    const currentStatus = this.status();

    if (currentStatus === 'COMPLETED' || currentStatus === 'FAILED') {
      return 'results';
    } else if (currentStatus === 'QUEUED' || currentStatus === 'IN_PROGRESS') {
      return 'progress';
    } else {
      return 'criteria';
    }
  });

  constructor() {
    this.propertyListUuid = this.route.parent?.snapshot.paramMap.get('uuid') || '';
    this.propertyListStore.select(this.propertyListUuid);
  }

  onSearchSubmit(searchCriteria: SearchCriteria): void {
    this.lastSearchCriteria = searchCriteria;
    this.searchTaskStore.startSearch({
      listUuid: this.propertyListUuid,
      request: {
        search_criteria: searchCriteria,
      },
    });
  }

  onNewSearchRequested(): void {
    // Reset handled by SearchResultsList component
    // View will automatically switch to 'criteria' due to computed signal
  }

  onRetry(): void {
    if (this.lastSearchCriteria) {
      this.searchTaskStore.reset();
      // Slight delay to ensure reset completes
      setTimeout(() => {
        this.onSearchSubmit(this.lastSearchCriteria!);
      }, 100);
    }
  }
}
