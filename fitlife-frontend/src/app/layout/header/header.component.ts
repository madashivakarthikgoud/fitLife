import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="header">
      <div class="header-greeting">
        <span class="greeting-text">{{ greeting }}</span>
      </div>
      <div class="header-actions">
        <button class="header-icon-btn" id="btn-search" title="Search">
          <span class="material-icons-round">search</span>
        </button>
        <button class="header-icon-btn" id="btn-notifications" title="Notifications">
          <span class="material-icons-round">notifications_none</span>
        </button>
        <button class="avatar-btn" id="btn-avatar" (click)="goToProfile()" title="Profile">
          <span class="avatar-initials">{{ authService.getInitials() }}</span>
        </button>
      </div>
    </header>
  `,
  styles: [`
    .header {
      height: var(--header-height);
      background: var(--bg-primary);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .greeting-text {
      font-size: var(--font-size-base);
      font-weight: 600;
      color: var(--text-primary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .header-icon-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background: var(--bg-card);
      color: var(--text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition-fast);
      border: 1px solid var(--border-color);

      .material-icons-round { font-size: 20px; }

      &:hover {
        background: var(--bg-card-hover);
        color: var(--text-primary);
        border-color: var(--green-primary);
      }
    }

    .avatar-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-full);
      background: var(--green-primary);
      color: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: var(--font-size-sm);
      transition: all var(--transition-fast);
      border: 2px solid transparent;

      &:hover {
        border-color: var(--green-light);
        transform: scale(1.05);
      }
    }
  `]
})
export class HeaderComponent {
  authService = inject(AuthService);
  private router = inject(Router);

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning! Ready to get stronger? 🔥';
    if (hour < 17) return "Good afternoon! Let's crush those goals! 💪";
    return "Good evening! Time to wind down or work out? 🌙";
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
