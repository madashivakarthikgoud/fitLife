import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

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
  caloriesBurned: number;
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
  workouts = signal<Workout[]>([]);
  private apiUrl = `${environment.apiUrl}/workouts`;

  constructor(private http: HttpClient) {}

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

  loadWorkouts(): void {
    this.http.get<Workout[]>(this.apiUrl).subscribe({
      next: (data) => this.workouts.set(data)
    });
  }

  addWorkout(workout: Partial<Workout>): Promise<Workout> {
    return new Promise((resolve, reject) => {
      this.http.post<Workout>(this.apiUrl, workout).subscribe({
        next: (w) => {
          this.workouts.update(list => [w, ...list]);
          resolve(w);
        },
        error: reject
      });
    });
  }

  updateWorkout(id: number, updates: Partial<Workout>): Promise<Workout> {
    return new Promise((resolve, reject) => {
      this.http.put<Workout>(`${this.apiUrl}/${id}`, updates).subscribe({
        next: (w) => {
          this.workouts.update(list => list.map(x => x.id === id ? w : x));
          resolve(w);
        },
        error: reject
      });
    });
  }

  deleteWorkout(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.workouts.update(list => list.filter(w => w.id !== id))
    });
  }

  getTodayWorkouts(): Workout[] {
    const today = new Date().toISOString().split('T')[0];
    return this.workouts().filter(w => w.date?.split('T')[0] === today);
  }

  getTotalCaloriesBurned(): number {
    return this.getTodayWorkouts().reduce((sum, w) => sum + w.caloriesBurned, 0);
  }

  getWorkoutCount(): number {
    return this.getTodayWorkouts().length;
  }

  getWorkoutsByDateRange(start: string, end: string): Workout[] {
    return this.workouts().filter(w => {
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
      const count = this.workouts().filter(w => w.date?.split('T')[0] === dateStr).length;
      result.push({ label: dayName, count });
    }
    return result;
  }
}
