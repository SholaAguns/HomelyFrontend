import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../../../shared/models/property-models';

@Component({
  selector: 'app-property-preview-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './property-preview-card.html',
  styleUrl: './property-preview-card.css',
})
export class PropertyPreviewCard {
  property = input.required<Property>();
}
