import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project } from '../../../../shared/models/project-models';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="cursor-pointer rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
    >
      <div class="mb-4 flex items-start justify-between">
        <div class="flex-1">
          <h3 class="mb-2 text-xl font-semibold text-gray-900">{{ project.title }}</h3>
          <p class="text-sm text-gray-600">{{ project.description || 'No description' }}</p>
        </div>
      </div>

      <div class="mb-4 flex items-center space-x-4 text-sm text-gray-600">
        <div class="flex items-center">
          <svg class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>{{ project.property_lists_count }} lists</span>
        </div>

        @if (project.viewers && project.viewers.length > 0) {
          <div class="flex items-center">
            <svg class="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <span>{{ project.viewers.length + project.contributors.length }} collaborators</span>
          </div>
        }
      </div>

      <div class="flex items-center justify-between border-t border-gray-100 pt-4">
        <span class="text-xs text-gray-500">
          Created {{ project.created_at | date: 'MMM d, yyyy' }}
        </span>

        <button
          (click)="onDelete($event)"
          class="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50"
        >
          Delete
        </button>
      </div>
    </div>
  `,
})
export class ProjectCardComponent {
  @Input() project!: Project;
  @Output() delete = new EventEmitter<string>();

  onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.project.uuid);
  }
}
