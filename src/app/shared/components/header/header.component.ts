import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UiStore } from '../../../core/stores/ui.store';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  protected readonly uiStore = inject(UiStore);

  onToggleSidebar(): void {
    this.uiStore.toggleSidebar();
  }

  onToggleTheme(): void {
    this.uiStore.toggleTheme();
  }
}
