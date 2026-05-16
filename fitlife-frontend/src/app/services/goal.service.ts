import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface Goal {
  id: number;
  title: string;
  type: 'weight' | 'calories' | 'workouts' | 'custom';
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline: string;
  createdAt: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class GoalService {
  goals = signal<Goal[]>([]);
  private apiUrl = `${environment.apiUrl}/goals`;

  constructor(private http: HttpClient, private toast: ToastService) {}

  loadGoals(): void {
    this.http.get<Goal[]>(this.apiUrl).subscribe({
      next: (data) => this.goals.set(data),
      error: (err) => {
        const message = err.error?.error || 'Failed to load goals';
        this.toast.error(message);
      }
    });
  }

  addGoal(goal: Partial<Goal>): Promise<Goal> {
    return new Promise((resolve, reject) => {
      this.http.post<Goal>(this.apiUrl, goal).subscribe({
        next: (g) => {
          this.goals.update(list => [...list, g]);
          this.toast.success('Goal created successfully');
          resolve(g);
        },
        error: (err) => {
          const message = err.error?.error || 'Failed to create goal';
          this.toast.error(message);
          reject(err);
        }
      });
    });
  }

  updateGoal(id: number, updates: Partial<Goal>): Promise<Goal> {
    return new Promise((resolve, reject) => {
      this.http.put<Goal>(`${this.apiUrl}/${id}`, updates).subscribe({
        next: (g) => {
          this.goals.update(list => list.map(x => x.id === id ? g : x));
          this.toast.success('Goal updated successfully');
          resolve(g);
        },
        error: (err) => {
          const message = err.error?.error || 'Failed to update goal';
          this.toast.error(message);
          reject(err);
        }
      });
    });
  }

  deleteGoal(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.goals.update(list => list.filter(g => g.id !== id));
        this.toast.success('Goal deleted successfully');
      },
      error: (err) => {
        const message = err.error?.error || 'Failed to delete goal';
        this.toast.error(message);
      }
    });
  }

  getActiveGoals(): Goal[] { return this.goals().filter(g => !g.completed); }
  getCompletedGoals(): Goal[] { return this.goals().filter(g => g.completed); }

  getOverallProgress(): number {
    const active = this.getActiveGoals();
    if (active.length === 0) return 0;
    const total = active.reduce((sum, g) => sum + Math.min(100, g.targetValue > 0 ? (g.currentValue / g.targetValue) * 100 : 0), 0);
    return Math.round(total / active.length);
  }

  getWeeksRemaining(goalId: number): number {
    const goal = this.goals().find(g => g.id === goalId);
    if (!goal) return 0;
    const diff = new Date(goal.deadline).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (7 * 24 * 60 * 60 * 1000)));
  }
}
