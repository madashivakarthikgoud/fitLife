import { Component, inject } from '@angular/core';
import { InsightsService, Insight } from '../../services/insights.service';

@Component({
  selector: 'app-insights-panel',
  standalone: true,
  template: `
    <div class="insights-panel">
      <div class="panel-header">
        <h3 class="card-title">
          <span class="material-icons-round ai-icon">auto_awesome</span>
          AI Insights
        </h3>
        <button class="refresh-btn" (click)="refresh()" [disabled]="insightsService.loading()" title="Refresh insights">
          <span class="material-icons-round" [class.spinning]="insightsService.loading()">refresh</span>
        </button>
      </div>

      @if (insightsService.loading()) {
        <div class="loading-state">
          <span class="material-icons-round spinning">auto_awesome</span>
          <p>Analyzing your data...</p>
        </div>
      } @else if (insightsService.insights().length === 0) {
        <div class="empty-state">
          <span class="material-icons-round empty-icon">insights</span>
          <p class="empty-title">Building Your Profile</p>
          <p class="empty-sub">Log a few more days of activity and the AI will start generating personalized insights for you.</p>
        </div>
      } @else {
        <div class="insights-list">
          @for (insight of insightsService.insights(); track insight.id) {
            <div class="insight-card" [class]="'severity-' + insight.severity">
              <div class="insight-type-icon">
                <span class="material-icons-round">{{ getTypeIcon(insight.type) }}</span>
              </div>
              <div class="insight-content">
                <div class="insight-header-row">
                  <span class="insight-title">{{ insight.title }}</span>
                  <span class="insight-badge" [class]="insight.severity">{{ getBadgeText(insight.severity) }}</span>
                </div>
                <p class="insight-message">{{ insight.message }}</p>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .insights-panel { }

    .panel-header {
      display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;
    }
    .card-title {
      font-size: var(--font-size-md); font-weight: 700;
      display: flex; align-items: center; gap: 0.5rem; margin: 0;
    }
    .ai-icon { color: #a78bfa; font-size: 20px; }

    .refresh-btn {
      background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); padding: 0.4rem; cursor: pointer;
      color: var(--text-secondary); transition: all 0.2s; display: flex; align-items: center;
      &:hover { border-color: #a78bfa; color: #a78bfa; }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
      .material-icons-round { font-size: 18px; }
    }

    .spinning { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .loading-state {
      display: flex; flex-direction: column; align-items: center; gap: 0.75rem;
      padding: 2rem; color: var(--text-muted);
      .material-icons-round { font-size: 2rem; color: #a78bfa; }
      p { font-size: var(--font-size-sm); }
    }

    .empty-state { text-align: center; padding: 2rem 1rem; }
    .empty-icon { font-size: 2.5rem; display: block; margin-bottom: 0.5rem; color: var(--text-muted); }
    .empty-title { font-weight: 700; font-size: var(--font-size-base); margin-bottom: 0.3rem; }
    .empty-sub { font-size: var(--font-size-xs); color: var(--text-muted); max-width: 280px; margin: 0 auto; }

    .insights-list { display: flex; flex-direction: column; gap: 0.6rem; }

    .insight-card {
      display: flex; align-items: flex-start; gap: 0.75rem;
      padding: 0.85rem 1rem; border-radius: var(--radius-md);
      background: var(--bg-tertiary); border-left: 3px solid transparent;
      transition: all 0.2s;
      &:hover { background: var(--bg-input); }
      &.severity-success { border-left-color: #4ade80; }
      &.severity-warning { border-left-color: #fbbf24; }
      &.severity-info { border-left-color: #60a5fa; }
      &.severity-tip { border-left-color: #a78bfa; }
    }

    .insight-type-icon {
      width: 32px; height: 32px; border-radius: var(--radius-sm);
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      background: var(--bg-input);
      .material-icons-round { font-size: 18px; color: var(--text-secondary); }
    }

    .insight-content { flex: 1; min-width: 0; }
    .insight-header-row { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.25rem; }
    .insight-title { font-size: var(--font-size-sm); font-weight: 700; color: var(--text-primary); }
    .insight-message {
      font-size: var(--font-size-xs); color: var(--text-secondary);
      line-height: 1.5; margin: 0;
    }

    .insight-badge {
      font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem;
      border-radius: var(--radius-sm); white-space: nowrap; flex-shrink: 0;
      text-transform: uppercase; letter-spacing: 0.03em;
      &.success { background: rgba(74, 222, 128, 0.15); color: #4ade80; }
      &.warning { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
      &.info { background: rgba(96, 165, 250, 0.15); color: #60a5fa; }
      &.tip { background: rgba(167, 139, 250, 0.15); color: #a78bfa; }
    }
  `]
})
export class InsightsPanelComponent {
  insightsService = inject(InsightsService);

  refresh(): void {
    this.insightsService.generateInsights();
  }

  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      nutrition: 'restaurant',
      workout: 'fitness_center',
      water: 'water_drop',
      goal: 'flag',
      anomaly: 'warning'
    };
    return icons[type] || 'insights';
  }

  getBadgeText(severity: string): string {
    const badges: Record<string, string> = {
      success: 'Great',
      warning: 'Warning',
      info: 'Info',
      tip: 'Tip'
    };
    return badges[severity] || severity;
  }
}
