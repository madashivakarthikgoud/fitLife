import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    @for (toast of toastService.toasts(); track toast.id) {
      <div class="toast toast-{{ toast.type }}" (click)="toastService.dismiss(toast.id)">
        <span class="toast-icon">
          @switch (toast.type) {
            @case ('success') { ✅ }
            @case ('error') { ❌ }
            @case ('warning') { ⚠️ }
            @case ('info') { ℹ️ }
          }
        </span>
        <span class="toast-message">{{ toast.message }}</span>
        <button class="toast-close" (click)="toastService.dismiss(toast.id)">
          <span class="material-icons-round">close</span>
        </button>
      </div>
    }
  `,
  styles: [`
    :host {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 10000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      pointer-events: none;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.8rem 1.2rem;
      border-radius: var(--radius-md);
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      color: var(--text-primary);
      min-width: 300px;
      max-width: 450px;
      box-shadow: var(--shadow-elevated);
      animation: slideInRight 0.3s ease forwards;
      pointer-events: all;
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.9;
      }
    }

    .toast-success { border-left: 3px solid var(--green-primary); }
    .toast-error { border-left: 3px solid var(--red-primary); }
    .toast-warning { border-left: 3px solid var(--yellow-primary); }
    .toast-info { border-left: 3px solid var(--blue-primary); }

    .toast-icon {
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
      font-size: var(--font-size-sm);
      font-weight: 500;
    }

    .toast-close {
      background: none;
      color: var(--text-muted);
      padding: 2px;
      display: flex;
      align-items: center;
      flex-shrink: 0;

      .material-icons-round { font-size: 16px; }

      &:hover { color: var(--text-primary); }
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }
  `]
})
export class ToastComponent {
  toastService = inject(ToastService);
}
