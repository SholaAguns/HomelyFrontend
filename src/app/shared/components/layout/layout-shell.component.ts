import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToasterComponent } from '../toaster/toaster.component';

@Component({
  selector: 'app-layout-shell',
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, ToasterComponent],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.css'
})
export class LayoutShellComponent {}
