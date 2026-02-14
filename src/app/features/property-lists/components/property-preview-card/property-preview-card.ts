import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Property } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-preview-card.html',
  styleUrl: './property-preview-card.css',
})
export class PropertyPreviewCard {
  private router = inject(Router);

  property = input.required<Property>();

  viewDetails(): void {
    this.router.navigate(['/properties', this.property().uuid]);
  }
}
