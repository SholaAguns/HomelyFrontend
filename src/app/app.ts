import { Component, inject, OnInit } from '@angular/core';
import { LayoutShellComponent } from './shared/components/layout/layout-shell.component';
import { AuthStore } from './core/stores/auth-store/auth.store';
import { UiStore } from './core/stores/ui.store';

@Component({
  selector: 'app-root',
  imports: [LayoutShellComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authStore = inject(AuthStore);
  private uiStore = inject(UiStore);

  ngOnInit() {
    this.authStore.initialize();
    this.uiStore.initializeFromStorage();
  }
}
