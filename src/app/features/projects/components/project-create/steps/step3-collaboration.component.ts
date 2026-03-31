import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step3-collaboration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="mb-2 text-xl font-semibold">Collaboration</h2>
      <p class="mb-6 text-sm text-gray-600">
        Add people who can view or contribute to this project (optional)
      </p>

      <form (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="viewerInput" class="mb-1 block text-sm font-medium"> Viewers </label>
          <p class="mb-2 text-xs text-gray-500">Can view properties but not make changes</p>
          <div class="flex">
            <input
              id="viewerInput"
              type="email"
              [(ngModel)]="viewerInput"
              name="viewerInput"
              class="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="email@example.com"
            />
            <button
              type="button"
              (click)="addViewer()"
              [disabled]="!viewerInput"
              class="rounded-r-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              Add
            </button>
          </div>
          @if (viewers.length > 0) {
            <div class="mt-2 flex flex-wrap gap-2">
              @for (viewer of viewers; track viewer) {
                <span
                  class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
                >
                  {{ viewer }}
                  <button
                    type="button"
                    (click)="removeViewer(viewer)"
                    class="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              }
            </div>
          }
        </div>

        <div class="mb-6">
          <label for="contributorInput" class="mb-1 block text-sm font-medium">
            Contributors
          </label>
          <p class="mb-2 text-xs text-gray-500">Can view and make changes</p>
          <div class="flex">
            <input
              id="contributorInput"
              type="email"
              [(ngModel)]="contributorInput"
              name="contributorInput"
              class="flex-1 rounded-l-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              placeholder="email@example.com"
            />
            <button
              type="button"
              (click)="addContributor()"
              [disabled]="!contributorInput"
              class="rounded-r-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
            >
              Add
            </button>
          </div>
          @if (contributors.length > 0) {
            <div class="mt-2 flex flex-wrap gap-2">
              @for (contributor of contributors; track contributor) {
                <span
                  class="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                >
                  {{ contributor }}
                  <button
                    type="button"
                    (click)="removeContributor(contributor)"
                    class="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              }
            </div>
          }
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
              Create Project
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
})
export class Step3CollaborationComponent {
  @Input() initialData: { viewers: string[]; contributors: string[] } = {
    viewers: [],
    contributors: [],
  };
  @Output() complete = new EventEmitter<{ viewers: string[]; contributors: string[] }>();
  @Output() skip = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  viewers: string[] = [];
  contributors: string[] = [];
  viewerInput = '';
  contributorInput = '';

  ngOnInit() {
    this.viewers = [...(this.initialData.viewers || [])];
    this.contributors = [...(this.initialData.contributors || [])];
  }

  addViewer() {
    if (this.viewerInput && !this.viewers.includes(this.viewerInput)) {
      this.viewers.push(this.viewerInput);
      this.viewerInput = '';
    }
  }

  removeViewer(viewer: string) {
    this.viewers = this.viewers.filter((v) => v !== viewer);
  }

  addContributor() {
    if (this.contributorInput && !this.contributors.includes(this.contributorInput)) {
      this.contributors.push(this.contributorInput);
      this.contributorInput = '';
    }
  }

  removeContributor(contributor: string) {
    this.contributors = this.contributors.filter((c) => c !== contributor);
  }

  onSubmit() {
    this.complete.emit({
      viewers: this.viewers,
      contributors: this.contributors,
    });
  }

  onSkip() {
    this.skip.emit();
  }

  onBack() {
    this.back.emit();
  }
}
