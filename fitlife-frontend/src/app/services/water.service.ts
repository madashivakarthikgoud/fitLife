import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { FitnessCalculatorService } from './fitness-calculator.service';

export interface WaterLog {
  id: number;
  amountMl: number;
  date: string;
}

@Injectable({ providedIn: 'root' })
export class WaterService {
  /** Today's water logs only - resets each day */
  logs = signal<WaterLog[]>([]);
  /** Historical water logs for history page */
  historyLogs = signal<WaterLog[]>([]);
  private apiUrl = `${environment.apiUrl}/water`;
  private authService = inject(AuthService);
  private calc = inject(FitnessCalculatorService);

  constructor(private http: HttpClient, private toast: ToastService) {}

  /** Reactive signal for daily goal */
  readonly dailyGoalMlSignal = computed(() => {
    const user = this.authService.currentUser();
    return user ? this.calc.calcWaterGoalMl(user) : 2000;
  });

  /** Non-signal getter for backward compatibility */
  get dailyGoalMl(): number {
    return this.dailyGoalMlSignal();
  }

  /** Reactive signal for today's total */
  readonly todayTotalMlSignal = computed(() =>
    this.logs().reduce((s, l) => s + l.amountMl, 0)
  );

  get todayTotalMl(): number {
    return this.todayTotalMlSignal();
  }

  get todayLogs(): WaterLog[] {
    return this.logs();
  }

  /** Reactive signal for progress percentage */
  readonly progressPctSignal = computed(() => {
    const goal = this.dailyGoalMlSignal();
    if (goal === 0) return 0;
    return Math.min(100, Math.round((this.todayTotalMlSignal() / goal) * 100));
  });

  get progressPct(): number {
    return this.progressPctSignal();
  }

  loadTodayLogs(): void {
    this.http.get<WaterLog[]>(this.apiUrl).subscribe({
      next: (data) => this.logs.set(data),
      error: (err) => this.toast.error(err.error?.error || 'Failed to load water logs')
    });
  }

  /** Load water logs for a date range (for history page) */
  loadHistory(start: string, end: string): void {
    this.http.get<WaterLog[]>(`${this.apiUrl}/history`, { params: { start, end } }).subscribe({
      next: (data) => this.historyLogs.set(data),
      error: (err) => this.toast.error(err.error?.error || 'Failed to load water history')
    });
  }

  addLog(amountMl: number): Promise<WaterLog> {
    return new Promise((resolve, reject) => {
      this.http.post<WaterLog>(this.apiUrl, { amountMl }).subscribe({
        next: (log) => {
          this.logs.update(list => [log, ...list]);
          resolve(log);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to log water');
          reject(err);
        }
      });
    });
  }

  deleteLog(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.logs.update(list => list.filter(l => l.id !== id)),
      error: (err) => this.toast.error(err.error?.error || 'Failed to delete log')
    });
  }
}
