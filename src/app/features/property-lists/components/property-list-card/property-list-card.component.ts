import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PropertyList } from '../../../../shared/models/property-list-models';

@Component({
  selector: 'app-property-list-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './property-list-card.component.html',
  styleUrl: './property-list-card.component.css',
})
export class PropertyListCardComponent {
  list = input.required<PropertyList>();
  delete = output<string>();
  activate = output<string>();

  onDelete(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.delete.emit(this.list().uuid);
  }

  onActivate(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.activate.emit(this.list().uuid);
  }
}
