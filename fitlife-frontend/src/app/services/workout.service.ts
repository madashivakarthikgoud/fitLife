import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';

export interface Workout {
  id: number;
  exerciseName: string;
  exerciseType: string;
  sets: number | null;
  reps: number | null;
  weightLbs: number | null;
  durationMin: number | null;
  distanceKm: number | null;
  notes: string;
  date: string;
  caloriesBurned: number | null;
}

export type ExerciseCategory = 'Strength' | 'Cardio' | 'Flexibility' | 'HIIT' | 'Sports' | 'Other';

export interface FieldVisibility {
  sets: boolean;
  reps: boolean;
  weight: boolean;
  duration: boolean;
  distance: boolean;
}

@Injectable({ providedIn: 'root' })
export class WorkoutService {
  /** Today's workouts only - resets each day */
  workouts = signal<Workout[]>([]);
  /** Historical workouts for the history page */
  historyWorkouts = signal<Workout[]>([]);
  private apiUrl = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient, private toast: ToastService) {}

  getFieldVisibility(type: ExerciseCategory): FieldVisibility {
    switch (type) {
      case 'Strength':
        return { sets: true, reps: true, weight: true, duration: false, distance: false };
      case 'Cardio':
        return { sets: false, reps: false, weight: false, duration: true, distance: true };
      case 'Flexibility':
      case 'Sports':
        return { sets: false, reps: false, weight: false, duration: true, distance: false };
      case 'HIIT':
        return { sets: true, reps: true, weight: false, duration: true, distance: false };
      case 'Other':
      default:
        return { sets: true, reps: true, weight: true, duration: true, distance: true };
    }
  }

  /** Loads today's workouts only (daily reset) */
  loadWorkouts(): void {
    this.http.get<Workout[]>(this.apiUrl).subscribe({
      next: (data) => this.workouts.set(data),
      error: (err) => {
        const message = err.error?.error || 'Failed to load workouts';
        this.toast.error(message);
      }
    });
  }

  /** Load workouts for a date range (for history page) */
  loadHistory(start: string, end: string): void {
    this.http.get<Workout[]>(`${this.apiUrl}/history`, { params: { start, end } }).subscribe({
      next: (data) => this.historyWorkouts.set(data),
      error: (err) => this.toast.error(err.error?.error || 'Failed to load workout history')
    });
  }

  addWorkout(workout: Partial<Workout>): Promise<Workout> {
    return new Promise((resolve, reject) => {
      this.http.post<Workout>(this.apiUrl, workout).subscribe({
        next: (w) => {
          this.workouts.update(list => [w, ...list]);
          this.toast.success('Workout added successfully');
          resolve(w);
        },
        error: (err) => {
          const message = err.error?.error || 'Failed to add workout';
          this.toast.error(message);
          reject(err);
        }
      });
    });
  }

  updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout> {
    return new Promise((resolve, reject) => {
      this.http.put<Workout>(`${this.apiUrl}/${id}`, updates).subscribe({
        next: (w) => {
          this.workouts.update(list => list.map(x => x.id === id ? w : x));
          this.toast.success('Workout updated successfully');
          resolve(w);
        },
        error: (err) => {
          const message = err.error?.error || 'Failed to update workout';
          this.toast.error(message);
          reject(err);
        }
      });
    });
  }

  deleteWorkout(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.workouts.update(list => list.filter(w => w.id !== id));
        this.toast.success('Workout deleted successfully');
      },
      error: (err) => {
        const message = err.error?.error || 'Failed to delete workout';
        this.toast.error(message);
      }
    });
  }

  /** Today's workouts are already loaded via the default endpoint */
  getTodayWorkouts(): Workout[] {
    return this.workouts();
  }

  getTotalCaloriesBurned(): number {
    return this.workouts().reduce((sum, w) => sum + (w.caloriesBurned ?? 0), 0);
  }

  getWorkoutCount(): number {
    return this.workouts().length;
  }

  getWorkoutsByDateRange(start: string, end: string): Workout[] {
    return this.historyWorkouts().filter(w => {
      const d = w.date?.split('T')[0];
      return d && d >= start && d <= end;
    });
  }

  getWeeklyWorkoutCounts(): { label: string; count: number }[] {
    const result: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const count = this.historyWorkouts().filter(w => w.date?.split('T')[0] === dateStr).length;
      result.push({ label: dayName, count });
    }
    return result;
  }
}
