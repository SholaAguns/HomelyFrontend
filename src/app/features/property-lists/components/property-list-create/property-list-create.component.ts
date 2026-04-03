import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PropertyListStore } from '../../store/property-list.store';
import { SearchCriteria } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-list-create',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-list-create.component.html',
  styleUrl: './property-list-create.component.css',
})
export class PropertyListCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly store = inject(PropertyListStore);

  projectUuid = '';
  submitting = signal(false);
  error = signal<string | null>(null);

  searchCriteria: SearchCriteria = {
    area: '',
    radius: 5,
    property_types: 'any',
    price_min: undefined,
    price_max: undefined,
    bedrooms_min: undefined,
    bedrooms_max: undefined,
  };

  ngOnInit() {
    this.projectUuid = this.route.parent?.snapshot.paramMap.get('projectUuid') || '';

    if (!this.projectUuid) {
      this.error.set('Project UUID is required');
    }
  }

  onSubmit() {
    if (this.submitting() || !this.projectUuid || !this.searchCriteria.area.trim()) return;

    this.submitting.set(true);
    this.error.set(null);

    this.store.create({
      project: this.projectUuid,
      search_criteria: this.searchCriteria,
    });

    const checkCreation = setInterval(() => {
      if (!this.store.loading()) {
        clearInterval(checkCreation);

        if (this.store.error()) {
          this.submitting.set(false);
          this.error.set(this.store.error());
        } else {
          const createdList = this.store
            .all()
            .find((l) => l.search_criteria?.area === this.searchCriteria.area);
          if (createdList) {
            this.submitting.set(false);
            this.router.navigate(['/projects', this.projectUuid, 'lists', createdList.uuid]);
          }
        }
      }
    }, 100);
  }

  onCancel() {
    this.router.navigate(['/projects', this.projectUuid]);
  }
}
