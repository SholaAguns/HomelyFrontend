import { Component, inject, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../store/property.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertyWebSocketService } from '../../../../core/services/property-websocket-service/property-websocket.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { PropertyDetail } from '../../../../shared/models/property-models';
import { RatingCompleteData } from '../../../../shared/models/context-data.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ImageGalleryComponent } from '../../../../shared/components/image-gallery/image-gallery.component';
import { ContextReportsComponent } from '../../../context/components/context-reports/context-reports.component';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';

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
  private propertyWebSocketService = inject(PropertyWebSocketService);
  private favoritesService = inject(FavoritesService);
  private authService = inject(AuthService);
  private propertyListService = inject(PropertyListService);

  property = signal<PropertyDetail | null>(null);
  loading = signal(true);
  galleryOpen = signal(false);
  galleryInitialIndex = signal(0);
  userRole = signal<'owner' | 'contributor' | 'viewer' | null>(null);
  projectUuid = signal<string>('');
  private wsSubscription?: Subscription;

  canEdit = computed(() => {
    const pUuid = this.projectUuid();
    if (!pUuid) return false;
    return this.authService.canEdit(pUuid, this.userRole());
  });

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
                next: (role) => this.userRole.set(role),
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

    this.propertyService.runStage2(propertyValue.uuid).subscribe({
      next: () => {
        this.notificationService.success('Stage 2 started successfully');
        this.loadProperty(propertyValue.uuid);
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to run stage 2');
      },
    });
  }

  runStage3(): void {
    const propertyValue = this.property();
    if (!propertyValue) return;

    // Subscribe to WebSocket FIRST, then trigger Stage 3
    this.subscribeToRatingUpdates(propertyValue.uuid, () => {
      console.log('🚀 TRIGGERING STAGE 3 (Rating Calculation)');
      this.propertyService.runStage3(propertyValue.uuid).subscribe({
        next: () => {
          this.notificationService.success('Stage 3 started successfully');
        },
        error: (err) => {
          this.notificationService.error(err.message || 'Failed to run stage 3');
          this.wsSubscription?.unsubscribe();
          this.propertyWebSocketService.disconnect();
        },
      });
    });
  }

  private subscribeToRatingUpdates(propertyId: string, onConnected?: () => void): void {
    this.wsSubscription?.unsubscribe();

    console.log('🔌 WEBSOCKET: Connecting to property channel for rating updates...', propertyId);

    this.wsSubscription = this.propertyWebSocketService.connectToProperty(propertyId).subscribe({
      next: (update) => {
        console.log('📨 WEBSOCKET UPDATE RECEIVED:', update.type, update);

        if (update.type === 'rating_complete') {
          console.log('🎉 RATING COMPLETE - Updating property with rating data');

          // Update property with rating data from WebSocket message
          const currentProperty = this.property();
          if (currentProperty && update.data) {
            const ratingData = update.data as RatingCompleteData;
            const updatedProperty = {
              ...currentProperty,
              state: ratingData.property_state || 'STAGE3_COMPLETE',
              overall_rating: ratingData.overall_rating,
              rating_breakdown: ratingData.rating_breakdown,
              disqualified: ratingData.disqualified,
              disqualification_reason: ratingData.disqualification_reason,
            } as PropertyDetail;

            this.property.set(updatedProperty);
            this.propertyStore.updatePropertyState(
              propertyId,
              ratingData.property_state || 'STAGE3_COMPLETE'
            );
          }

          this.notificationService.success('Rating calculation complete!');

          // Disconnect after a short delay
          setTimeout(() => {
            console.log('🔌 CLOSING WEBSOCKET CONNECTION (Rating complete)');
            this.wsSubscription?.unsubscribe();
            this.propertyWebSocketService.disconnect();
          }, 1000);
        }
      },
      error: (err) => {
        console.error('❌ WEBSOCKET ERROR:', err);
      },
      complete: () => {
        console.log('🔌 WEBSOCKET CONNECTION CLOSED');
      },
    });

    // Call the callback after a short delay to ensure connection is established
    if (onConnected) {
      setTimeout(() => {
        console.log('🔌 WEBSOCKET: Connection ready, calling callback');
        onConnected();
      }, 200);
    }
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.propertyWebSocketService.disconnect();
  }

  openGallery(index: number = 0): void {
    this.galleryInitialIndex.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
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
