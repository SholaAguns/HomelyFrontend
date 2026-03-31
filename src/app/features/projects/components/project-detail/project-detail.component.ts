import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectStore } from '../../store/project.store';
import { PropertyListStore } from '../../../property-lists/store/property-list.store';
import { ProjectStatsPanelComponent } from '../project-stats-panel/project-stats-panel.component';
import { PropertyListCardComponent } from '../../../property-lists/components/property-list-card/property-list-card.component';

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
  readonly projectStore = inject(ProjectStore);
  readonly listStore = inject(PropertyListStore);

  projectUuid = '';
  loading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.projectUuid = this.route.snapshot.paramMap.get('uuid') || '';

    if (this.projectUuid) {
      this.loading.set(true);
      this.projectStore.loadDetail(this.projectUuid);
      this.projectStore.loadStats(this.projectUuid);
      this.listStore.load(this.projectUuid);

      setTimeout(() => {
        this.loading.set(false);
      }, 1000);
    }
  }

  onDeleteList(uuid: string) {
    if (confirm('Are you sure you want to delete this property list?')) {
      this.listStore.delete(uuid);
    }
  }

  onDeleteProject() {
    if (confirm('Are you sure you want to delete this project and all its property lists?')) {
      this.projectStore.delete(this.projectUuid);

      const checkDeletion = setInterval(() => {
        if (!this.projectStore.loading()) {
          clearInterval(checkDeletion);
          this.router.navigate(['/projects']);
        }
      }, 100);
    }
  }

  navigateToCreateList() {
    this.router.navigate(['/projects', this.projectUuid, 'lists', 'new']);
  }

  navigateToDashboard() {
    this.router.navigate(['/projects', this.projectUuid, 'dashboard']);
  }

  navigateToList(listUuid: string) {
    this.router.navigate(['/projects', this.projectUuid, 'lists', listUuid]);
  }
}
