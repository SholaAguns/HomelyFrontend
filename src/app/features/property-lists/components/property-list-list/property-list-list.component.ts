import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PropertyListStore } from '../../store/property-list.store';
import { PropertyListCardComponent } from '../property-list-card/property-list-card.component';

@Component({
  selector: 'app-property-list-list',
  standalone: true,
  imports: [CommonModule, PropertyListCardComponent],
  templateUrl: './property-list-list.component.html',
  styleUrl: './property-list-list.component.css',
})
export class PropertyListListComponent implements OnInit {
  private router = inject(Router);
  readonly store = inject(PropertyListStore);

  ngOnInit() {
    this.store.load(undefined);
  }

  navigateToCreate() {
    this.router.navigate(['/lists/new']);
  }
}
