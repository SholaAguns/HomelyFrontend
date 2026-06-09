import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStore } from '../../store/project.store';
import { PropertyListStore } from '../../../property-lists/store/property-list.store';
import { ProjectStatsPanelComponent } from '../project-stats-panel/project-stats-panel.component';
import { PropertyListCardComponent } from '../../../property-lists/components/property-list-card/property-list-card.component';
import { PropertyPreviewCard } from '../../../property-lists/components/property-preview-card/property-preview-card';
import { TaskPanelComponent } from '../tasks/task-panel/task-panel.component';
import { CommentPanelComponent } from '../comments/comment-panel/comment-panel.component';
import { AuthService } from '../../../../core/services/auth-service/auth.service';
import { FavoritesService } from '../../../../core/services/favorites-service/favorites.service';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import { SharingService } from '../../../../core/services/sharing-service/sharing.service';
import { Property } from '../../../../shared/models/property-models';
import { ProjectRole } from '../../../../shared/models/auth-models';
import { exportToCsv } from '../../../../shared/utils/csv.util';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [
    CommonModule,
    ProjectStatsPanelComponent,
    PropertyListCardComponent,
    PropertyPreviewCard,
    TaskPanelComponent,
    CommentPanelComponent,
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
  private sharingService = inject(SharingService);
  readonly projectStore = inject(ProjectStore);
  readonly listStore = inject(PropertyListStore);

  projectUuid = '';
  loading = signal(false);
  error = signal<string | null>(null);
  userRole = signal<ProjectRole>(null);
  projectFavorites = signal<Property[]>([]);
  favoritesExpanded = signal(false);
  showActionsMenu = signal(false);
  showLeaveModal = signal(false);
  leavingProject = signal(false);

  canEdit = computed(() => this.authService.canEdit(this.projectUuid, this.userRole()));
  canView = computed(() => this.authService.canView(this.projectUuid, this.userRole()));
  isOwner = computed(() => this.authService.isOwner(this.projectUuid, this.userRole()));
  canLeave = computed(() => !this.isOwner() && this.userRole() !== null);
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

  exportFavouritesToCsv(): void {
    const projectTitle = this.projectStore.selectedDetail()?.title ?? 'project';
    const rows = this.projectFavorites().map((p) => ({
      title: p.title,
      overall_rating: p.overall_rating ?? '',
      price: p.price,
      bathrooms: p.bathrooms,
      bedrooms: p.bedrooms,
      address_line_1: p.address_line_1 ?? '',
      address_line_2: p.address_line_2 ?? '',
      city: p.city ?? '',
      postcode: p.postcode ?? '',
      council_tax_band: p.council_tax_band ?? '',
      external_url: p.external_url ?? '',
      garden: p.garden ?? '',
      parking: p.parking ?? '',
      summary: p.summary ?? '',
    }));
    exportToCsv(`favourites-${projectTitle}.csv`, rows);
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

  confirmLeaveProject(): void {
    this.leavingProject.set(true);
    this.sharingService.leaveProject(this.projectUuid).subscribe({
      next: () => {
        this.notificationService.success('You have left the project');
        this.router.navigate(['/projects']);
      },
      error: () => {
        this.notificationService.error('Failed to leave project');
        this.leavingProject.set(false);
        this.showLeaveModal.set(false);
      },
    });
  }
}
