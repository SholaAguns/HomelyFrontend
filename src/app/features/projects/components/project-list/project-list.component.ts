import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectStore } from '../../store/project.store';
import { ProjectCardComponent } from '../project-card/project-card.component';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './project-list.component.html',
  styleUrl: './project-list.component.css',
})
export class ProjectListComponent implements OnInit {
  private router = inject(Router);
  readonly store = inject(ProjectStore);

  ngOnInit() {
    this.store.load();
  }

  onDelete(uuid: string) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.store.delete(uuid);
    }
  }

  navigateToCreate() {
    this.router.navigate(['/projects/new']);
  }

  navigateToDetail(uuid: string) {
    this.router.navigate(['/projects', uuid]);
  }
}
