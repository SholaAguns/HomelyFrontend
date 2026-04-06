import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyList } from '../../../../shared/models/property-list-models';

@Component({
  selector: 'app-property-list-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-list-card.component.html',
  styleUrl: './property-list-card.component.css',
})
export class PropertyListCardComponent {
  private router = inject(Router);
  list = input.required<PropertyList>();

  onCardClick() {
    this.router.navigate(['/lists', this.list().uuid]);
  }
}
