import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-left">
        <div class="auth-brand">
          <span class="material-icons-round brand-icon">fitness_center</span>
          <h1 class="brand-name">FitLife</h1>
          <p class="brand-tagline">Your personal fitness companion</p>
        </div>
        <div class="auth-features">
          <div class="feature">
            <span class="material-icons-round">fitness_center</span>
            <span>Track your workouts</span>
          </div>
          <div class="feature">
            <span class="material-icons-round">restaurant</span>
            <span>Log your nutrition</span>
          </div>
          <div class="feature">
            <span class="material-icons-round">trending_up</span>
            <span>Monitor your progress</span>
          </div>
          <div class="feature">
            <span class="material-icons-round">auto_awesome</span>
            <span>AI-powered insights</span>
          </div>
        </div>
      </div>
      <div class="auth-right">
        <div class="auth-card">
          <h2 class="auth-title">Welcome back!</h2>
          <p class="auth-subtitle">Sign in to continue your fitness journey</p>

          <form (ngSubmit)="onLogin()" class="auth-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                placeholder="Enter your email"
                required
                autocomplete="email"
              />
            </div>

            <div class="form-group">
              <label for="password">Password</label>
              <div class="password-wrapper">
                <input
                  [type]="showPassword ? 'text' : 'password'"
                  id="password"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="toggle-password" (click)="showPassword = !showPassword" tabindex="-1">
                  <span class="material-icons-round">{{ showPassword ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
            </div>

            <div class="form-extras">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="rememberMe" name="remember" />
                <span>Remember me</span>
              </label>
              <a routerLink="/forgot-password" class="forgot-link">Forgot password?</a>
            </div>

            <button type="submit" class="btn btn-primary auth-submit" id="btn-login" [disabled]="isLoading">
              @if (isLoading) {
                <span class="spinner"></span>
              } @else {
                <span class="material-icons-round">login</span>
              }
              Sign In
            </button>
          </form>

          <p class="auth-switch">
            Don't have an account?
            <a routerLink="/register" class="switch-link">Sign up free</a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    .auth-left {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #0a1a0a 0%, #0d2818 50%, #0a0a0f 100%);
      padding: 3rem;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 20%;
        left: 10%;
        width: 300px;
        height: 300px;
        background: radial-gradient(circle, rgba(74, 222, 128, 0.08) 0%, transparent 70%);
        border-radius: 50%;
      }

      &::after {
        content: '';
        position: absolute;
        bottom: 10%;
        right: 10%;
        width: 200px;
        height: 200px;
        background: radial-gradient(circle, rgba(74, 222, 128, 0.05) 0%, transparent 70%);
        border-radius: 50%;
      }
    }

    .auth-brand {
      text-align: center;
      margin-bottom: 3rem;
      animation: fadeInUp 0.6s ease forwards;
    }

    .brand-icon {
      font-size: 4rem !important;
      display: block;
      color: var(--green-primary);
      margin-bottom: 1rem;
    }

    .brand-name {
      font-size: 3rem;
      font-weight: 800;
      color: var(--green-primary);
      letter-spacing: -1px;
    }

    .brand-tagline {
      color: var(--text-secondary);
      font-size: var(--font-size-md);
      margin-top: 0.5rem;
    }

    .auth-features {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      animation: fadeInUp 0.8s ease forwards;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: var(--text-secondary);
      font-size: var(--font-size-base);

      .material-icons-round {
        color: var(--green-primary);
        font-size: 22px;
      }
    }

    .auth-right {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-xl);
      padding: 2.5rem;
      animation: scaleIn 0.4s ease forwards;
    }

    .auth-title {
      font-size: var(--font-size-2xl);
      font-weight: 700;
      margin-bottom: 0.3rem;
    }

    .auth-subtitle {
      color: var(--text-secondary);
      font-size: var(--font-size-base);
      margin-bottom: 2rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .password-wrapper {
      position: relative;
      display: flex;
      align-items: center;

      input {
        width: 100%;
        padding-right: 2.8rem;
      }
    }

    .toggle-password {
      position: absolute;
      right: 0.75rem;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      padding: 0;

      &:hover { color: var(--text-secondary); }
      .material-icons-round { font-size: 20px; }
    }

    .form-extras {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .checkbox-label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      cursor: pointer;

      input[type="checkbox"] {
        accent-color: var(--green-primary);
        width: 16px;
        height: 16px;
      }
    }

    .forgot-link {
      font-size: var(--font-size-sm);
      color: var(--green-primary);
      transition: color var(--transition-fast);
      &:hover { color: var(--green-light); }
    }

    .auth-submit {
      width: 100%;
      justify-content: center;
      padding: 0.8rem;
      font-size: var(--font-size-md);
      margin-top: 0.5rem;
      gap: 0.5rem;

      &:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid transparent;
      border-top-color: #000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
      flex-shrink: 0;
    }

    .auth-switch {
      text-align: center;
      margin-top: 1.5rem;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
    }

    .switch-link {
      color: var(--green-primary);
      font-weight: 600;
      margin-left: 0.3rem;
      &:hover { color: var(--green-light); }
    }

    @media (max-width: 768px) {
      .auth-left { display: none; }
    }
  `]
})
export class LoginComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

  email = '';
  password = '';
  rememberMe = false;
  isLoading = false;
  showPassword = false;

  async onLogin(): Promise<void> {
    if (!this.email.trim() || !this.password) {
      this.toastService.error('Please fill in all fields');
      return;
    }

    this.isLoading = true;
    const success = await this.authService.login(this.email.trim(), this.password);
    this.isLoading = false;

    if (success) {
      this.router.navigate(['/dashboard']);
    }
  }
}
