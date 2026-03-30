import { Component, inject, OnInit, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ContextOptionsStore } from '../../store/context-options.store';
import {
  POI_TYPE_LABELS,
  PoiType,
  SCHOOL_TYPE_LABELS,
  SchoolType,
  UpdateContextOptionsDto,
} from '../../../../shared/models/context-options.models';
import { SavedLocationService } from '../../../../core/services/saved-location.service';
import { SavedLocation } from '../../../../shared/models/saved-location-models';

@Component({
  selector: 'app-context-options-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './context-options-form.component.html',
  styleUrl: './context-options-form.component.css',
})
export class ContextOptionsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected contextOptionsStore = inject(ContextOptionsStore);
  private savedLocationService = inject(SavedLocationService);

  propertyListUuid = '';
  readonly poiTypeEntries = Object.entries(POI_TYPE_LABELS) as [PoiType, string][];
  readonly schoolTypeEntries = Object.entries(SCHOOL_TYPE_LABELS) as [SchoolType, string][];

  // Saved Locations
  availableSavedLocations = signal<SavedLocation[]>([]);
  selectedSavedLocationUuids = signal<string[]>([]);
  loadingSavedLocations = signal(false);
  savedLocationsConfigExpanded = signal(false);
  poiConfigExpanded = signal(false);
  validationError = signal<string | null>(null);

  form: FormGroup = this.fb.group({
    enable_crime: [false],
    enable_schools: [false],
    enable_broadband: [false],
    enable_mobile: [false],
    enable_council_tax: [false],
    enable_poi: [false],
    enable_saved_locations: [false],
    poi_search_radius_meters: [1600],
  });

  poiTypeSelections: Record<PoiType, boolean> = {} as Record<PoiType, boolean>;
  schoolTypeSelections: Record<SchoolType, boolean> = {} as Record<SchoolType, boolean>;
  private formPatched = false;
  private previousSaving = false;

  constructor() {
    this.poiTypeEntries.forEach(([type]) => {
      this.poiTypeSelections[type] = false;
    });
    this.schoolTypeEntries.forEach(([type]) => {
      this.schoolTypeSelections[type] = false;
    });

    effect(() => {
      if (!this.propertyListUuid) return;
      const contextOptions = this.contextOptionsStore.getByPropertyList()(this.propertyListUuid);
      if (contextOptions && !this.formPatched) {
        this.formPatched = true;
        this.patchForm(contextOptions);
      }
    });

    effect(() => {
      const currentSaving = this.contextOptionsStore.saving();
      const currentError = this.contextOptionsStore.error();

      if (this.previousSaving && !currentSaving && !currentError && this.propertyListUuid) {
        this.router.navigate(['/lists', this.propertyListUuid]);
      }

      this.previousSaving = currentSaving;
    });
  }

  ngOnInit(): void {
    this.propertyListUuid = this.route.snapshot.paramMap.get('uuid') ?? '';
    this.contextOptionsStore.load(this.propertyListUuid);
    this.loadSavedLocations();
  }

  private loadSavedLocations(): void {
    this.loadingSavedLocations.set(true);
    this.savedLocationService.getAll().subscribe({
      next: (locations) => {
        this.availableSavedLocations.set(locations);
        this.loadingSavedLocations.set(false);
      },
      error: (err) => {
        console.error('Error loading saved locations:', err);
        this.loadingSavedLocations.set(false);
      },
    });
  }

  private patchForm(contextOptions: {
    enable_crime: boolean;
    enable_schools: boolean;
    school_types: SchoolType[];
    enable_broadband: boolean;
    enable_mobile: boolean;
    enable_council_tax: boolean;
    enable_poi: boolean;
    poi_types: PoiType[];
    poi_search_radius_meters: number;
    enable_saved_locations: boolean;
    saved_location_uuids: string[];
  }): void {
    this.form.patchValue({
      enable_crime: contextOptions.enable_crime,
      enable_schools: contextOptions.enable_schools,
      enable_broadband: contextOptions.enable_broadband,
      enable_mobile: contextOptions.enable_mobile,
      enable_council_tax: contextOptions.enable_council_tax,
      enable_poi: contextOptions.enable_poi,
      enable_saved_locations: contextOptions.enable_saved_locations,
      poi_search_radius_meters: contextOptions.poi_search_radius_meters,
    });
    this.poiTypeEntries.forEach(([type]) => {
      this.poiTypeSelections[type] = contextOptions.poi_types.includes(type);
    });
    this.schoolTypeEntries.forEach(([type]) => {
      this.schoolTypeSelections[type] = contextOptions.school_types.includes(type);
    });
    this.selectedSavedLocationUuids.set(contextOptions.saved_location_uuids || []);

    // Auto-expand config sections if they have data
    if (contextOptions.enable_saved_locations && contextOptions.saved_location_uuids?.length > 0) {
      this.savedLocationsConfigExpanded.set(true);
    }
    if (contextOptions.enable_poi && contextOptions.poi_types?.length > 0) {
      this.poiConfigExpanded.set(true);
    }
  }

  onSchoolTypeToggle(schoolType: SchoolType): void {
    this.schoolTypeSelections[schoolType] = !this.schoolTypeSelections[schoolType];
  }

  toggleAllSchoolTypes(): void {
    const allSelected = this.areAllSchoolTypesSelected();
    this.schoolTypeEntries.forEach(([type]) => {
      this.schoolTypeSelections[type] = !allSelected;
    });
  }

  areAllSchoolTypesSelected(): boolean {
    return this.schoolTypeEntries.every(([type]) => this.schoolTypeSelections[type]);
  }

  onPoiTypeToggle(poiType: PoiType): void {
    this.poiTypeSelections[poiType] = !this.poiTypeSelections[poiType];
  }

  toggleAllPoiTypes(): void {
    const allSelected = this.areAllPoiTypesSelected();
    this.poiTypeEntries.forEach(([type]) => {
      this.poiTypeSelections[type] = !allSelected;
    });
  }

  areAllPoiTypesSelected(): boolean {
    return this.poiTypeEntries.every(([type]) => this.poiTypeSelections[type]);
  }

  hasAnyPoiTypeSelected(): boolean {
    return this.poiTypeEntries.some(([type]) => this.poiTypeSelections[type]);
  }

  toggleAllContextServices(): void {
    const allSelected = this.areAllContextServicesSelected();
    this.form.patchValue({
      enable_crime: !allSelected,
      enable_schools: !allSelected,
      enable_broadband: !allSelected,
      enable_mobile: !allSelected,
      enable_council_tax: !allSelected,
      enable_poi: !allSelected,
      enable_saved_locations: !allSelected,
    });
  }

  areAllContextServicesSelected(): boolean {
    return (
      this.form.get('enable_crime')?.value &&
      this.form.get('enable_schools')?.value &&
      this.form.get('enable_broadband')?.value &&
      this.form.get('enable_mobile')?.value &&
      this.form.get('enable_council_tax')?.value &&
      this.form.get('enable_poi')?.value &&
      this.form.get('enable_saved_locations')?.value
    );
  }

  // Saved Location methods
  get isSavedLocationsEnabled(): boolean {
    return this.form.get('enable_saved_locations')?.value;
  }

  get availableLocationsForSelection(): SavedLocation[] {
    return this.availableSavedLocations().filter(
      (loc) => !this.selectedSavedLocationUuids().includes(loc.uuid)
    );
  }

  getSelectedLocation(uuid: string): SavedLocation | undefined {
    return this.availableSavedLocations().find((loc) => loc.uuid === uuid);
  }

  addSavedLocation(uuid: string): void {
    if (uuid && !this.selectedSavedLocationUuids().includes(uuid)) {
      this.selectedSavedLocationUuids.update((uuids) => [...uuids, uuid]);
    }
  }

  removeSavedLocation(uuid: string): void {
    this.selectedSavedLocationUuids.update((uuids) => uuids.filter((id) => id !== uuid));
  }

  toggleSavedLocationsConfig(): void {
    this.savedLocationsConfigExpanded.update((v) => !v);
  }

  togglePoiConfig(): void {
    this.poiConfigExpanded.update((v) => !v);
  }

  onSubmit(): void {
    this.validationError.set(null);

    if (!this.form.valid) {
      return;
    }

    const selectedSchoolTypes = this.schoolTypeEntries
      .filter(([type]) => this.schoolTypeSelections[type])
      .map(([type]) => type);

    const selectedPoiTypes = this.poiTypeEntries
      .filter(([type]) => this.poiTypeSelections[type])
      .map(([type]) => type);

    // Validation: if saved locations enabled, at least one location must be selected
    if (this.form.value.enable_saved_locations && this.selectedSavedLocationUuids().length === 0) {
      this.validationError.set('Please select at least one saved location');
      this.savedLocationsConfigExpanded.set(true);
      return;
    }

    // Validation: if POI enabled, at least one POI type must be selected
    if (this.form.value.enable_poi && selectedPoiTypes.length === 0) {
      this.validationError.set('Please select at least one place of interest type');
      this.poiConfigExpanded.set(true);
      return;
    }

    const updateData: UpdateContextOptionsDto = {
      ...this.form.value,
      school_types: selectedSchoolTypes,
      poi_types: selectedPoiTypes,
      saved_location_uuids: this.selectedSavedLocationUuids(),
    };

    this.contextOptionsStore.save({ propertyListUuid: this.propertyListUuid, data: updateData });
  }

  onCancel(): void {
    this.router.navigate(['/lists', this.propertyListUuid]);
  }

  get isSchoolsEnabled(): boolean {
    return this.form.get('enable_schools')?.value === true;
  }

  get isPoiEnabled(): boolean {
    return this.form.get('enable_poi')?.value === true;
  }

  get saving(): boolean {
    return this.contextOptionsStore.saving();
  }

  get error(): string | null {
    return this.contextOptionsStore.error();
  }
}
