import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { PropertyPreviewCard } from '../../../property-lists/components/property-preview-card/property-preview-card';
import { Property } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, PropertyPreviewCard],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css',
})
export class FavoritesPageComponent implements OnInit {
  private favoritesService = inject(FavoritesService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);

  favorites = signal<Property[]>([]);
  loading = signal<boolean>(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading.set(true);
    this.error.set(null);

    this.favoritesService.getAllFavorites().subscribe({
      next: (favorites) => {
        this.favorites.set(favorites);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load favorites');
        this.loading.set(false);
        this.notificationService.error('Failed to load favorites');
      },
    });
  }

  onFavoriteToggle(propertyUuid: string): void {
    const property = this.favorites().find((p) => p.uuid === propertyUuid);
    if (!property) return;

    const wasFavorited = property.is_favorited;
    property.is_favorited = !wasFavorited;

    const action = wasFavorited
      ? this.favoritesService.removeFavorite(propertyUuid)
      : this.favoritesService.addFavorite(propertyUuid);

    action.subscribe({
      next: () => {
        if (wasFavorited) {
          // Remove from list when unfavorited
          this.favorites.set(this.favorites().filter((p) => p.uuid !== propertyUuid));
          this.notificationService.success('Removed from favorites');
        } else {
          this.notificationService.success('Added to favorites');
        }
      },
      error: () => {
        property.is_favorited = wasFavorited;
        this.notificationService.error('Failed to update favorite');
      },
    });
  }
}
