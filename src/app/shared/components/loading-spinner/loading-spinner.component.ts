import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css',
})
export class LoadingSpinnerComponent {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() message?: string;

  get sizeClasses(): string {
    const sizes = {
      small: 'h-6 w-6 border-2',
      medium: 'h-12 w-12 border-b-2',
      large: 'h-16 w-16 border-b-4',
    };
    return sizes[this.size];
  }
}
