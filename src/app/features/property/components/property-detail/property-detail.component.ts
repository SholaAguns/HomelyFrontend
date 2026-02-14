import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertyDetail } from '../../../../shared/models/property-models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);
  private notificationService = inject(NotificationService);

  property = signal<PropertyDetail | null>(null);
  loading = signal(true);

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
}
