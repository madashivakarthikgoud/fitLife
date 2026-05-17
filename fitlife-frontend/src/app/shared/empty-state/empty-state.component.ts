import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  template: `
    <div class="empty-state">
      <div class="empty-icon">
        <span class="material-icons-round">{{ icon }}</span>
      </div>
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-subtitle">{{ subtitle }}</p>
      @if (actionLabel) {
        <button class="btn btn-primary empty-action" (click)="action.emit()">
          <span class="material-icons-round">add</span>
          {{ actionLabel }}
        </button>
      }
    </div>
  `,
  styles: [`
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 2rem;
      text-align: center;
      animation: fadeInUp 0.5s ease forwards;
    }

    .empty-icon {
      margin-bottom: 1rem;
      opacity: 0.5;
      .material-icons-round { font-size: 4rem; color: var(--text-muted); }
    }

    .empty-title {
      font-size: var(--font-size-lg);
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .empty-subtitle {
      font-size: var(--font-size-base);
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
      max-width: 350px;
    }

    .empty-action {
      font-size: var(--font-size-base);
      padding: 0.7rem 1.5rem;
    }
  `]
})
export class EmptyStateComponent {
  @Input() icon = 'inbox';
  @Input() title = 'Nothing here yet';
  @Input() subtitle = 'Get started by adding your first entry.';
  @Input() actionLabel = '';
  @Output() action = new EventEmitter<void>();
}
