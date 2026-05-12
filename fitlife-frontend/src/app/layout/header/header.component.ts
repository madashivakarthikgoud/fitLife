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
    const name = this.authService.currentUser()?.fullName?.split(' ')[0] || '';
    const nameStr = name ? `, ${name}` : '';
    if (hour < 12) return `Good morning${nameStr}! Ready to get stronger?`;
    if (hour < 17) return `Good afternoon${nameStr}! Let's crush those goals!`;
    return `Good evening${nameStr}! Time to wind down or work out?`;
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }
}
