import { Component, inject, OnInit, OnDestroy, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { PropertySseService } from '../../../../core/services/property-sse-service/property-sse.service';
import { ContextDataService } from '../../../../core/services/context-data-service/context-data.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { ProjectStore } from '../../../projects/store/project.store';
import { PropertyListDetail } from '../../../../shared/models/property-list-models';
import { PropertyListFormComponent } from '../property-list-form/property-list-form.component';
import { PropertyPreviewCard } from '../property-preview-card/property-preview-card';
import { SearchTaskStore } from '../../../property/store/search-task.store';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { InlineModalComponent } from '../../../../shared/components/inline-modal/inline-modal.component';
import { ContextOptionsFormComponent } from '../context-options-form/context-options-form.component';
import {
  forkJoin,
  Subject,
  Subscription,
  from,
  mergeMap,
  TimeoutError,
  timeout,
  catchError,
  debounceTime,
  EMPTY,
} from 'rxjs';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { ProjectRole } from '../../../../shared/models/auth-models';
import { ScrapeProgressEvent } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-list-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    PropertyListFormComponent,
    PropertyPreviewCard,
    LoadingSpinnerComponent,
    InlineModalComponent,
  ],
  templateUrl: './property-list-detail.component.html',
  styleUrl: './property-list-detail.component.css',
})
export class PropertyListDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyListService = inject(PropertyListService);
  private propertyService = inject(PropertyService);
  private propertySseService = inject(PropertySseService);
  private contextDataService = inject(ContextDataService);
  private favoritesService = inject(FavoritesService);
  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  searchTaskStore = inject(SearchTaskStore);
  projectStore = inject(ProjectStore);

  list = signal<PropertyListDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);
  currentPage = signal(1);
  itemsPerPage = 20;
  selectionMode = signal(false);
  selectedPropertyUuids = signal<Set<string>>(new Set());
  showContextOptionsModal = signal(false);
  showDropdown = signal(false);
  userRole = signal<ProjectRole>(null);
  showFilters = signal(false);
  filterState = signal<string>('');
  filterSource = signal<string>('');
  filterHasGarden = signal<boolean | null>(null);
  filterDisqualified = signal<'all' | 'hide' | 'only'>('all');
  titleSearchDebounced = signal<string>('');
  private wsSubscription?: Subscription;
  private scrapeSubscription?: Subscription;
  private titleSearchSubscription?: Subscription;
  private titleSearchSubject = new Subject<string>();

  canEdit = computed(() => {
    const listData = this.list();
    if (!listData) return false;
    return this.authService.canEdit(listData.project, this.userRole());
  });

  paginatedProperties = computed(() => {
    const sorted = this.sortedProperties();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return sorted.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.sortedProperties().length / this.itemsPerPage));

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterState()) count++;
    if (this.filterSource()) count++;
    if (this.filterHasGarden() !== null) count++;
    if (this.filterDisqualified() !== 'all') count++;
    if (this.titleSearchDebounced()) count++;
    return count;
  });

  selectedCount = computed(() => this.selectedPropertyUuids().size);

  allSelected = computed(() => {
    const listData = this.list();
    if (!listData || listData.properties.length === 0) return false;
    return this.selectedPropertyUuids().size === listData.properties.length;
  });

  protected readonly Math = Math;

  constructor() {
    // Reload properties when scraping completes or fails
    effect(() => {
      const status = this.searchTaskStore.status();

      if (status === 'COMPLETED' || status === 'FAILED') {
        const uuid = this.route.snapshot.paramMap.get('uuid');
        if (uuid) {
          this.loadList(uuid);
        }
      }
    });
  }

  ngOnInit() {
    this.titleSearchSubscription = this.titleSearchSubject
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.titleSearchDebounced.set(value);
        this.currentPage.set(1);
      });

    this.authService.getCurrentUser().subscribe();

    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadList(uuid);

      // Start polling if there's an active task for this list
      const currentTask = this.searchTaskStore.currentTask();
      const taskListUuid = this.searchTaskStore.propertyListUuid();
      const taskStatus = this.searchTaskStore.status();

      if (
        currentTask &&
        taskListUuid === uuid &&
        (taskStatus === 'QUEUED' || taskStatus === 'IN_PROGRESS')
      ) {
        this.searchTaskStore.startPolling(uuid);
        this.subscribeToScrapeEvents(uuid);
      }
    }
  }

  ngOnDestroy() {
    this.searchTaskStore.reset();
    this.wsSubscription?.unsubscribe();
    this.scrapeSubscription?.unsubscribe();
    this.titleSearchSubscription?.unsubscribe();
  }

  private subscribeToScrapeEvents(listUuid: string): void {
    this.scrapeSubscription?.unsubscribe();
    this.scrapeSubscription = this.propertySseService
      .connectToPropertyList(listUuid)
      .pipe(
        timeout(30 * 60 * 1000),
        catchError(() => EMPTY)
      )
      .subscribe({
        next: (event) => {
          if (
            event.type === 'scrape_progress' ||
            event.type === 'scrape_complete' ||
            event.type === 'scrape_failed'
          ) {
            this.searchTaskStore.updateProgress(event.data as ScrapeProgressEvent);
          }
        },
        error: () => {},
      });
  }

  private subscribeToListEvents(
    listUuid: string,
    propertyCount: number,
    onConnected: () => void
  ): void {
    this.wsSubscription?.unsubscribe();
    let stage2CompletedCount = 0;

    this.wsSubscription = this.propertySseService
      .connectToPropertyList(listUuid)
      .pipe(
        timeout(10 * 60 * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.notificationService.error('Operation timed out. Refresh for latest state.');
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'connected') {
            onConnected();
            return;
          }
          if (event.type === 'stage2_complete') {
            stage2CompletedCount++;
            this.loadList(listUuid);
            if (stage2CompletedCount >= propertyCount) {
              this.wsSubscription?.unsubscribe();
            }
          }
        },
        error: () => {},
      });
  }

  loadList(uuid: string) {
    this.loading.set(true);
    this.error.set(null);
    this.propertyListService.getByUuid(uuid).subscribe({
      next: (list) => {
        this.list.set(list);
        this.currentPage.set(1);
        this.loading.set(false);

        if (list.project) {
          this.projectStore.loadDetail(list.project);
        }

        this.authService.getUserRole(list.project).subscribe({
          next: (roleResponse) => this.userRole.set(roleResponse.role),
          error: () => {},
        });
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage() {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage() {
    this.goToPage(this.currentPage() - 1);
  }

  onDelete() {
    const list = this.list();
    if (list && confirm('Are you sure you want to delete this property list?')) {
      this.propertyListService.delete(list.uuid).subscribe({
        next: () => {
          this.router.navigate(['/lists']);
        },
        error: (err) => {
          this.error.set(err.message);
        },
      });
    }
  }

  onEdit() {
    this.editMode.set(true);
  }

  onCancelEdit() {
    this.editMode.set(false);
  }

  onUpdate(data: any) {
    const list = this.list();
    if (list) {
      this.propertyListService.update(list.uuid, data).subscribe({
        next: (updated) => {
          this.list.update((current) => (current ? { ...current, ...updated } : null));
          this.editMode.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
        },
      });
    }
  }

  toggleSelectionMode() {
    this.selectionMode.update((mode) => !mode);
    if (!this.selectionMode()) {
      this.clearSelection();
    }
  }

  togglePropertySelection(uuid: string) {
    this.selectedPropertyUuids.update((selected) => {
      const newSet = new Set(selected);
      if (newSet.has(uuid)) {
        newSet.delete(uuid);
      } else {
        newSet.add(uuid);
      }
      return newSet;
    });
  }

  selectAll() {
    const listData = this.list();
    if (listData) {
      const allUuids = new Set(listData.properties.map((p) => p.uuid));
      this.selectedPropertyUuids.set(allUuids);
    }
  }

  clearSelection() {
    this.selectedPropertyUuids.set(new Set());
  }

  deleteSelected() {
    const count = this.selectedCount();
    if (count === 0) return;

    const confirmMessage = `Are you sure you want to delete ${count} ${count === 1 ? 'property' : 'properties'}?`;
    if (!confirm(confirmMessage)) return;

    const deleteObservables = Array.from(this.selectedPropertyUuids()).map((uuid) =>
      this.propertyService.delete(uuid)
    );

    this.loading.set(true);
    forkJoin(deleteObservables).subscribe({
      next: () => {
        const listUuid = this.list()?.uuid;
        if (listUuid) {
          this.clearSelection();
          this.selectionMode.set(false);
          this.loadList(listUuid);
        }
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  isPropertySelected(uuid: string): boolean {
    return this.selectedPropertyUuids().has(uuid);
  }

  sortBy = signal<'rating' | 'price' | 'title'>('rating');
  sortDirection = signal<'asc' | 'desc'>('desc');

  sortedProperties = computed(() => {
    const listData = this.list();
    if (!listData) return [];

    const stateFilter = this.filterState();
    const sourceFilter = this.filterSource();
    const gardenFilter = this.filterHasGarden();
    const disqualifiedFilter = this.filterDisqualified();
    const titleSearch = this.titleSearchDebounced().toLowerCase().trim();

    const filtered = listData.properties.filter((p) => {
      if (stateFilter && p.state !== stateFilter) return false;
      if (sourceFilter) {
        const propertySource = p.external_url?.includes('rightmove')
          ? 'Rightmove'
          : p.external_url?.includes('zoopla')
            ? 'Zoopla'
            : 'Manual';
        if (propertySource !== sourceFilter) return false;
      }
      if (gardenFilter !== null && p.garden !== gardenFilter) return false;
      if (disqualifiedFilter === 'hide' && p.disqualified) return false;
      if (disqualifiedFilter === 'only' && !p.disqualified) return false;
      if (
        titleSearch &&
        !p.title.toLowerCase().includes(titleSearch) &&
        !p.address_line_1?.toLowerCase().includes(titleSearch)
      )
        return false;
      return true;
    });

    const sortByValue = this.sortBy();
    const direction = this.sortDirection();

    return [...filtered].sort((a, b) => {
      if (a.disqualified && !b.disqualified) return 1;
      if (!a.disqualified && b.disqualified) return -1;

      let comparison = 0;

      if (sortByValue === 'rating') {
        if (a.overall_rating === null && b.overall_rating === null) comparison = 0;
        else if (a.overall_rating === null) return 1;
        else if (b.overall_rating === null) return -1;
        else comparison = a.overall_rating - b.overall_rating;
      } else if (sortByValue === 'price') {
        comparison = Number(a.price) - Number(b.price);
      } else if (sortByValue === 'title') {
        comparison = a.title.localeCompare(b.title);
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  });

  toggleSortDirection() {
    this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
  }

  setSortBy(field: string) {
    if (this.sortBy() === field) {
      this.toggleSortDirection();
    } else {
      this.sortBy.set(field as 'rating' | 'price' | 'title');
      this.sortDirection.set(field === 'title' ? 'asc' : 'desc');
    }
    this.currentPage.set(1);
  }

  setFilterState(value: string): void {
    this.filterState.set(value);
    this.currentPage.set(1);
  }

  setFilterSource(value: string): void {
    this.filterSource.set(value);
    this.currentPage.set(1);
  }

  setFilterHasGarden(value: boolean | null): void {
    this.filterHasGarden.set(value);
    this.currentPage.set(1);
  }

  setFilterDisqualified(value: 'all' | 'hide' | 'only'): void {
    this.filterDisqualified.set(value);
    this.currentPage.set(1);
  }

  onTitleSearchInput(value: string): void {
    this.titleSearchSubject.next(value);
  }

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  clearFilters(): void {
    this.filterState.set('');
    this.filterSource.set('');
    this.filterHasGarden.set(null);
    this.filterDisqualified.set('all');
    this.titleSearchSubject.next('');
    this.titleSearchDebounced.set('');
    this.currentPage.set(1);
  }

  enrichingSelected = signal(false);
  disqualifyingSelected = signal(false);

  enrichSelected(): void {
    const listData = this.list();
    if (!listData) return;
    const uuids = Array.from(this.selectedPropertyUuids());
    if (!uuids.length) return;

    this.enrichingSelected.set(true);
    this.propertyListService.enrichProperties(listData.uuid, { property_uuids: uuids }).subscribe({
      next: () => {
        this.notificationService.success(
          `Enriching ${uuids.length} ${uuids.length === 1 ? 'property' : 'properties'}...`
        );
        this.clearSelection();
        this.selectionMode.set(false);
        this.enrichingSelected.set(false);
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to start enrichment');
        this.enrichingSelected.set(false);
      },
    });
  }

  bulkDisqualify(): void {
    const count = this.selectedCount();
    if (count === 0) return;

    const confirmMessage = `Disqualify ${count} ${count === 1 ? 'property' : 'properties'}?`;
    if (!confirm(confirmMessage)) return;

    const uuids = Array.from(this.selectedPropertyUuids());
    this.disqualifyingSelected.set(true);
    this.propertyService.bulkDisqualify(uuids, 'Manually disqualified').subscribe({
      next: (result) => {
        this.notificationService.success(
          `${result.updated} ${result.updated === 1 ? 'property' : 'properties'} disqualified`
        );
        this.clearSelection();
        this.selectionMode.set(false);
        this.disqualifyingSelected.set(false);
        const listUuid = this.list()?.uuid;
        if (listUuid) this.loadList(listUuid);
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to disqualify properties');
        this.disqualifyingSelected.set(false);
      },
    });
  }

  triggerStage2ForList() {
    const listData = this.list();
    if (!listData || !listData.project) return;

    const project = this.projectStore.selectedDetail();
    if (!project) {
      this.error.set('Project not found');
      return;
    }

    if (!project.context_options) {
      this.showContextOptionsModal.set(true);
    } else {
      this.executeStage2ForList();
    }
  }

  executeStage2ForList() {
    const listData = this.list();
    if (!listData) return;

    const propertiesToProcess = listData.properties.filter(
      (p) => p.state === 'NEW' && !p.disqualified
    );

    if (propertiesToProcess.length === 0) {
      this.notificationService.error('No new properties to process');
      return;
    }

    this.subscribeToListEvents(listData.uuid, propertiesToProcess.length, () => {
      from(propertiesToProcess)
        .pipe(
          mergeMap((property) =>
            this.contextDataService.triggerStage2(property.uuid).pipe(
              catchError(() => {
                this.notificationService.error(
                  `Failed to start context retrieval for ${property.address_line_1 || property.uuid}`
                );
                return EMPTY;
              })
            )
          )
        )
        .subscribe();
    });
  }

  runningStage3ForList = signal(false);

  runStage3ForList(): void {
    const listData = this.list();
    if (!listData) return;

    const eligibleProperties = listData.properties.filter(
      (p) => (p.state === 'STAGE2_COMPLETE' || p.state === 'STAGE3_COMPLETE') && !p.disqualified
    );

    if (eligibleProperties.length === 0) {
      this.notificationService.error('No rated or context-complete properties to run rating on');
      return;
    }

    this.runningStage3ForList.set(true);

    from(eligibleProperties)
      .pipe(
        mergeMap((property) =>
          this.propertyService.runStage3(property.uuid).pipe(
            catchError(() => {
              this.notificationService.error(
                `Failed to start rating for ${property.address_line_1 || property.uuid}`
              );
              return EMPTY;
            })
          )
        )
      )
      .subscribe({
        complete: () => {
          this.notificationService.success(
            `Rating started for ${eligibleProperties.length} ${eligibleProperties.length === 1 ? 'property' : 'properties'}`
          );
          this.runningStage3ForList.set(false);
        },
      });
  }

  onContextOptionsSaved() {
    this.showContextOptionsModal.set(false);
    const listData = this.list();
    if (listData?.project) {
      this.projectStore.loadDetail(listData.project);
      setTimeout(() => {
        this.executeStage2ForList();
      }, 500);
    }
  }

  onContextOptionsCancel() {
    this.showContextOptionsModal.set(false);
  }

  toggleDropdown() {
    this.showDropdown.update((show) => !show);
  }

  closeDropdown() {
    this.showDropdown.set(false);
  }

  onFavoriteToggle(propertyUuid: string): void {
    const listData = this.list();
    if (!listData) return;

    const property = listData.properties.find((p) => p.uuid === propertyUuid);
    if (!property) return;

    const wasFavorited = property.is_favorited;
    property.is_favorited = !wasFavorited;

    const action = wasFavorited
      ? this.favoritesService.removeFavorite(propertyUuid)
      : this.favoritesService.addFavorite(propertyUuid);

    action.subscribe({
      next: () => {
        this.notificationService.success(
          wasFavorited ? 'Removed from favorites' : 'Added to favorites'
        );
      },
      error: () => {
        property.is_favorited = wasFavorited;
        this.notificationService.error('Failed to update favorite');
      },
    });
  }
}
