import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyListStore } from '../../store/property-list.store';
import { SearchCriteria } from '../../../../shared/models/property-models';
import { SearchCriteriaFormComponent } from '../../../../shared/components/search-criteria-form/search-criteria-form.component';

@Component({
  selector: 'app-property-list-create',
  standalone: true,
  imports: [CommonModule, SearchCriteriaFormComponent],
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

  ngOnInit() {
    this.projectUuid = this.route.parent?.snapshot.paramMap.get('projectUuid') || '';

    if (!this.projectUuid) {
      this.error.set('Project UUID is required');
    }
  }

  onSearchSubmit(searchCriteria: SearchCriteria) {
    if (this.submitting() || !this.projectUuid) return;

    this.submitting.set(true);
    this.error.set(null);

    this.store.create({
      project_uuid: this.projectUuid,
      search_criteria: searchCriteria,
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
            .find((l) => l.search_criteria?.area === searchCriteria.area);
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
