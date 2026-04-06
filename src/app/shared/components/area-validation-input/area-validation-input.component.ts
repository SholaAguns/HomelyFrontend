import { Component, Input, Output, EventEmitter, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
import { ValidationService } from '../../../core/services/validation-service/validation.service';

@Component({
  selector: 'app-area-validation-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="area-validation-input">
      <label class="mb-1 block text-sm font-medium">
        Area
        @if (required) {
          <span class="text-red-500">*</span>
        }
      </label>

      <div class="relative">
        <input
          type="text"
          [(ngModel)]="areaValue"
          (ngModelChange)="onInputChange($event)"
          [class.border-red-500]="error()"
          [class.border-green-500]="isValid()"
          class="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:outline-none"
          placeholder="e.g., Manchester, London, SW1A 1AA"
        />
        <div class="absolute top-2.5 right-3">
          @if (validating()) {
            <div class="h-5 w-5 animate-spin rounded-full border-b-2 border-blue-600"></div>
          }
          @if (isValid()) {
            <span class="text-green-500">✓</span>
          }
        </div>
      </div>

      @if (error()) {
        <div class="mt-2">
          <p class="text-sm text-red-500">{{ error() }}</p>
          @if (suggestions().length > 0) {
            <div class="mt-2">
              <p class="text-sm text-gray-600">Did you mean:</p>
              <ul class="mt-1 space-y-1">
                @for (suggestion of suggestions(); track suggestion) {
                  <li
                    (click)="selectSuggestion(suggestion)"
                    class="cursor-pointer text-sm text-blue-600 hover:underline"
                  >
                    {{ suggestion }}
                  </li>
                }
              </ul>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class AreaValidationInputComponent implements OnDestroy {
  private validationService = inject(ValidationService);
  private inputSubject = new Subject<string>();

  @Input() value = '';
  @Input() required = false;
  @Output() valueChange = new EventEmitter<string>();
  @Output() validationChange = new EventEmitter<boolean>();

  areaValue = '';
  validating = signal(false);
  isValid = signal(false);
  error = signal<string | null>(null);
  suggestions = signal<string[]>([]);

  constructor() {
    this.inputSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((area) => {
          if (!area || area.trim().length === 0) {
            this.isValid.set(false);
            this.error.set(null);
            this.suggestions.set([]);
            this.validationChange.emit(false);
            return of(null);
          }

          this.validating.set(true);
          this.error.set(null);
          this.suggestions.set([]);

          return this.validationService.validateArea(area).pipe(
            catchError(() => {
              this.validating.set(false);
              this.error.set('Validation service unavailable');
              this.isValid.set(false);
              this.validationChange.emit(false);
              return of(null);
            })
          );
        })
      )
      .subscribe((response) => {
        this.validating.set(false);

        if (response) {
          if (response.valid) {
            this.isValid.set(true);
            this.error.set(null);
            this.suggestions.set([]);
            this.validationChange.emit(true);
          } else {
            this.isValid.set(false);
            this.error.set(response.message || 'Invalid area');
            this.suggestions.set(response.suggestions || []);
            this.validationChange.emit(false);
          }
        }
      });

    this.areaValue = this.value;
  }

  ngOnDestroy() {
    this.inputSubject.complete();
  }

  onInputChange(value: string) {
    this.areaValue = value;
    this.valueChange.emit(value);
    this.inputSubject.next(value);
  }

  selectSuggestion(suggestion: string) {
    this.areaValue = suggestion;
    this.valueChange.emit(suggestion);
    this.inputSubject.next(suggestion);
  }
}
