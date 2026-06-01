import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyListStore } from '../../store/property-list.store';
import { SearchCriteria } from '../../../../shared/models/property-models';
import { SearchCriteriaFormComponent } from '../../../../shared/components/search-criteria-form/search-criteria-form.component';
import { SearchTaskStore } from '../../../property/store/search-task.store';

type CreationMode = 'choose' | 'blank' | 'search';

@Component({
  selector: 'app-property-list-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SearchCriteriaFormComponent],
  templateUrl: './property-list-create.component.html',
  styleUrl: './property-list-create.component.css',
})
export class PropertyListCreateComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  readonly store = inject(PropertyListStore);
  readonly searchTaskStore = inject(SearchTaskStore);

  projectUuid = '';
  mode = signal<CreationMode>('choose');
  blankTitle = signal('');
  submitting = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.projectUuid = this.route.parent?.snapshot.paramMap.get('projectUuid') || '';
    if (!this.projectUuid) {
      this.error.set('Project UUID is required');
    }
  }

  selectMode(m: CreationMode) {
    this.mode.set(m);
    this.error.set(null);
  }

  onCreateBlank() {
    if (this.submitting() || !this.projectUuid) return;

    this.submitting.set(true);
    this.error.set(null);

    this.store.createBlank({
      project_uuid: this.projectUuid,
      title: this.blankTitle() || undefined,
    });

    const check = setInterval(() => {
      if (!this.store.loading()) {
        clearInterval(check);
        if (this.store.error()) {
          this.submitting.set(false);
          this.error.set(this.store.error());
        } else {
          const lists = this.store.all();
          const created = lists[lists.length - 1];
          if (created) {
            this.submitting.set(false);
            this.router.navigate(['/projects', this.projectUuid, 'lists', created.uuid]);
          }
        }
      }
    }, 100);
  }

  onSearchSubmit(searchCriteria: SearchCriteria) {
    if (this.submitting() || !this.projectUuid) return;

    this.submitting.set(true);
    this.error.set(null);

    this.store.create({
      project_uuid: this.projectUuid,
      search_criteria: searchCriteria,
    });

    const check = setInterval(() => {
      if (!this.store.loading()) {
        clearInterval(check);
        if (this.store.error()) {
          this.submitting.set(false);
          this.error.set(this.store.error());
        } else {
          const createdList = this.store
            .all()
            .find((l) => l.search_criteria?.area === searchCriteria.area);
          if (createdList) {
            if (createdList.scraping_tasks?.length) {
              this.searchTaskStore.initializeFromTasks(
                createdList.uuid,
                createdList.scraping_tasks
              );
            }
            this.submitting.set(false);
            this.router.navigate(['/projects', this.projectUuid, 'lists', createdList.uuid]);
          }
        }
      }
    }, 100);
  }

  onCancel() {
    if (this.mode() !== 'choose') {
      this.mode.set('choose');
    } else {
      this.router.navigate(['/projects', this.projectUuid]);
    }
  }
}
