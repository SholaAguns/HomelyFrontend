import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { PropertyDetail } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-detail.component.html',
  styleUrl: './property-detail.component.css',
})
export class PropertyDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  property: PropertyDetail | null = null;
  loading = true;
  error: string | null = null;

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadProperty(uuid);
    } else {
      this.error = 'No property UUID provided';
      this.loading = false;
    }
  }

  loadProperty(uuid: string): void {
    this.loading = true;
    this.error = null;

    this.propertyService.getByUuid(uuid).subscribe({
      next: (property) => {
        this.property = property;
        this.loading = false;
        console.log('Loaded okay');
      },
      error: (err) => {
        this.error = err.message || 'Failed to load property';
        this.loading = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/lists']);
  }

  runStage2(): void {
    if (!this.property) return;

    this.propertyService.runStage2(this.property.uuid).subscribe({
      next: () => {
        this.loadProperty(this.property!.uuid);
      },
      error: (err) => {
        this.error = err.message || 'Failed to run stage 2';
      },
    });
  }

  runStage3(): void {
    if (!this.property) return;

    this.propertyService.runStage3(this.property.uuid).subscribe({
      next: () => {
        this.loadProperty(this.property!.uuid);
      },
      error: (err) => {
        this.error = err.message || 'Failed to run stage 3';
      },
    });
  }
}
