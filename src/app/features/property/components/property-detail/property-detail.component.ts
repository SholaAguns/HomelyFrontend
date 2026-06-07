import { Component, inject, OnInit, OnDestroy, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription, TimeoutError, timeout, catchError, EMPTY } from 'rxjs';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../store/property.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertySseService } from '../../../../core/services/property-sse-service/property-sse.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { PropertyDetail, PropertyState } from '../../../../shared/models/property-models';
import { RatingCompleteData } from '../../../../shared/models/context-data.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ImageGalleryComponent } from '../../../../shared/components/image-gallery/image-gallery.component';
import { ContextReportsComponent } from '../../../context/components/context-reports/context-reports.component';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';
import { ProjectRole } from '../../../../shared/models/auth-models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ImageGalleryComponent,
    ContextReportsComponent,
  ],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private propertyStore = inject(PropertyStore);
  private notificationService = inject(NotificationService);
  private propertySseService = inject(PropertySseService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private propertyListService = inject(PropertyListService);

  property = signal<PropertyDetail | null>(null);
  loading = signal(true);
  galleryOpen = signal(false);
  galleryInitialIndex = signal(0);
  userRole = signal<ProjectRole>(null);
  projectUuid = signal<string>('');
  private wsSubscription?: Subscription;

  canEdit = computed(() => {
    const pUuid = this.projectUuid();
    if (!pUuid) return false;
    return this.authService.canEdit(pUuid, this.userRole());
  });

  canEnrich = computed(() => {
    const p = this.property();
    if (!p?.external_url || p.is_enriched) return false;
    return p.external_url.includes('zoopla') || p.external_url.includes('rightmove');
  });

  propertySource = computed((): 'Rightmove' | 'Zoopla' | null => {
    const externalUrl = this.property()?.external_url;
    if (!externalUrl) return null;
    if (externalUrl.includes('rightmove')) return 'Rightmove';
    if (externalUrl.includes('zoopla')) return 'Zoopla';
    return null;
  });

  enriching = signal(false);
  disqualifying = signal(false);
  showDisqualifyInput = signal(false);
  disqualifyReason = signal('');

  displayedImages = computed(() => {
    const propertyData = this.property();
    if (!propertyData?.images || propertyData.images.length <= 1) return [];

    // Get images excluding primary, then take first 3
    const otherImages = propertyData.images.filter(
      (img) => img.id !== propertyData.primary_image?.id
    );
    return otherImages.slice(0, 3);
  });

  hasMoreImages = computed(() => {
    const propertyData = this.property();
    if (!propertyData?.images) return false;
    return propertyData.images.length > 4;
  });

  sortedRatingBreakdown = computed(() => {
    const breakdown = this.property()?.rating_breakdown;
    if (!breakdown) return [];
    return Object.entries(breakdown).sort(([, a], [, b]) => b.weighted_score - a.weighted_score);
  });

  private readonly stateRank: Record<string, number> = {
    NEW: 0,
    STAGE2_IN_PROGRESS: 1,
    STAGE2_COMPLETE: 2,
    STAGE3_IN_PROGRESS: 3,
    STAGE3_COMPLETE: 4,
  };

  constructor() {
    effect(() => {
      const localProperty = this.property();
      if (!localProperty) return;
      const storeEntity = this.propertyStore.entities()[localProperty.uuid];
      if (!storeEntity || storeEntity.state === localProperty.state) return;
      const storeRank = this.stateRank[storeEntity.state] ?? -1;
      const localRank = this.stateRank[localProperty.state] ?? -1;
      if (storeRank > localRank) {
        this.property.update((current) =>
          current ? { ...current, state: storeEntity.state } : null
        );
      }
    });
  }

  ngOnInit(): void {
    this.authService.getCurrentUser().subscribe();

    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadProperty(uuid);
    } else {
      this.notificationService.error('No property UUID provided');
      this.loading.set(false);
    }
  }

  loadProperty(uuid: string): void {
    this.loading.set(true);

    this.propertyService.getByUuid(uuid).subscribe({
      next: (property) => {
        this.property.set(property);
        this.propertyStore.addProperty(property);
        this.loading.set(false);

        // Get project_uuid from one of the property lists
        const propertyListUuids = Object.keys(property.property_lists);
        if (propertyListUuids.length > 0) {
          this.propertyListService.getByUuid(propertyListUuids[0]).subscribe({
            next: (list) => {
              this.projectUuid.set(list.project);
              this.authService.getUserRole(list.project).subscribe({
                next: (role) => this.userRole.set(role.role),
                error: () => {},
              });
            },
            error: () => {},
          });
        }
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to load property');
        this.loading.set(false);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/lists']);
  }

  runStage2(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.propertySseService
      .connectToProperty(propertyValue.uuid)
      .pipe(
        timeout(5 * 60 * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.notificationService.error('Stage 2 timed out. Please try again.');
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'connected') {
            this.propertyService.runStage2(propertyValue.uuid).subscribe({
              next: () => this.notificationService.success('Stage 2 started successfully'),
              error: (err) => {
                this.notificationService.error(err.message || 'Failed to run stage 2');
                this.wsSubscription?.unsubscribe();
              },
            });
            return;
          }

          if (event.type === 'stage2_complete') {
            this.propertyStore.updatePropertyState(propertyValue.uuid, 'STAGE2_COMPLETE');
            this.property.update((current) =>
              current ? { ...current, state: 'STAGE2_COMPLETE' } : null
            );
            this.notificationService.success('Context retrieval complete!');
            this.wsSubscription?.unsubscribe();
          }
        },
        error: () => {},
      });
  }

  runStage3(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    this.wsSubscription?.unsubscribe();

    this.wsSubscription = this.propertySseService
      .connectToProperty(propertyValue.uuid)
      .pipe(
        timeout(5 * 60 * 1000),
        catchError((err) => {
          if (err instanceof TimeoutError) {
            this.notificationService.error('Rating timed out. Please try again.');
          }
          return EMPTY;
        })
      )
      .subscribe({
        next: (event) => {
          if (event.type === 'connected') {
            this.propertyService.runStage3(propertyValue.uuid).subscribe({
              next: () => {
                this.property.update((current) =>
                  current ? { ...current, state: 'STAGE3_IN_PROGRESS' } : null
                );
              },
              error: (err) => {
                this.notificationService.error(err.message || 'Failed to run stage 3');
                this.wsSubscription?.unsubscribe();
              },
            });
            return;
          }

          if (event.type === 'rating_complete' && event.data) {
            const ratingData = event.data as RatingCompleteData;
            this.property.update((current) =>
              current
                ? {
                    ...current,
                    state: (ratingData.property_state || 'STAGE3_COMPLETE') as PropertyState,
                    overall_rating: ratingData.overall_rating,
                    rating_breakdown: ratingData.rating_breakdown,
                    disqualified: ratingData.disqualified,
                    disqualification_reason: ratingData.disqualification_reason,
                  }
                : null
            );
            this.propertyStore.updatePropertyState(
              propertyValue.uuid,
              ratingData.property_state || 'STAGE3_COMPLETE'
            );
            this.notificationService.success('Rating calculation complete!');
            this.wsSubscription?.unsubscribe();
          }

          if (event.type === 'rating_failed') {
            this.notificationService.error(
              event.data?.error || 'Rating calculation failed. Please try again.'
            );
            this.wsSubscription?.unsubscribe();
          }
        },
        error: () => {},
      });
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
  }

  openGallery(index: number = 0): void {
    this.galleryInitialIndex.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
  }

  enrichProperty(): void {
    const p = this.property();
    if (!p) return;
    this.enriching.set(true);
    this.propertyService
      .enrich(p.uuid)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.message || 'Failed to fetch full details');
          this.enriching.set(false);
          return EMPTY;
        })
      )
      .subscribe((res) => {
        this.property.set(res.property);
        this.propertyStore.upsertOne(res.property);
        this.notificationService.success('Property details updated');
        this.enriching.set(false);
      });
  }

  disqualify(): void {
    const p = this.property();
    if (!p) return;
    const reason = this.disqualifyReason() || 'Manually disqualified';
    this.disqualifying.set(true);
    this.propertyService
      .disqualify(p.uuid, reason)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.message || 'Failed to disqualify property');
          this.disqualifying.set(false);
          return EMPTY;
        })
      )
      .subscribe((updatedProperty) => {
        this.property.update((current) =>
          current ? { ...current, disqualified: true, disqualification_reason: reason } : null
        );
        this.propertyStore.upsertOne(updatedProperty);
        this.showDisqualifyInput.set(false);
        this.disqualifyReason.set('');
        this.disqualifying.set(false);
        this.notificationService.success('Property disqualified');
      });
  }

  undisqualify(): void {
    const p = this.property();
    if (!p) return;
    this.disqualifying.set(true);
    this.propertyService
      .undisqualify(p.uuid)
      .pipe(
        catchError((err) => {
          this.notificationService.error(err.message || 'Failed to undo disqualification');
          this.disqualifying.set(false);
          return EMPTY;
        })
      )
      .subscribe((updatedProperty) => {
        this.property.update((current) =>
          current ? { ...current, disqualified: false, disqualification_reason: null } : null
        );
        this.propertyStore.upsertOne(updatedProperty);
        this.disqualifying.set(false);
        this.notificationService.success('Disqualification removed');
      });
  }

  toggleFavorite(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    const wasFavorited = propertyValue.is_favorited;
    propertyValue.is_favorited = !wasFavorited;

    const action = wasFavorited
      ? this.favoritesService.removeFavorite(propertyValue.uuid)
      : this.favoritesService.addFavorite(propertyValue.uuid);

    action.subscribe({
      next: () => {
        this.notificationService.success(
          wasFavorited ? 'Removed from favorites' : 'Added to favorites'
        );
      },
      error: () => {
        propertyValue.is_favorited = wasFavorited;
        this.notificationService.error('Failed to update favorite');
      },
    });
  }
}
