import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStore } from '../../store/project.store';
import { PropertyListStore } from '../../../property-lists/store/property-list.store';
import { ProjectStatsPanelComponent } from '../project-stats-panel/project-stats-panel.component';
import { PropertyListCardComponent } from '../../../property-lists/components/property-list-card/property-list-card.component';
import { AuthService } from '../../../../core/services/auth-service/auth.service';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, ProjectStatsPanelComponent, PropertyListCardComponent],
  templateUrl: './project-detail.component.html',
  styleUrl: './project-detail.component.css',
})
export class ProjectDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private authService = inject(AuthService);
  readonly projectStore = inject(ProjectStore);
  readonly listStore = inject(PropertyListStore);

  projectUuid = '';
  loading = signal(false);
  error = signal<string | null>(null);
  userRole = signal<'owner' | 'contributor' | 'viewer' | null>(null);

  canEdit = computed(() => this.authService.canEdit(this.projectUuid, this.userRole()));
  canView = computed(() => this.authService.canView(this.projectUuid, this.userRole()));

  ngOnInit() {
    this.projectUuid = this.route.snapshot.paramMap.get('uuid') || '';

    this.authService.getCurrentUser().subscribe();

    if (this.projectUuid) {
      this.loading.set(true);

      this.authService.getUserRole(this.projectUuid).subscribe({
        next: (role) => this.userRole.set(role),
        error: () => {},
      });

      this.projectStore.loadDetail(this.projectUuid);
      this.projectStore.loadStats(this.projectUuid);
      this.listStore.load(this.projectUuid);

      setTimeout(() => {
        this.loading.set(false);
      }, 1000);
    }
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
