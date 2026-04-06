import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inline-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen) {
      <div
        class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black"
        (click)="onBackdropClick($event)"
      >
        <div
          class="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
          (click)="$event.stopPropagation()"
        >
          <div class="mb-4 flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">{{ title }}</h2>
            <button
              (click)="onClose()"
              class="text-gray-400 transition-colors hover:text-gray-600"
              aria-label="Close"
            >
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div class="modal-content">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class InlineModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() closeOnBackdrop = true;
  @Output() closeModal = new EventEmitter<void>();

  onBackdropClick(event: Event) {
    if (this.closeOnBackdrop) {
      this.closeModal.emit();
    }
  }

  onClose() {
    this.closeModal.emit();
  }
}
