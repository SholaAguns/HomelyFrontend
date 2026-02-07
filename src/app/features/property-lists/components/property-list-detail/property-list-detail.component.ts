import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PropertyListService } from '../../../../core/services/property-list-service/property-list.service';
import { PropertyListDetail } from '../../../../shared/models/property-list-models';
import { PropertyListFormComponent } from '../property-list-form/property-list-form.component';
import { PropertyPreviewCard } from '../property-preview-card/property-preview-card';

@Component({
  selector: 'app-property-list-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyListFormComponent, PropertyPreviewCard],
  templateUrl: './property-list-detail.component.html',
  styleUrl: './property-list-detail.component.css',
})
export class PropertyListDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PropertyListService);

  list = signal<PropertyListDetail | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  editMode = signal(false);

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.loadList(uuid);
    }
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
