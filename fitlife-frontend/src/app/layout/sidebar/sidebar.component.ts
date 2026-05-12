import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <aside class="sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <span class="material-icons-round logo-icon">fitness_center</span>
          <span class="logo-text">FitLife</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <a routerLink="/dashboard" routerLinkActive="active" class="nav-item" id="nav-dashboard">
          <span class="material-icons-round">dashboard</span>
          <span class="nav-label">Dashboard</span>
        </a>
        <a routerLink="/workouts" routerLinkActive="active" class="nav-item" id="nav-workouts">
          <span class="material-icons-round">fitness_center</span>
          <span class="nav-label">Workouts</span>
        </a>
        <a routerLink="/nutrition" routerLinkActive="active" class="nav-item" id="nav-nutrition">
          <span class="material-icons-round">restaurant</span>
          <span class="nav-label">Nutrition</span>
        </a>
        <a routerLink="/goals" routerLinkActive="active" class="nav-item" id="nav-goals">
          <span class="material-icons-round">flag</span>
          <span class="nav-label">Goals</span>
        </a>
        <a routerLink="/history" routerLinkActive="active" class="nav-item" id="nav-history">
          <span class="material-icons-round">history</span>
          <span class="nav-label">History</span>
        </a>
        <a routerLink="/water" routerLinkActive="active" class="nav-item" id="nav-water">
          <span class="material-icons-round">local_drink</span>
          <span class="nav-label">Hydration</span>
        </a>
        <a routerLink="/profile" routerLinkActive="active" class="nav-item" id="nav-profile">
          <span class="material-icons-round">person</span>
          <span class="nav-label">Profile</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <p class="motivational-text">Ready to crush your goals?</p>
        <p class="motivational-sub">Every rep counts!</p>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      background: var(--bg-sidebar);
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 100;
      overflow-y: auto;
    }
    .sidebar-header {
      padding: 1.2rem;
      border-bottom: 1px solid var(--border-color);
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }
    .logo-icon {
      color: var(--green-primary);
      font-size: 1.6rem;
    }
    .logo-text {
      font-size: var(--font-size-lg);
      font-weight: 800;
      color: var(--green-primary);
      letter-spacing: -0.5px;
    }
    .sidebar-nav {
      flex: 1;
      padding: 0.8rem 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.7rem 1rem;
      border-radius: var(--radius-md);
      color: var(--text-secondary);
      font-size: var(--font-size-base);
      font-weight: 500;
      transition: all var(--transition-fast);
      cursor: pointer;
      .material-icons-round { font-size: 20px; }
      &:hover {
        background: var(--green-bg);
        color: var(--text-primary);
      }
      &.active {
        background: var(--green-primary);
        color: #000;
        font-weight: 600;
        .material-icons-round { color: #000; }
      }
    }
    .sidebar-footer {
      padding: 1.2rem;
      border-top: 1px solid var(--border-color);
    }
    .motivational-text {
      font-size: var(--font-size-sm);
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.15rem;
    }
    .motivational-sub {
      font-size: var(--font-size-xs);
      color: var(--text-muted);
    }
  `]
})
export class SidebarComponent {
  authService = inject(AuthService);
}

