import { Component, computed, inject, input, output } from '@angular/core';
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
  currentListUuid = input<string | null>(null);
  selectionChange = output<void>();
  favoriteToggle = output<string>();

  isShortlisted = computed(() => {
    const listUuid = this.currentListUuid();
    if (!listUuid) return false;
    return this.property().shortlisted_in_lists?.includes(listUuid) ?? false;
  });

  propertySource = computed((): 'Rightmove' | 'Zoopla' | null => {
    const externalUrl = this.property().external_url;
    if (!externalUrl) return null;
    if (externalUrl.includes('rightmove')) return 'Rightmove';
    if (externalUrl.includes('zoopla')) return 'Zoopla';
    return null;
  });

  viewDetails(): void {
    if (!this.selectable()) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(['/properties', this.property().uuid])
      );
      window.open(url, '_blank');
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
