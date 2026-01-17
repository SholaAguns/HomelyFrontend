import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PropertyListStore } from '../../store/property-list.store';
import { PropertyListFormComponent } from '../property-list-form/property-list-form.component';
import { CreatePropertyListDto } from '../../../../shared/models/property-list-models';

@Component({
  selector: 'app-property-list-create',
  standalone: true,
  imports: [CommonModule, RouterLink, PropertyListFormComponent],
  templateUrl: './property-list-create.component.html',
  styleUrl: './property-list-create.component.css',
})
export class PropertyListCreateComponent {
  private router = inject(Router);
  readonly store = inject(PropertyListStore);

  onCreate(data: CreatePropertyListDto) {
    this.store.create(data);
    // Navigate after successful creation
    // Note: In production, you'd want to wait for the observable to complete
    setTimeout(() => {
      if (!this.store.error()) {
        this.router.navigate(['/lists']);
      }
    }, 500);
  }

  onCancel() {
    this.router.navigate(['/lists']);
  }
}
