import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface WizardStep {
  label: string;
  completed: boolean;
}

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center justify-center">
      @for (step of steps; track $index; let isLast = $last) {
        <div class="flex items-center">
          <div class="flex flex-col items-center">
            <div
              [class.bg-blue-600]="$index < currentStep || step.completed"
              [class.bg-gray-300]="$index >= currentStep && !step.completed"
              [class.text-white]="$index < currentStep || step.completed"
              [class.text-gray-600]="$index >= currentStep && !step.completed"
              class="flex h-10 w-10 items-center justify-center rounded-full font-semibold"
            >
              @if (step.completed) {
                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              } @else {
                {{ $index + 1 }}
              }
            </div>
            <span
              [class.text-blue-600]="$index === currentStep"
              [class.text-gray-600]="$index !== currentStep"
              class="mt-2 text-sm font-medium"
            >
              {{ step.label }}
            </span>
          </div>

          @if (!isLast) {
            <div
              [class.bg-blue-600]="$index < currentStep"
              [class.bg-gray-300]="$index >= currentStep"
              class="mx-4 h-1 w-16"
            ></div>
          }
        </div>
      }
    </div>
  `,
})
export class ProgressIndicatorComponent {
  @Input() steps: WizardStep[] = [];
  @Input() currentStep = 0;
}
