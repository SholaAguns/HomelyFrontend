import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SavedLocationFormComponent } from '../../components/saved-location-form/saved-location-form.component';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import {
  SavedLocation,
  CreateSavedLocationDto,
} from '../../../../shared/models/saved-location-models';

@Component({
  selector: 'app-saved-location-edit',
  standalone: true,
  imports: [CommonModule, SavedLocationFormComponent],
  templateUrl: './saved-location-edit.component.html',
  styleUrl: './saved-location-edit.component.css',
})
export class SavedLocationEditComponent implements OnInit {
  private savedLocationService = inject(SavedLocationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  location = signal<SavedLocation | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadLocation(uuid);
    }
  }

  loadLocation(uuid: string) {
    this.loading.set(true);
    this.error.set(null);

    this.savedLocationService.getByUuid(uuid).subscribe({
      next: (location) => {
        this.location.set(location);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load location');
        this.loading.set(false);
        console.error('Error loading location:', err);
      },
    });
  }

  onFormSubmit(data: CreateSavedLocationDto) {
    const location = this.location();
    if (!location) return;

    this.error.set(null);

    this.savedLocationService.update(location.uuid, data).subscribe({
      next: () => {
        this.router.navigate(['/saved-locations']);
      },
      error: (err) => {
        this.error.set('Failed to update location. Please try again.');
        console.error('Error updating location:', err);
      },
    });
  }

  onFormCancel() {
    this.router.navigate(['/saved-locations']);
  }

  getInitialData(): Partial<CreateSavedLocationDto> | undefined {
    const loc = this.location();
    if (!loc) return undefined;

    return {
      name: loc.name,
      postcode: loc.postcode,
      address_line_1: loc.address_line_1,
      address_line_2: loc.address_line_2,
      city: loc.city,
    };
  }
}
