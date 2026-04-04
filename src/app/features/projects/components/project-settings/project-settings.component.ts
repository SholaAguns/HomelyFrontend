import { Component, inject, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProjectStore } from '../../store/project.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import {
  UpdateProjectDto,
  CreateContextOptionsDto,
} from '../../../../shared/models/project-models';
import {
  ContextOptions,
  POI_TYPE_LABELS,
  SCHOOL_TYPE_LABELS,
  PoiType,
  SchoolType,
} from '../../../../shared/models/context-options.models';

@Component({
  selector: 'app-project-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './project-settings.component.html',
  styleUrl: './project-settings.component.css',
})
export class ProjectSettingsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  readonly projectStore = inject(ProjectStore);
  private notificationService = inject(NotificationService);

  private previousLoadingState = false;
  private isSaving = false;

  projectUuid = '';
  loading = signal(false);

  // Project details
  title = signal('');
  description = signal('');

  // Context options
  contextOptions = signal<ContextOptions | null>(null);
  enableCrime = signal(false);
  enableSchools = signal(false);
  schoolTypes = signal<SchoolType[]>([]);
  enableBroadband = signal(false);
  enableMobile = signal(false);
  enableCouncilTax = signal(false);
  enablePoi = signal(false);
  poiTypes = signal<PoiType[]>([]);
  poiRadius = signal(1000);
  enableSavedLocations = signal(false);
  savedLocationUuids = signal<string[]>([]);

  // Rating criteria
  ratingCriteria = signal('');

  // Viewers/contributors
  viewers = signal<string[]>([]);
  contributors = signal<string[]>([]);
  newViewer = signal('');
  newContributor = signal('');

  // Delete confirmation
  showDeleteModal = signal(false);
  deleteConfirmation = signal('');

  readonly POI_TYPE_LABELS = POI_TYPE_LABELS;
  readonly SCHOOL_TYPE_LABELS = SCHOOL_TYPE_LABELS;
  readonly poiTypeKeys = Object.keys(POI_TYPE_LABELS) as PoiType[];
  readonly schoolTypeKeys = Object.keys(SCHOOL_TYPE_LABELS) as SchoolType[];

  constructor() {
    effect(() => {
      const loading = this.projectStore.loading();
      const error = this.projectStore.error();

      if (this.previousLoadingState && !loading && this.isSaving) {
        if (error) {
          this.notificationService.error(error);
        } else {
          this.notificationService.success('Settings saved successfully');
        }
        this.isSaving = false;
      }

      this.previousLoadingState = loading;
    });
  }

  ngOnInit() {
    this.projectUuid = this.route.snapshot.paramMap.get('uuid') || '';

    if (this.projectUuid) {
      this.loading.set(true);
      this.projectStore.loadDetail(this.projectUuid);

      setTimeout(() => {
        const project = this.projectStore.selectedDetail();
        if (project) {
          this.title.set(project.title);
          this.description.set(project.description || '');
          this.viewers.set([...project.viewers]);
          this.contributors.set([...project.contributors]);
          this.ratingCriteria.set(project.rating_criteria || '');

          if (project.context_options) {
            this.loadContextOptions(project.context_options);
          }
        }
        this.loading.set(false);
      }, 500);
    }
  }

  loadContextOptions(options: ContextOptions) {
    this.contextOptions.set(options);
    this.enableCrime.set(options.enable_crime);
    this.enableSchools.set(options.enable_schools);
    this.schoolTypes.set([...options.school_types]);
    this.enableBroadband.set(options.enable_broadband);
    this.enableMobile.set(options.enable_mobile);
    this.enableCouncilTax.set(options.enable_council_tax);
    this.enablePoi.set(options.enable_poi);
    this.poiTypes.set([...options.poi_types]);
    this.poiRadius.set(options.poi_search_radius_meters);
    this.enableSavedLocations.set(options.enable_saved_locations);
    this.savedLocationUuids.set([...options.saved_location_uuids]);
  }

  saveProjectDetails() {
    this.isSaving = true;
    const updateDto: UpdateProjectDto = {
      title: this.title(),
      description: this.description(),
    };

    this.projectStore.update({ uuid: this.projectUuid, data: updateDto });
  }

  saveContextOptions() {
    this.isSaving = true;
    const updateDto: CreateContextOptionsDto = {
      enable_crime: this.enableCrime(),
      enable_schools: this.enableSchools(),
      school_types: this.schoolTypes(),
      enable_broadband: this.enableBroadband(),
      enable_mobile: this.enableMobile(),
      enable_council_tax: this.enableCouncilTax(),
      enable_poi: this.enablePoi(),
      poi_types: this.poiTypes(),
      poi_search_radius_meters: this.poiRadius(),
      enable_saved_locations: this.enableSavedLocations(),
      saved_location_uuids: this.savedLocationUuids(),
    };

    this.projectStore.setContextOptions({ uuid: this.projectUuid, data: updateDto });
  }

  saveRatingCriteria() {
    this.isSaving = true;
    const updateDto: UpdateProjectDto = {
      rating_criteria: this.ratingCriteria() || null,
    };

    this.projectStore.update({ uuid: this.projectUuid, data: updateDto });
  }

  saveViewersContributors() {
    this.isSaving = true;
    const updateDto: UpdateProjectDto = {
      viewers: this.viewers(),
      contributors: this.contributors(),
    };

    this.projectStore.update({ uuid: this.projectUuid, data: updateDto });
  }

  addViewer() {
    const email = this.newViewer().trim();
    if (email && !this.viewers().includes(email)) {
      this.viewers.update((v) => [...v, email]);
      this.newViewer.set('');
    }
  }

  removeViewer(email: string) {
    this.viewers.update((v) => v.filter((e) => e !== email));
  }

  addContributor() {
    const email = this.newContributor().trim();
    if (email && !this.contributors().includes(email)) {
      this.contributors.update((c) => [...c, email]);
      this.newContributor.set('');
    }
  }

  removeContributor(email: string) {
    this.contributors.update((c) => c.filter((e) => e !== email));
  }

  toggleSchoolType(type: SchoolType) {
    const current = this.schoolTypes();
    if (current.includes(type)) {
      this.schoolTypes.set(current.filter((t) => t !== type));
    } else {
      this.schoolTypes.set([...current, type]);
    }
  }

  togglePoiType(type: PoiType) {
    const current = this.poiTypes();
    if (current.includes(type)) {
      this.poiTypes.set(current.filter((t) => t !== type));
    } else {
      this.poiTypes.set([...current, type]);
    }
  }

  openDeleteModal() {
    this.showDeleteModal.set(true);
    this.deleteConfirmation.set('');
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.deleteConfirmation.set('');
  }

  confirmDelete() {
    if (this.deleteConfirmation().toLowerCase() === 'delete') {
      this.projectStore.delete(this.projectUuid);

      const checkDeletion = setInterval(() => {
        if (!this.projectStore.loading()) {
          clearInterval(checkDeletion);
          this.router.navigate(['/projects']);
        }
      }, 100);
    }
  }

  navigateBack() {
    this.router.navigate(['/projects', this.projectUuid]);
  }
}
