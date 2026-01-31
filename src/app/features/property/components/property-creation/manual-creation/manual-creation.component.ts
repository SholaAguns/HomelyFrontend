import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PropertyService } from '../../../../../core/services/property-service/property.service';
import { PropertyFormComponent } from '../../property-form/property-form.component';
import { CreatePropertyDto } from '../../../../../shared/models/property-models';

@Component({
  selector: 'app-manual-creation',
  standalone: true,
  imports: [CommonModule, PropertyFormComponent],
  templateUrl: './manual-creation.component.html',
  styleUrl: './manual-creation.component.css',
})
export class ManualCreationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private propertyService = inject(PropertyService);

  propertyListUuid = signal<string>('');
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const uuid = this.route.parent?.parent?.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.propertyListUuid.set(uuid);
    }
  }

  onFormSubmit(propertyData: CreatePropertyDto) {
    this.loading.set(true);
    this.error.set(null);

    this.propertyService.create(propertyData).subscribe({
      next: (property) => {
        this.loading.set(false);
        // Navigate back to property list
        this.router.navigate(['/lists', this.propertyListUuid()]);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err.message || 'Failed to create property');
      },
    });
  }

  onFormCancel() {
    this.router.navigate(['/lists', this.propertyListUuid()]);
  }
}
