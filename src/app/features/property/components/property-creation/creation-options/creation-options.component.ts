import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface CreationOption {
  title: string;
  description: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-creation-options',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './creation-options.component.html',
  styleUrl: './creation-options.component.css',
})
export class CreationOptionsComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  options: CreationOption[] = [
    {
      title: 'Manual Entry',
      description: 'Enter property details manually using a form',
      icon: '✏️',
      route: 'manual',
    },
    {
      title: 'From URL or Text',
      description: 'Extract property details from Rightmove/Zoopla URL or text',
      icon: '🔗',
      route: 'url-text',
    },
    {
      title: 'Search Rightmove',
      description: 'Bulk create properties from Rightmove search criteria',
      icon: '🔍',
      route: 'search',
    },
  ];

  selectOption(option: CreationOption) {
    this.router.navigate([option.route], { relativeTo: this.route });
  }
}
