import { Component, inject, OnInit, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';
import { ProjectStore } from '../../store/project.store';
import { NotificationService } from '../../../../core/services/notification-service/notification.service';
import {
  UpdateProjectDto,
  CreateContextOptionsDto,
  ProjectMembers,
  ProjectInvitation,
  UserSearchResult,
} from '../../../../shared/models/project-models';
import {
  ContextOptions,
  POI_TYPE_LABELS,
  SCHOOL_TYPE_LABELS,
  PoiType,
  SchoolType,
} from '../../../../shared/models/context-options.models';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { SavedLocation } from '../../../../shared/models/saved-location-models';
import { RatingCriteriaStore } from '../../store/rating-criteria.store';
import { SharingService } from '../../../../core/services/sharing-service/sharing.service';
import { AuthService } from '../../../../core/services/auth-service/auth.service';

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
  private savedLocationService = inject(SavedLocationService);
  readonly ratingCriteriaStore = inject(RatingCriteriaStore);
  private sharingService = inject(SharingService);
  private authService = inject(AuthService);

  private previousLoadingState = false;
  private isSaving = false;

  projectUuid = '';
  loading = signal(false);
  userRole = signal<'owner' | 'contributor' | 'viewer' | null>(null);

  isOwner = computed(() => this.authService.isOwner(this.projectUuid, this.userRole()));
  canEdit = computed(() => this.authService.canEdit(this.projectUuid, this.userRole()));

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
  savedLocations = signal<SavedLocation[]>([]);

  // Rating criteria
  ratingCriteria = signal('');

  // Sharing
  shareTab = signal<'direct' | 'invite'>('direct');
  userSearchQuery = signal('');
  userSearchResults = signal<UserSearchResult[]>([]);
  selectedUser = signal<UserSearchResult | null>(null);
  newMemberRole = signal<'viewer' | 'contributor'>('viewer');
  members = signal<ProjectMembers | null>(null);
  inviteEmail = signal('');
  inviteRole = signal<'viewer' | 'contributor'>('viewer');
  sendingInvite = signal(false);
  lastInviteUrl = signal('');
  pendingInvitations = signal<ProjectInvitation[]>([]);
  private searchInput$ = new Subject<string>();

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

    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) => (q.length >= 2 ? this.sharingService.searchUsers(q) : []))
      )
      .subscribe((results) => this.userSearchResults.set(results));
  }

  ngOnInit() {
    this.projectUuid = this.route.snapshot.paramMap.get('uuid') || '';

    this.authService.getCurrentUser().subscribe();

    if (this.projectUuid) {
      this.authService.getUserRole(this.projectUuid).subscribe({
        next: (role) => this.userRole.set(role),
        error: () => {},
      });
    }

    this.savedLocationService.getAll().subscribe({
      next: (locations) => this.savedLocations.set(locations),
      error: (err) => console.error('Failed to load saved locations:', err),
    });

    this.ratingCriteriaStore.loadAll();

    if (this.projectUuid) {
      this.loading.set(true);
      this.projectStore.loadDetail(this.projectUuid);

      setTimeout(() => {
        const project = this.projectStore.selectedDetail();
        if (project) {
          this.title.set(project.title);
          this.description.set(project.description || '');
          this.ratingCriteria.set(project.rating_criteria || '');

          if (project.context_options) {
            this.loadContextOptions(project.context_options);
          }
        }
        this.loading.set(false);
      }, 500);

      this.loadMembers();
      this.loadInvitations();
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

    const validUuids = options.saved_location_uuids.filter((uuid) =>
      this.savedLocations().some((loc) => loc.uuid === uuid)
    );
    this.savedLocationUuids.set(validUuids);
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
      saved_location_uuids: this.enableSavedLocations() ? this.savedLocationUuids() : [],
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

  loadMembers() {
    this.sharingService.getMembers(this.projectUuid).subscribe({
      next: (m) => this.members.set(m),
      error: () => {},
    });
  }

  loadInvitations() {
    this.sharingService.getInvitations(this.projectUuid).subscribe({
      next: (inv) => this.pendingInvitations.set(inv),
      error: () => {},
    });
  }

  onSearchInput(q: string) {
    this.userSearchQuery.set(q);
    this.selectedUser.set(null);
    if (!q) this.userSearchResults.set([]);
    this.searchInput$.next(q);
  }

  selectSearchResult(user: UserSearchResult) {
    this.selectedUser.set(user);
    this.userSearchQuery.set(`${user.first_name} ${user.last_name} (${user.email})`);
    this.userSearchResults.set([]);
  }

  addMemberDirect() {
    const user = this.selectedUser();
    if (!user) return;
    this.sharingService
      .createInvite(this.projectUuid, { email: user.email, role: this.newMemberRole() })
      .subscribe({
        next: () => {
          this.notificationService.success(`Invitation sent to ${user.email}`);
          this.selectedUser.set(null);
          this.userSearchQuery.set('');
          this.loadMembers();
        },
        error: (err) =>
          this.notificationService.error(err?.error?.detail || 'Failed to add member'),
      });
  }

  removeMember(email: string) {
    this.sharingService.removeMember(this.projectUuid, email).subscribe({
      next: () => {
        this.notificationService.success('Member removed');
        this.loadMembers();
      },
      error: (err) =>
        this.notificationService.error(err?.error?.detail || 'Failed to remove member'),
    });
  }

  sendInvite() {
    const email = this.inviteEmail().trim();
    if (!email) return;
    this.sendingInvite.set(true);
    this.sharingService
      .createInvite(this.projectUuid, { email: email, role: this.inviteRole() })
      .subscribe({
        next: (inv) => {
          this.sendingInvite.set(false);
          this.lastInviteUrl.set(inv.invite_url || '');
          this.inviteEmail.set('');
          this.loadInvitations();
          this.notificationService.success('Invite sent');
        },
        error: (err) => {
          this.sendingInvite.set(false);
          this.notificationService.error(err?.error?.detail || 'Failed to send invite');
        },
      });
  }

  revokeInvitation(invitationUuid: string) {
    this.sharingService.revokeInvite(this.projectUuid, invitationUuid).subscribe({
      next: () => {
        this.notificationService.success('Invitation revoked');
        this.loadInvitations();
      },
      error: () => this.notificationService.error('Failed to revoke invitation'),
    });
  }

  copyInviteUrl() {
    navigator.clipboard.writeText(this.lastInviteUrl()).then(() => {
      this.notificationService.success('Link copied!');
    });
  }

  formatInviteDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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

  toggleSavedLocation(uuid: string) {
    const current = this.savedLocationUuids();
    if (current.includes(uuid)) {
      this.savedLocationUuids.set(current.filter((u) => u !== uuid));
    } else {
      this.savedLocationUuids.set([...current, uuid]);
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

  createNewCriteria() {
    this.router.navigate(['/projects/rating-criteria/new'], {
      queryParams: { project: this.projectUuid },
    });
  }

  editCriteria() {
    const criteriaUuid = this.ratingCriteria();
    if (criteriaUuid) {
      this.router.navigate(['/projects/rating-criteria', criteriaUuid, 'edit'], {
        queryParams: { project: this.projectUuid },
      });
    }
  }

  copyCriteria() {
    const criteriaUuid = this.ratingCriteria();
    if (criteriaUuid) {
      this.ratingCriteriaStore.copy(criteriaUuid);
      setTimeout(() => {
        const copiedCriteria = this.ratingCriteriaStore
          .allCriteria()
          .find((c) => c.name.includes('(Copy)'));
        if (copiedCriteria) {
          this.ratingCriteria.set(copiedCriteria.uuid);
          this.saveRatingCriteria();
          this.notificationService.success('Criteria copied successfully');
        }
      }, 500);
    }
  }

  get selectedCriteriaName(): string {
    const project = this.projectStore.selectedDetail();
    return project?.rating_criteria_name || '';
  }

  get hasSourceCriteria(): boolean {
    const project = this.projectStore.selectedDetail();
    return !!project?.rating_criteria_source;
  }
}
