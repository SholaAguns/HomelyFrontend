import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingCriteriaFormComponent } from '../../../projects/components/rating-criteria-form/rating-criteria-form.component';

@Component({
  selector: 'app-rating-criteria-create',
  standalone: true,
  imports: [CommonModule, RatingCriteriaFormComponent],
  templateUrl: './rating-criteria-create.component.html',
  styleUrl: './rating-criteria-create.component.css',
})
export class RatingCriteriaCreateComponent {}
