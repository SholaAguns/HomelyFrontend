import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { SavedLocation } from '../../../../shared/models/saved-location-models';

@Component({
  selector: 'app-saved-location-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-location-list.component.html',
  styleUrl: './saved-location-list.component.css',
})
export class SavedLocationListComponent implements OnInit {
  private savedLocationService = inject(SavedLocationService);
  private router = inject(Router);

  locations = signal<SavedLocation[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deleteConfirmUuid = signal<string | null>(null);

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.loading.set(true);
    this.error.set(null);

    this.savedLocationService.getAll().subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load saved locations');
        this.loading.set(false);
        console.error('Error loading locations:', err);
      },
    });
  }

  onCreateNew() {
    this.router.navigate(['/saved-locations/new']);
  }

  onEdit(uuid: string) {
    this.router.navigate(['/saved-locations', uuid, 'edit']);
  }

  onDeleteClick(uuid: string) {
    this.deleteConfirmUuid.set(uuid);
  }

  onDeleteCancel() {
    this.deleteConfirmUuid.set(null);
  }

  onDeleteConfirm() {
    const uuid = this.deleteConfirmUuid();
    if (!uuid) return;

    this.savedLocationService.delete(uuid).subscribe({
      next: () => {
        this.locations.update((locs) => locs.filter((loc) => loc.uuid !== uuid));
        this.deleteConfirmUuid.set(null);
      },
      error: (err) => {
        this.error.set('Failed to delete location');
        console.error('Error deleting location:', err);
        this.deleteConfirmUuid.set(null);
      },
    });
  }

  getFullAddress(location: SavedLocation): string {
    const parts = [
      location.address_line_1,
      location.address_line_2,
      location.city,
      location.postcode,
    ].filter(Boolean);
    return parts.join(', ');
  }
}
