import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../../shared/models/property-models';

export type DeduplicationAction = 'view' | 'force_create' | 'cancel';

@Component({
  selector: 'app-deduplication-warning',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deduplication-warning.component.html',
  styleUrl: './deduplication-warning.component.css',
})
export class DeduplicationWarningComponent {
  // Inputs
  existingProperty = input.required<Property>();
  isOpen = input<boolean>(false);

  // Outputs
  actionSelected = output<DeduplicationAction>();

  onViewExisting() {
    this.actionSelected.emit('view');
  }

  onForceCreate() {
    this.actionSelected.emit('force_create');
  }

  onCancel() {
    this.actionSelected.emit('cancel');
  }
}
