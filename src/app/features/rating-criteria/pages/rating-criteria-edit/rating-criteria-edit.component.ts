import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RatingCriteriaFormComponent } from '../../../projects/components/rating-criteria-form/rating-criteria-form.component';

@Component({
  selector: 'app-rating-criteria-edit',
  standalone: true,
  imports: [CommonModule, RatingCriteriaFormComponent],
  templateUrl: './rating-criteria-edit.component.html',
  styleUrl: './rating-criteria-edit.component.css',
})
export class RatingCriteriaEditComponent {}
