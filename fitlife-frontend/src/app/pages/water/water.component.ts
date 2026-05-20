import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WaterService } from '../../services/water.service';
import { ToastService } from '../../services/toast.service';
import { ProgressRingComponent } from '../../shared/progress-ring/progress-ring.component';

@Component({
  selector: 'app-water',
  standalone: true,
  imports: [FormsModule, ProgressRingComponent],
  template: `
    <div class="water-page">
      <div class="page-header">
        <div>
          <h1 class="page-title">Hydration</h1>
          <p class="page-subtitle">Stay hydrated, stay healthy</p>
        </div>
      </div>

      <div class="water-layout">
        <!-- Progress Card -->
        <div class="card progress-card">
          <app-progress-ring [percentage]="waterService.progressPctSignal()" [size]="140" color="#3b82f6" label="Hydration" />
          <div class="progress-info">
            <div class="water-amount">{{ (waterService.todayTotalMlSignal() / 1000).toFixed(2) }}L</div>
            <div class="water-goal">of {{ (waterService.dailyGoalMlSignal() / 1000).toFixed(1) }}L goal</div>
            <div class="water-status" [class.goal-met]="waterService.progressPctSignal() >= 100">
              {{ waterService.progressPctSignal() >= 100 ? 'Goal reached!' : (waterService.dailyGoalMlSignal() - waterService.todayTotalMlSignal()) + 'ml remaining' }}
            </div>
          </div>
        </div>

        <!-- Quick Add Card -->
        <div class="card quick-add-card">
          <h3 class="section-title">Quick Add</h3>
          <div class="quick-btns">
            <button class="quick-btn" (click)="addWater(200)">
              <span class="material-icons-round water-icon">local_drink</span>
              <span class="quick-amount">200ml</span>
              <span class="quick-label">Small glass</span>
            </button>
            <button class="quick-btn" (click)="addWater(330)">
              <span class="material-icons-round water-icon">sports_bar</span>
              <span class="quick-amount">330ml</span>
              <span class="quick-label">Can</span>
            </button>
            <button class="quick-btn" (click)="addWater(500)">
              <span class="material-icons-round water-icon">water_drop</span>
              <span class="quick-amount">500ml</span>
              <span class="quick-label">Bottle</span>
            </button>
            <button class="quick-btn" (click)="addWater(750)">
              <span class="material-icons-round water-icon">emoji_food_beverage</span>
              <span class="quick-amount">750ml</span>
              <span class="quick-label">Large bottle</span>
            </button>
          </div>

          <div class="custom-add">
            <label>Custom amount (ml)</label>
            <div class="custom-row">
              <input type="number" [(ngModel)]="customMl" placeholder="e.g. 400" min="1" max="2000" />
              <button class="btn btn-primary" (click)="addCustom()" [disabled]="!customMl || customMl <= 0">Add</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Today's Log -->
      <div class="card log-card">
        <h3 class="section-title">Today's Log</h3>
        @if (waterService.todayLogs.length === 0) {
          <div class="empty-log">
            <span class="material-icons-round empty-icon">water_drop</span>
            <p>No water logged yet. Stay hydrated!</p>
          </div>
        } @else {
          <div class="log-list">
            @for (log of waterService.todayLogs; track log.id) {
              <div class="log-item">
                <span class="material-icons-round log-icon">water_drop</span>
                <span class="log-amount">{{ log.amountMl }}ml</span>
                <button class="btn-icon delete" (click)="deleteLog(log.id)">
                  <span class="material-icons-round">delete</span>
                </button>
              </div>
            }
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .water-page { padding: 0; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
    .page-title { font-size: var(--font-size-2xl); font-weight: 700; }
    .page-subtitle { color: var(--text-secondary); margin-top: 0.2rem; }

    .water-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem; }
    @media (max-width: 768px) { .water-layout { grid-template-columns: 1fr; } }

    .progress-card {
      display: flex; flex-direction: column; align-items: center; gap: 1rem;
      padding: 2rem; text-align: center;
    }
    .water-amount { font-size: 2.5rem; font-weight: 800; color: #3b82f6; }
    .water-goal { color: var(--text-secondary); font-size: var(--font-size-base); }
    .water-status { margin-top: 0.5rem; font-weight: 600; color: var(--text-secondary); }
    .water-status.goal-met { color: #4ade80; }

    .quick-add-card { padding: 1.5rem; }
    .section-title { font-size: var(--font-size-lg); font-weight: 700; margin-bottom: 1rem; }

    .quick-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
    .quick-btn {
      display: flex; flex-direction: column; align-items: center; gap: 0.3rem;
      padding: 1rem 0.5rem; background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s;
      &:hover { background: rgba(59,130,246,0.1); border-color: #3b82f6; }
    }
    .water-icon { font-size: 1.8rem; color: #3b82f6; }
    .quick-amount { font-size: var(--font-size-base); font-weight: 700; color: #3b82f6; }
    .quick-label { font-size: var(--font-size-xs); color: var(--text-muted); }

    .custom-add label { display: block; font-size: var(--font-size-sm); color: var(--text-secondary); margin-bottom: 0.5rem; font-weight: 600; }
    .custom-row { display: flex; gap: 0.75rem; align-items: center; }
    .custom-row input {
      flex: 1; padding: 0.65rem 0.9rem; background: var(--bg-tertiary); border: 1px solid var(--border-color);
      border-radius: var(--radius-md); color: var(--text-primary); font-size: var(--font-size-base);
      outline: none; transition: border-color 0.2s;
      &:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
      &::placeholder { color: var(--text-muted); }
    }
    .custom-row .btn { white-space: nowrap; padding: 0.65rem 1.2rem; }

    .log-card { padding: 1.5rem; }
    .empty-log { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; color: var(--text-muted); }
    .empty-icon { font-size: 2.5rem; }
    .log-list { display: flex; flex-direction: column; gap: 0.5rem; }
    .log-item {
      display: flex; align-items: center; gap: 1rem; padding: 0.75rem 1rem;
      background: var(--bg-tertiary); border-radius: var(--radius-md);
    }
    .log-icon { color: #3b82f6; }
    .log-amount { flex: 1; font-weight: 600; color: #3b82f6; }
    .btn-icon.delete { background: none; border: none; cursor: pointer; color: var(--text-muted);
      &:hover { color: #ef4444; }
    }
  `]
})
export class WaterComponent implements OnInit {
  waterService = inject(WaterService);
  private toast = inject(ToastService);
  customMl: number | null = null;

  ngOnInit(): void {
    this.waterService.loadTodayLogs();
  }

  async addWater(ml: number): Promise<void> {
    await this.waterService.addLog(ml);
    this.toast.success(`Added ${ml}ml`);
  }

  async addCustom(): Promise<void> {
    if (!this.customMl || this.customMl <= 0) return;
    await this.waterService.addLog(this.customMl);
    this.toast.success(`Added ${this.customMl}ml`);
    this.customMl = null;
  }

  deleteLog(id: number): void {
    this.waterService.deleteLog(id);
    this.toast.info('Log removed');
  }
}
