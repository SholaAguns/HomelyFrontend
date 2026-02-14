import { Component, inject, OnInit, OnDestroy, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';
import { PropertyListDetail } from '../../../../shared/models/property-list-models';
import { PropertyListFormComponent } from '../property-list-form/property-list-form.component';
import { PropertyPreviewCard } from '../property-preview-card/property-preview-card';
import { SearchTaskStore } from '../../../property/store/search-task.store';

@Component({
  selector: 'app-property-list-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyListFormComponent, PropertyPreviewCard],
  templateUrl: './property-list-detail.component.html',
  styleUrl: './property-list-detail.component.css',
})
export class PropertyListDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PropertyListService);
  searchTaskStore = inject(SearchTaskStore);

  list = signal<PropertyListDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);

  constructor() {
    // Reload properties when scraping completes or fails
    effect(() => {
      const status = this.searchTaskStore.status();

      if (status === 'COMPLETED' || status === 'FAILED') {
        const uuid = this.route.snapshot.paramMap.get('uuid');
        if (uuid) {
          this.loadList(uuid);
        }
      }
    });
  }

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadList(uuid);

      // Start polling if there's an active task for this list
      const currentTask = this.searchTaskStore.currentTask();
      const taskListUuid = this.searchTaskStore.propertyListUuid();
      const taskStatus = this.searchTaskStore.status();

      if (
        currentTask &&
        taskListUuid === uuid &&
        (taskStatus === 'QUEUED' || taskStatus === 'IN_PROGRESS')
      ) {
        this.searchTaskStore.startPolling(uuid);
      }
    }
  }

  ngOnDestroy() {
    // Clear task state when navigating away
    this.searchTaskStore.reset();
  }

  loadList(uuid: string) {
    this.loading.set(true);
    this.error.set(null);
    this.service.getByUuid(uuid).subscribe({
      next: (list) => {
        this.list.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message);
        this.loading.set(false);
      },
    });
  }

  onDelete() {
    const list = this.list();
    if (list && confirm('Are you sure you want to delete this property list?')) {
      this.service.delete(list.uuid).subscribe({
        next: () => {
          this.router.navigate(['/lists']);
        },
        error: (err) => {
          this.error.set(err.message);
        },
      });
    }
  }

  onActivate() {
    const list = this.list();
    if (list) {
      this.service.activate(list.uuid).subscribe({
        next: (result) => {
          this.list.update((current) =>
            current ? { ...current, state: result.state as 'ACTIVE' | 'DRAFT' } : null
          );
        },
        error: (err) => {
          this.error.set(err.message);
        },
      });
    }
  }

  onEdit() {
    this.editMode.set(true);
  }

  onCancelEdit() {
    this.editMode.set(false);
  }

  onUpdate(data: any) {
    const list = this.list();
    if (list) {
      this.service.update(list.uuid, data).subscribe({
        next: (updated) => {
          this.list.update((current) => (current ? { ...current, ...updated } : null));
          this.editMode.set(false);
        },
        error: (err) => {
          this.error.set(err.message);
        },
      });
    }
  }
}
