import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreateContextOptionsDto } from '../../../../../shared/models/project-models';

@Component({
  selector: 'app-step2-context-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="mb-2 text-xl font-semibold">Context Options</h2>
      <p class="mb-6 text-sm text-gray-600">
        Select which services to enable for properties in this project
      </p>

      <form (ngSubmit)="onSubmit()">
        <div class="mb-6 space-y-3">
          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_crime"
              name="enable_crime"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Crime Statistics</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_schools"
              name="enable_schools"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Schools Information</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_broadband"
              name="enable_broadband"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Broadband Speeds</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_mobile"
              name="enable_mobile"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Mobile Coverage</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_council_tax"
              name="enable_council_tax"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Council Tax</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_poi"
              name="enable_poi"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Points of Interest</span>
          </label>

          <label class="flex items-center">
            <input
              type="checkbox"
              [(ngModel)]="options.enable_saved_locations"
              name="enable_saved_locations"
              class="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span class="ml-3 text-sm">Saved Locations</span>
          </label>
        </div>

        <div class="flex justify-between">
          <button
            type="button"
            (click)="onBack()"
            class="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Back
          </button>

          <div class="space-x-3">
            <button
              type="button"
              (click)="onSkip()"
              class="rounded-lg border border-gray-300 px-6 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Skip
            </button>
            <button
              type="submit"
              class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class Step2ContextOptionsComponent {
  @Output() complete = new EventEmitter<CreateContextOptionsDto>();
  @Output() skip = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  options = {
    enable_crime: false,
    enable_schools: false,
    school_types: [],
    enable_broadband: false,
    enable_mobile: false,
    enable_council_tax: false,
    enable_poi: false,
    poi_types: [],
    poi_search_radius_meters: 1000,
    enable_saved_locations: false,
    saved_location_uuids: [],
  };

  onSubmit() {
    this.complete.emit(this.options);
  }

  onSkip() {
    this.skip.emit();
  }

  onBack() {
    this.back.emit();
  }
}
