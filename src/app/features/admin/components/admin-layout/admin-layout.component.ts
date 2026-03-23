import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import {
  LayoutDashboard,
  Home,
  List,
  Database,
  Clock,
  School,
  Signal,
  MapPin,
  LucideAngularModule,
} from 'lucide-angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive, LucideAngularModule],
  template: `
    <div class="flex min-h-screen bg-gray-100">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-lg">
        <div class="p-6">
          <h2 class="text-xl font-bold text-gray-900">Admin Panel</h2>
        </div>
        <nav class="space-y-1 px-3">
          <a
            routerLink="/admin/dashboard"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="LayoutDashboard" class="h-5 w-5"></lucide-angular>
            Dashboard
          </a>

          <div class="py-2">
            <p class="px-3 text-xs font-semibold text-gray-500 uppercase">Core Data</p>
          </div>

          <a
            routerLink="/admin/properties"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="Home" class="h-5 w-5"></lucide-angular>
            Properties
          </a>

          <a
            routerLink="/admin/lists"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="List" class="h-5 w-5"></lucide-angular>
            Property Lists
          </a>

          <a
            routerLink="/admin/context-data"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="Database" class="h-5 w-5"></lucide-angular>
            Context Data
          </a>

          <a
            routerLink="/admin/tasks"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="Clock" class="h-5 w-5"></lucide-angular>
            Tasks
          </a>

          <div class="py-2">
            <p class="px-3 text-xs font-semibold text-gray-500 uppercase">Reference Data</p>
          </div>

          <a
            routerLink="/admin/schools"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="School" class="h-5 w-5"></lucide-angular>
            Schools
          </a>

          <a
            routerLink="/admin/connectivity"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="Signal" class="h-5 w-5"></lucide-angular>
            Connectivity
          </a>

          <a
            routerLink="/admin/pois"
            routerLinkActive="bg-blue-50 text-blue-700"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <lucide-angular [img]="MapPin" class="h-5 w-5"></lucide-angular>
            Places of Interest
          </a>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 overflow-auto">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class AdminLayoutComponent {
  readonly LayoutDashboard = LayoutDashboard;
  readonly Home = Home;
  readonly List = List;
  readonly Database = Database;
  readonly Clock = Clock;
  readonly School = School;
  readonly Signal = Signal;
  readonly MapPin = MapPin;
}
