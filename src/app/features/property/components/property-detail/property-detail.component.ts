import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { PropertyStore } from '../../store/property.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertyDetail } from '../../../../shared/models/property-models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ImageGalleryComponent } from '../../../../shared/components/image-gallery/image-gallery.component';
import { ContextReportsComponent } from '../../../context/components/context-reports/context-reports.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, ImageGalleryComponent, ContextReportsComponent],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private propertyStore = inject(PropertyStore);
  private notificationService = inject(NotificationService);

  property = signal<PropertyDetail | null>(null);
  loading = signal(true);
  galleryOpen = signal(false);
  galleryInitialIndex = signal(0);

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

    this.propertyService.runStage3(propertyValue.uuid).subscribe({
      next: () => {
        this.notificationService.success('Stage 3 started successfully');
        this.loadProperty(propertyValue.uuid);
      },
      error: (err) => {
        this.notificationService.error(err.message || 'Failed to run stage 3');
      },
    });
  }

  openGallery(index: number = 0): void {
    this.galleryInitialIndex.set(index);
    this.galleryOpen.set(true);
  }

  closeGallery(): void {
    this.galleryOpen.set(false);
  }
}
