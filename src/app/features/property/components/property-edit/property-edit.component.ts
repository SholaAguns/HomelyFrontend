import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { PropertyService } from '../../../../core/services/property-service/property.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertyDetail, UpdatePropertyDto } from '../../../../shared/models/property-models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-property-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, LoadingSpinnerComponent],
  templateUrl: './property-edit.component.html',
  styleUrl: './property-edit.component.css',
})
export class PropertyEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formBuilder = inject(FormBuilder);
  private propertyService = inject(PropertyService);
  private notificationService = inject(NotificationService);

  property = signal<PropertyDetail | null>(null);
  loading = signal(true);
  saving = signal(false);
  form!: FormGroup;

  readonly furnishedStatusOptions = [
    { value: 'FURNISHED', label: 'Furnished' },
    { value: 'UNFURNISHED', label: 'Unfurnished' },
    { value: 'PART_FURNISHED', label: 'Part Furnished' },
  ];
  readonly councilTaxBands = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  readonly epcRatings = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  ngOnInit(): void {
    const propertyUuid = this.route.snapshot.paramMap.get('uuid');
    if (propertyUuid) {
      this.loadProperty(propertyUuid);
    } else {
      this.notificationService.error('No property UUID provided');
      this.loading.set(false);
    }
  }

  private loadProperty(propertyUuid: string): void {
    this.propertyService.getByUuid(propertyUuid).subscribe({
      next: (propertyData) => {
        this.property.set(propertyData);
        this.initForm(propertyData);
        this.loading.set(false);
      },
      error: () => {
        this.notificationService.error('Failed to load property');
        this.loading.set(false);
      },
    });
  }

  private initForm(propertyData: PropertyDetail): void {
    this.form = this.formBuilder.group({
      summary: [propertyData.summary || ''],
      title: [propertyData.title, Validators.required],
      address_line_1: [propertyData.address_line_1, Validators.required],
      address_line_2: [propertyData.address_line_2 || ''],
      city: [propertyData.city || ''],
      postcode: [propertyData.postcode, Validators.required],
      price: [propertyData.price, [Validators.required, Validators.min(1)]],
      price_frequency: [propertyData.price_frequency || ''],
      description: [propertyData.description || ''],
      bedrooms: [propertyData.bedrooms, [Validators.required, Validators.min(0)]],
      bathrooms: [propertyData.bathrooms, [Validators.required, Validators.min(0)]],
      square_area: [propertyData.square_area],
      garden: [propertyData.garden],
      parking: [propertyData.parking],
      furnished_status: [propertyData.furnished_status || 'UNFURNISHED'],
      council_tax_band: [propertyData.council_tax_band || ''],
      epc_rating: [propertyData.epc_rating || ''],
      lease_length: [propertyData.lease_length],
      floor_level: [propertyData.floor_level],
      child_suitable: [propertyData.child_suitable],
      external_id: [propertyData.external_id || ''],
      external_url: [propertyData.external_url || ''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid || this.saving()) return;

    const propertyData = this.property();
    if (!propertyData) return;

    this.saving.set(true);
    const updateDto: UpdatePropertyDto = this.form.value;

    this.propertyService.update(propertyData.uuid, updateDto).subscribe({
      next: () => {
        this.notificationService.success('Property updated successfully');
        this.router.navigate(['/properties', propertyData.uuid]);
      },
      error: () => {
        this.notificationService.error('Failed to update property');
        this.saving.set(false);
      },
    });
  }

  onCancel(): void {
    const propertyData = this.property();
    if (propertyData) {
      this.router.navigate(['/properties', propertyData.uuid]);
    } else {
      this.router.navigate(['/lists']);
    }
  }
}
