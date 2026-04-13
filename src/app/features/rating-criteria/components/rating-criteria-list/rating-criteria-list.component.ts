import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RatingCriteriaService } from '../../../../core/services/rating-criteria.service';
import { RatingCriteria } from '../../../../shared/models/rating-criteria.models';

@Component({
  selector: 'app-rating-criteria-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating-criteria-list.component.html',
  styleUrl: './rating-criteria-list.component.css',
})
export class RatingCriteriaListComponent implements OnInit {
  private ratingCriteriaService = inject(RatingCriteriaService);
  private router = inject(Router);

  ratingCriteria = signal<RatingCriteria[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  deleteConfirmUuid = signal<string | null>(null);

  ngOnInit() {
    this.loadRatingCriteria();
  }

  loadRatingCriteria() {
    this.loading.set(true);
    this.error.set(null);

    this.ratingCriteriaService.getAll().subscribe({
      next: (criteria) => {
        this.ratingCriteria.set(criteria);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load rating criteria');
        this.loading.set(false);
        console.error('Error loading rating criteria:', err);
      },
    });
  }

  onCreateNew() {
    this.router.navigate(['/rating-criteria/new']);
  }

  onEdit(uuid: string) {
    this.router.navigate(['/rating-criteria', uuid, 'edit']);
  }

  onCopy(uuid: string) {
    this.ratingCriteriaService.copy(uuid).subscribe({
      next: (copiedCriteria) => {
        this.ratingCriteria.update((criteria) => [...criteria, copiedCriteria]);
      },
      error: (err) => {
        this.error.set('Failed to copy rating criteria');
        console.error('Error copying rating criteria:', err);
      },
    });
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

    this.ratingCriteriaService.delete(uuid).subscribe({
      next: () => {
        this.ratingCriteria.update((criteria) => criteria.filter((c) => c.uuid !== uuid));
        this.deleteConfirmUuid.set(null);
      },
      error: (err) => {
        this.error.set('Failed to delete rating criteria');
        console.error('Error deleting rating criteria:', err);
        this.deleteConfirmUuid.set(null);
      },
    });
  }
}
