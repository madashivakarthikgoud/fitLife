import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface WeightLogEntry {
  id: number;
  weightKg: number;
  date: string;
  notes: string;
}

@Injectable({ providedIn: 'root' })
export class WeightLogService {
  logs = signal<WeightLogEntry[]>([]);
  private apiUrl = `${environment.apiUrl}/weight-logs`;

  constructor(private http: HttpClient, private toast: ToastService) {}

  get latestWeight(): number | null {
    const sorted = this.logs();
    return sorted.length > 0 ? sorted[0].weightKg : null;
  }

  get firstWeight(): number | null {
    const sorted = this.logs();
    return sorted.length > 0 ? sorted[sorted.length - 1].weightKg : null;
  }

  /** Compute real weight change: positive = gained, negative = lost */
  get weightChange(): number | null {
    if (this.logs().length < 2) return null;
    return Math.round((this.latestWeight! - this.firstWeight!) * 10) / 10;
  }

  /** Progress toward a weight goal: 0-100% */
  getWeightGoalProgress(startWeight: number, targetWeight: number): number {
    const latest = this.latestWeight;
    if (latest === null || startWeight === targetWeight) return 0;
    const totalChange = Math.abs(targetWeight - startWeight);
    const actualChange = Math.abs(latest - startWeight);
    // Check direction
    const isLosing = targetWeight < startWeight;
    const correctDirection = isLosing ? latest <= startWeight : latest >= startWeight;
    if (!correctDirection) return 0;
    return Math.min(100, Math.round((actualChange / totalChange) * 100));
  }

  loadHistory(): void {
    this.http.get<WeightLogEntry[]>(this.apiUrl).subscribe({
      next: (data) => this.logs.set(data),
      error: (err) => this.toast.error(err.error?.error || 'Failed to load weight history')
    });
  }

  logWeight(weightKg: number, date?: string, notes?: string): Promise<WeightLogEntry> {
    return new Promise((resolve, reject) => {
      this.http.post<WeightLogEntry>(this.apiUrl, { weightKg, date, notes }).subscribe({
        next: (log) => {
          this.logs.update(list => [log, ...list]);
          this.toast.success('Weight logged successfully');
          resolve(log);
        },
        error: (err) => {
          this.toast.error(err.error?.error || 'Failed to log weight');
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

