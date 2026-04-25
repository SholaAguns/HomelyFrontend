import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStore } from '../../store/project.store';
import { PropertyListStore } from '../../../property-lists/store/property-list.store';
import { ProjectStatsPanelComponent } from '../project-stats-panel/project-stats-panel.component';
import { PropertyListCardComponent } from '../../../property-lists/components/property-list-card/property-list-card.component';
import { PropertyPreviewCard } from '../../../property-lists/components/property-preview-card/property-preview-card';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { Property } from '../../../../shared/models/property-models';
import { ProjectRole } from '../../../../shared/models/auth-models';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProjectStatsPanelComponent,
    PropertyListCardComponent,
    PropertyPreviewCard,
  ],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  private favoritesService = inject(FavoritesService);
  private notificationService = inject(NotificationService);
  readonly projectStore = inject(ProjectStore);
  readonly listStore = inject(PropertyListStore);

  projectUuid = '';
  loading = signal(false);
  error = signal<string | null>(null);
  userRole = signal<ProjectRole>(null);
  projectFavorites = signal<Property[]>([]);
  favoritesExpanded = signal(false);

  canEdit = computed(() => this.authService.canEdit(this.projectUuid, this.userRole()));
  canView = computed(() => this.authService.canView(this.projectUuid, this.userRole()));
  favoritesCount = computed(() => this.projectFavorites().length);
  shouldExpandFavorites = computed(() => this.favoritesCount() < 6);

  ngOnInit() {
    this.projectUuid = this.route.snapshot.paramMap.get('uuid') || '';

    this.authService.getCurrentUser().subscribe();

    if (this.projectUuid) {
      this.loading.set(true);

      this.authService.getUserRole(this.projectUuid).subscribe({
        next: (roleResponse) => this.userRole.set(roleResponse.role),
        error: () => {},
      });

      this.projectStore.loadDetail(this.projectUuid);
      this.projectStore.loadStats(this.projectUuid);
      this.listStore.load(this.projectUuid);
      this.loadProjectFavorites();

      setTimeout(() => {
        this.loading.set(false);
      }, 1000);
    }
  }

  loadProjectFavorites(): void {
    this.favoritesService.getProjectFavorites(this.projectUuid).subscribe({
      next: (favorites) => {
        this.projectFavorites.set(favorites);
        this.favoritesExpanded.set(this.shouldExpandFavorites());
      },
      error: () => {
        this.projectFavorites.set([]);
      },
    });
  }

  toggleFavoritesSection(): void {
    this.favoritesExpanded.set(!this.favoritesExpanded());
  }

  onFavoriteToggle(propertyUuid: string): void {
    const property = this.projectFavorites().find((p) => p.uuid === propertyUuid);
    if (!property) return;

    const wasFavorited = property.is_favorited;
    property.is_favorited = !wasFavorited;

    const action = wasFavorited
      ? this.favoritesService.removeFavorite(propertyUuid)
      : this.favoritesService.addFavorite(propertyUuid);

    action.subscribe({
      next: () => {
        if (wasFavorited) {
          this.projectFavorites.set(this.projectFavorites().filter((p) => p.uuid !== propertyUuid));
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

  navigateToSettings() {
    this.router.navigate(['/projects', this.projectUuid, 'settings']);
  }

  navigateToCreateList() {
    this.router.navigate(['/projects', this.projectUuid, 'lists', 'new']);
  }

  navigateToDashboard() {
    this.router.navigate(['/projects', this.projectUuid, 'dashboard']);
  }
}
