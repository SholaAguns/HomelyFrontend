import { Component, inject, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Property } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-preview-card.html',
  styleUrl: './property-preview-card.css',
})
export class PropertyPreviewCard {
  private router = inject(Router);

  property = input.required<Property>();
  selectable = input<boolean>(false);
  selected = input<boolean>(false);
  showFavoriteToggle = input<boolean>(false);
  selectionChange = output<void>();
  favoriteToggle = output<string>();

  viewDetails(): void {
    if (!this.selectable()) {
      this.router.navigate(['/properties', this.property().uuid]);
    }
  }

  onCheckboxChange(event: Event): void {
    event.stopPropagation();
    this.selectionChange.emit();
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoriteToggle.emit(this.property().uuid);
  }
}
