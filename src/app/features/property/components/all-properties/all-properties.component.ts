import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertyPreviewCard } from '../../../property-lists/components/property-preview-card/property-preview-card';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { Property } from '../../../../shared/models/property-models';
import { Subject, Subscription, debounceTime } from 'rxjs';

@Component({
  selector: 'app-all-properties',
  standalone: true,
  imports: [CommonModule, PropertyPreviewCard, LoadingSpinnerComponent],
  templateUrl: './all-properties.component.html',
})
export class AllPropertiesComponent implements OnInit, OnDestroy {
  private propertyService = inject(PropertyService);
  private favoritesService = inject(FavoritesService);
  private notificationService = inject(NotificationService);

  private titleSearchSubject = new Subject<string>();
  private titleSearchSubscription?: Subscription;

  properties = signal<Property[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  currentPage = signal(1);
  readonly itemsPerPage = 20;

  showFilters = signal(false);
  filterStates = signal<Set<string>>(new Set());
  filterSource = signal<string>('');
  filterHasGarden = signal<boolean | null>(null);
  filterDisqualified = signal<'all' | 'hide' | 'only'>('all');
  filterFavouritesOnly = signal<boolean>(false);
  filterShortlisted = signal<'all' | 'only' | 'exclude'>('all');
  filterPriceMin = signal<number | null>(null);
  filterPriceMax = signal<number | null>(null);
  filterBedroomsMin = signal<number | null>(null);
  filterBedroomsMax = signal<number | null>(null);
  filterBathroomsMin = signal<number | null>(null);
  filterBathroomsMax = signal<number | null>(null);
  filterLetAvailableFrom = signal<string | null>(null);
  filterLetAvailableTo = signal<string | null>(null);
  titleSearchDebounced = signal<string>('');

  sortBy = signal<'rating' | 'price' | 'title' | 'criterion'>('rating');
  sortDirection = signal<'asc' | 'desc'>('desc');
  sortByCriterion = signal<string | null>(null);

  protected readonly Math = Math;

  activeFilterCount = computed(() => {
    let count = 0;
    if (this.filterStates().size > 0) count++;
    if (this.filterSource()) count++;
    if (this.filterHasGarden() !== null) count++;
    if (this.filterDisqualified() !== 'all') count++;
    if (this.titleSearchDebounced()) count++;
    if (this.filterFavouritesOnly()) count++;
    if (this.filterShortlisted() !== 'all') count++;
    if (this.filterPriceMin() !== null || this.filterPriceMax() !== null) count++;
    if (this.filterBedroomsMin() !== null || this.filterBedroomsMax() !== null) count++;
    if (this.filterBathroomsMin() !== null || this.filterBathroomsMax() !== null) count++;
    if (this.filterLetAvailableFrom() || this.filterLetAvailableTo()) count++;
    return count;
  });

  availableCriteria = computed(() => {
    const criterionKeys = new Set<string>();
    for (const p of this.properties()) {
      if (p.rating_breakdown) {
        Object.keys(p.rating_breakdown).forEach((k) => criterionKeys.add(k));
      }
    }
    return Array.from(criterionKeys).sort();
  });

  sortedProperties = computed(() => {
    const stateFilterSet = this.filterStates();
    const sourceFilter = this.filterSource();
    const gardenFilter = this.filterHasGarden();
    const disqualifiedFilter = this.filterDisqualified();
    const titleSearch = this.titleSearchDebounced().toLowerCase().trim();
    const favouritesOnly = this.filterFavouritesOnly();
    const shortlistedFilter = this.filterShortlisted();
    const priceMin = this.filterPriceMin();
    const priceMax = this.filterPriceMax();
    const bedroomsMin = this.filterBedroomsMin();
    const bedroomsMax = this.filterBedroomsMax();
    const bathroomsMin = this.filterBathroomsMin();
    const bathroomsMax = this.filterBathroomsMax();
    const letAvailableFrom = this.filterLetAvailableFrom();
    const letAvailableTo = this.filterLetAvailableTo();

    const filtered = this.properties().filter((p) => {
      if (stateFilterSet.size > 0 && !stateFilterSet.has(p.state)) return false;
      if (favouritesOnly && !p.is_favorited) return false;
      if (shortlistedFilter === 'only' && !p.shortlisted_in_lists?.length) return false;
      if (shortlistedFilter === 'exclude' && p.shortlisted_in_lists?.length) return false;
      if (priceMin !== null && Number(p.price) < priceMin) return false;
      if (priceMax !== null && Number(p.price) > priceMax) return false;
      if (bedroomsMin !== null && p.bedrooms < bedroomsMin) return false;
      if (bedroomsMax !== null && p.bedrooms > bedroomsMax) return false;
      if (bathroomsMin !== null && p.bathrooms < bathroomsMin) return false;
      if (bathroomsMax !== null && p.bathrooms > bathroomsMax) return false;
      if (letAvailableFrom && p.let_available_date && p.let_available_date < letAvailableFrom)
        return false;
      if (letAvailableTo && p.let_available_date && p.let_available_date > letAvailableTo)
        return false;
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
    const criterionKey = this.sortByCriterion();

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
      } else if (sortByValue === 'criterion' && criterionKey) {
        const aScore = a.rating_breakdown?.[criterionKey]?.weighted_score ?? -Infinity;
        const bScore = b.rating_breakdown?.[criterionKey]?.weighted_score ?? -Infinity;
        comparison = aScore - bScore;
      }

      return direction === 'desc' ? -comparison : comparison;
    });
  });

  paginatedProperties = computed(() => {
    const sorted = this.sortedProperties();
    const startIndex = (this.currentPage() - 1) * this.itemsPerPage;
    return sorted.slice(startIndex, startIndex + this.itemsPerPage);
  });

  totalPages = computed(() => Math.ceil(this.sortedProperties().length / this.itemsPerPage));

  ngOnInit(): void {
    this.titleSearchSubscription = this.titleSearchSubject
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.titleSearchDebounced.set(value);
        this.currentPage.set(1);
      });

    this.loadProperties();
  }

  ngOnDestroy(): void {
    this.titleSearchSubscription?.unsubscribe();
  }

  loadProperties(): void {
    this.loading.set(true);
    this.error.set(null);
    this.propertyService.getAll().subscribe({
      next: (properties) => {
        this.properties.set(properties);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  onFavoriteToggle(propertyUuid: string): void {
    const property = this.properties().find((p) => p.uuid === propertyUuid);
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

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  clearFilters(): void {
    this.filterStates.set(new Set());
    this.filterSource.set('');
    this.filterHasGarden.set(null);
    this.filterDisqualified.set('all');
    this.filterFavouritesOnly.set(false);
    this.filterShortlisted.set('all');
    this.filterPriceMin.set(null);
    this.filterPriceMax.set(null);
    this.filterBedroomsMin.set(null);
    this.filterBedroomsMax.set(null);
    this.filterBathroomsMin.set(null);
    this.filterBathroomsMax.set(null);
    this.filterLetAvailableFrom.set(null);
    this.filterLetAvailableTo.set(null);
    this.titleSearchSubject.next('');
    this.titleSearchDebounced.set('');
    this.currentPage.set(1);
  }

  toggleFilterState(stateValue: string): void {
    this.filterStates.update((current) => {
      const next = new Set(current);
      if (next.has(stateValue)) {
        next.delete(stateValue);
      } else {
        next.add(stateValue);
      }
      return next;
    });
    this.currentPage.set(1);
  }

  setFilterFavouritesOnly(value: boolean): void {
    this.filterFavouritesOnly.set(value);
    this.currentPage.set(1);
  }

  setFilterShortlisted(value: 'all' | 'only' | 'exclude'): void {
    this.filterShortlisted.set(value);
    this.currentPage.set(1);
  }

  setFilterBedroomsMin(value: string): void {
    this.filterBedroomsMin.set(value ? Number(value) : null);
    this.currentPage.set(1);
  }

  setFilterBedroomsMax(value: string): void {
    this.filterBedroomsMax.set(value ? Number(value) : null);
    this.currentPage.set(1);
  }

  setFilterBathroomsMin(value: string): void {
    this.filterBathroomsMin.set(value ? Number(value) : null);
    this.currentPage.set(1);
  }

  setFilterBathroomsMax(value: string): void {
    this.filterBathroomsMax.set(value ? Number(value) : null);
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

  setFilterPriceMin(value: string): void {
    this.filterPriceMin.set(value ? Number(value) : null);
    this.currentPage.set(1);
  }

  setFilterPriceMax(value: string): void {
    this.filterPriceMax.set(value ? Number(value) : null);
    this.currentPage.set(1);
  }

  setFilterLetAvailableFrom(value: string): void {
    this.filterLetAvailableFrom.set(value || null);
    this.currentPage.set(1);
  }

  setFilterLetAvailableTo(value: string): void {
    this.filterLetAvailableTo.set(value || null);
    this.currentPage.set(1);
  }

  onTitleSearchInput(value: string): void {
    this.titleSearchSubject.next(value);
  }

  setSortBy(field: string): void {
    if (field === 'criterion') {
      this.sortBy.set('criterion');
      if (!this.sortByCriterion() && this.availableCriteria().length > 0) {
        this.sortByCriterion.set(this.availableCriteria()[0]);
      }
      this.sortDirection.set('desc');
      this.currentPage.set(1);
      return;
    }
    if (this.sortBy() === field) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortBy.set(field as 'rating' | 'price' | 'title');
      this.sortDirection.set(field === 'title' ? 'asc' : 'desc');
    }
    this.currentPage.set(1);
  }

  setSortByCriterion(criterionKey: string): void {
    this.sortByCriterion.set(criterionKey);
    this.sortBy.set('criterion');
    this.sortDirection.set('desc');
    this.currentPage.set(1);
  }
}
