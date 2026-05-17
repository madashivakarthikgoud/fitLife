import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="layout">
      <app-sidebar></app-sidebar>
      <div class="layout-main">
        <app-header></app-header>
        <main class="layout-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout {
      display: flex;
      min-height: 100vh;
    }

    .layout-main {
      flex: 1;
      margin-left: var(--sidebar-width);
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }

    .layout-content {
      flex: 1;
      padding: 1.5rem 2rem;
      animation: fadeIn 0.3s ease;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .layout-main {
        margin-left: 0;
      }
    }
  `]
})
export class MainLayoutComponent {}
