import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { WorkoutService, Workout, ExerciseCategory, FieldVisibility } from '../../services/workout.service';
import { ToastService } from '../../services/toast.service';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-workouts',
  standalone: true,
  imports: [FormsModule, EmptyStateComponent],
  templateUrl: './workouts.component.html',
  styleUrl: './workouts.component.scss'
})
export class WorkoutsComponent implements OnInit {
  workoutService = inject(WorkoutService);
  private toastService = inject(ToastService);

  showModal = false;
  editingId: number | null = null;
  fieldVisibility: FieldVisibility = { sets: true, reps: true, weight: true, duration: false, distance: false };

  form = {
    exerciseName: '',
    exerciseType: 'Strength' as ExerciseCategory,
    sets: null as number | null,
    reps: null as number | null,
    weightLbs: null as number | null,
    durationMin: null as number | null,
    distanceKm: null as number | null,
    caloriesBurned: null as number | null,
    notes: ''
  };

  errors: Record<string, string> = {};
  exerciseTypes: ExerciseCategory[] = ['Strength', 'Cardio', 'Flexibility', 'HIIT', 'Sports', 'Other'];

  ngOnInit(): void {
    this.workoutService.loadWorkouts();
  }

  onTypeChange(): void {
    this.fieldVisibility = this.workoutService.getFieldVisibility(this.form.exerciseType);
    // Clear hidden fields
    if (!this.fieldVisibility.sets) this.form.sets = null;
    if (!this.fieldVisibility.reps) this.form.reps = null;
    if (!this.fieldVisibility.weight) this.form.weightLbs = null;
    if (!this.fieldVisibility.duration) this.form.durationMin = null;
    if (!this.fieldVisibility.distance) this.form.distanceKm = null;
  }

  openModal(workout?: Workout): void {
    if (workout) {
      this.editingId = workout.id;
      this.form = {
        exerciseName: workout.exerciseName,
        exerciseType: workout.exerciseType as ExerciseCategory,
        sets: workout.sets,
        reps: workout.reps,
        weightLbs: workout.weightLbs,
        durationMin: workout.durationMin,
        distanceKm: workout.distanceKm,
        caloriesBurned: workout.caloriesBurned,
        notes: workout.notes
      };
    } else {
      this.editingId = null;
      this.resetForm();
    }
    this.fieldVisibility = this.workoutService.getFieldVisibility(this.form.exerciseType);
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; this.errors = {}; }

  async saveWorkout(): Promise<void> {
    this.errors = {};
    if (!this.form.exerciseName.trim()) this.errors['name'] = 'Exercise name cannot be empty';
    if (this.fieldVisibility.sets && this.form.sets !== null && this.form.sets <= 0) this.errors['sets'] = 'Sets must be positive';
    if (this.fieldVisibility.reps && this.form.reps !== null && this.form.reps <= 0) this.errors['reps'] = 'Reps must be positive';
    if (this.fieldVisibility.duration && this.form.exerciseType === 'Cardio' && (!this.form.durationMin || this.form.durationMin <= 0))
      this.errors['duration'] = 'Duration is required for cardio';
    if (!this.form.caloriesBurned || this.form.caloriesBurned <= 0)
      this.errors['calories'] = 'Calories burned is required — enter the value from your fitness device';
    if (Object.keys(this.errors).length > 0) return;

    try {
      if (this.editingId) {
        await this.workoutService.updateWorkout(this.editingId, this.form);
      } else {
        await this.workoutService.addWorkout(this.form);
      }
      this.closeModal();
    } catch {
      // Error toast already shown by service
    }
  }

  deleteWorkout(id: number): void {
    this.workoutService.deleteWorkout(id);
  }

  private resetForm(): void {
    this.form = { exerciseName: '', exerciseType: 'Strength', sets: null, reps: null, weightLbs: null, durationMin: null, distanceKm: null, caloriesBurned: null, notes: '' };
  }
}

