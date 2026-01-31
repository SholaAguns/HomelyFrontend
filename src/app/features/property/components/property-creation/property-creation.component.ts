import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-property-creation',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './property-creation.component.html',
  styleUrl: './property-creation.component.css',
})
export class PropertyCreationComponent implements OnInit {
  private route = inject(ActivatedRoute);

  propertyListUuid = signal<string>('');

  ngOnInit() {
    const uuid = this.route.parent?.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.propertyListUuid.set(uuid);
    }
  }
}
