import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { SavedLocationFormComponent } from '../../components/saved-location-form/saved-location-form.component';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { CreateSavedLocationDto } from '../../../../shared/models/saved-location-models';

@Component({
  selector: 'app-saved-location-create',
  standalone: true,
  imports: [CommonModule, SavedLocationFormComponent],
  templateUrl: './saved-location-create.component.html',
  styleUrl: './saved-location-create.component.css',
})
export class SavedLocationCreateComponent {
  private savedLocationService = inject(SavedLocationService);
  private router = inject(Router);

  error = signal<string | null>(null);

  onFormSubmit(data: CreateSavedLocationDto) {
    this.error.set(null);

    this.savedLocationService.create(data).subscribe({
      next: () => {
        this.router.navigate(['/saved-locations']);
      },
      error: (err) => {
        this.error.set('Failed to create location. Please try again.');
        console.error('Error creating location:', err);
      },
    });
  }

  onFormCancel() {
    this.router.navigate(['/saved-locations']);
  }
}
