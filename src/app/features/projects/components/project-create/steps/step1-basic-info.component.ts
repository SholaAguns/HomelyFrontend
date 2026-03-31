import { Component, Output, EventEmitter, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step1-basic-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h2 class="mb-6 text-xl font-semibold">Project Information</h2>

      <form (ngSubmit)="onSubmit()">
        <div class="mb-4">
          <label for="title" class="mb-1 block text-sm font-medium">
            Project Title <span class="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            [(ngModel)]="title"
            name="title"
            required
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="e.g., House Hunting 2026"
          />
        </div>

        <div class="mb-6">
          <label for="description" class="mb-1 block text-sm font-medium">
            Description (Optional)
          </label>
          <textarea
            id="description"
            [(ngModel)]="description"
            name="description"
            rows="4"
            class="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
            placeholder="Describe your project..."
          ></textarea>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            [disabled]="!title"
            class="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            Next
          </button>
        </div>
      </form>
    </div>
  `,
})
export class Step1BasicInfoComponent {
  @Input() initialData = { title: '', description: '' };
  @Output() complete = new EventEmitter<{ title: string; description: string }>();

  title = '';
  description = '';

  ngOnInit() {
    this.title = this.initialData.title;
    this.description = this.initialData.description;
  }

  onSubmit() {
    if (this.title.trim()) {
      this.complete.emit({
        title: this.title.trim(),
        description: this.description.trim(),
      });
    }
  }
}
