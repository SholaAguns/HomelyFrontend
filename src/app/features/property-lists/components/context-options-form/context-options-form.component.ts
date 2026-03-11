import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ContextOptionsStore } from '../../store/context-options.store';
import {
  POI_TYPE_LABELS,
  PoiType,
  UpdateContextOptionsDto,
} from '../../../../shared/models/property-list-models';

@Component({
  selector: 'app-context-options-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './context-options-form.component.html',
  styleUrl: './context-options-form.component.css',
})
export class ContextOptionsFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  protected contextOptionsStore = inject(ContextOptionsStore);

  propertyListUuid = '';
  readonly poiTypeEntries = Object.entries(POI_TYPE_LABELS) as [PoiType, string][];

  form: FormGroup = this.fb.group({
    enable_crime: [false],
    enable_schools: [false],
    enable_broadband: [false],
    enable_mobile: [false],
    enable_poi: [false],
    poi_search_radius_meters: [1600],
  });

  poiTypeSelections: Record<PoiType, boolean> = {} as Record<PoiType, boolean>;
  private formPatched = false;

  constructor() {
    this.poiTypeEntries.forEach(([type]) => {
      this.poiTypeSelections[type] = false;
    });

    effect(() => {
      if (!this.propertyListUuid) return;
      const contextOptions = this.contextOptionsStore.getByPropertyList()(this.propertyListUuid);
      if (contextOptions && !this.formPatched) {
        this.formPatched = true;
        this.patchForm(contextOptions);
      }
    });
  }

  ngOnInit(): void {
    this.propertyListUuid = this.route.snapshot.paramMap.get('uuid') ?? '';
    this.contextOptionsStore.load(this.propertyListUuid);
  }

  private patchForm(contextOptions: {
    enable_crime: boolean;
    enable_schools: boolean;
    enable_broadband: boolean;
    enable_mobile: boolean;
    enable_poi: boolean;
    poi_types: PoiType[];
    poi_search_radius_meters: number;
  }): void {
    this.form.patchValue({
      enable_crime: contextOptions.enable_crime,
      enable_schools: contextOptions.enable_schools,
      enable_broadband: contextOptions.enable_broadband,
      enable_mobile: contextOptions.enable_mobile,
      enable_poi: contextOptions.enable_poi,
      poi_search_radius_meters: contextOptions.poi_search_radius_meters,
    });
    this.poiTypeEntries.forEach(([type]) => {
      this.poiTypeSelections[type] = contextOptions.poi_types.includes(type);
    });
  }

  onPoiTypeToggle(poiType: PoiType): void {
    this.poiTypeSelections[poiType] = !this.poiTypeSelections[poiType];
  }

  onSubmit(): void {
    if (this.form.valid) {
      const selectedPoiTypes = this.poiTypeEntries
        .filter(([type]) => this.poiTypeSelections[type])
        .map(([type]) => type);

      const updateData: UpdateContextOptionsDto = {
        ...this.form.value,
        poi_types: selectedPoiTypes,
      };

      this.contextOptionsStore.save({ propertyListUuid: this.propertyListUuid, data: updateData });
    }
  }

  onCancel(): void {
    this.router.navigate(['/lists', this.propertyListUuid]);
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
