import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoalService, Goal } from '../../services/goal.service';
import { WeightLogService } from '../../services/weight-log.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { ProgressRingComponent } from '../../shared/progress-ring/progress-ring.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [FormsModule, ProgressRingComponent, EmptyStateComponent],
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent implements OnInit {
  goalService = inject(GoalService);
  weightLogService = inject(WeightLogService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);

  showModal = false;
  showWeightModal = false;
  weightInput: number | null = null;
  weightNotes = '';

  form = { title: '', type: 'weight' as Goal['type'], targetValue: 70, currentValue: 0, unit: 'kg', deadline: '' };
  goalTypes: { value: Goal['type']; label: string }[] = [
    { value: 'weight', label: 'Weight Goal (uses real weight logs)' },
    { value: 'workouts', label: 'Workout Frequency' },
    { value: 'custom', label: 'Custom Goal' }
  ];

  get activeGoals() { return this.goalService.getActiveGoals(); }
  get completedGoals() { return this.goalService.getCompletedGoals(); }
  get latestWeight() { return this.weightLogService.latestWeight; }
  get weightHistory() { return this.weightLogService.logs(); }

  ngOnInit(): void {
    this.goalService.loadGoals();
    this.weightLogService.loadHistory();
  }

  openModal(): void {
    const d = new Date(); d.setMonth(d.getMonth() + 3);
    const currentWeight = this.latestWeight ?? this.authService.currentUser()?.weightKg ?? 70;
    this.form = { title: '', type: 'weight', targetValue: Math.round(currentWeight - 5), currentValue: Math.round(currentWeight), unit: 'kg', deadline: d.toISOString().split('T')[0] };
    this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }

  openWeightModal(): void {
    this.weightInput = this.latestWeight ?? this.authService.currentUser()?.weightKg ?? null;
    this.weightNotes = '';
    this.showWeightModal = true;
  }
  closeWeightModal(): void { this.showWeightModal = false; }

  async logWeight(): Promise<void> {
    if (!this.weightInput || this.weightInput <= 0) {
      this.toastService.error('Enter a valid weight'); return;
    }
    try {
      await this.weightLogService.logWeight(this.weightInput, undefined, this.weightNotes || undefined);
      this.closeWeightModal();
    } catch {}
  }

  async saveGoal(): Promise<void> {
    if (!this.form.title.trim()) { this.toastService.error('Goal title is required'); return; }
    if (this.form.targetValue <= 0) { this.toastService.error('Target must be positive'); return; }
    try {
      await this.goalService.addGoal(this.form);
      this.toastService.success('Goal set! 🚀');
      this.closeModal();
    } catch { this.toastService.error('Failed to save goal'); }
  }

  getProgress(goal: Goal): number {
    if (goal.type === 'weight') {
      // Use real weight log data
      const latest = this.latestWeight;
      if (latest === null) return 0;
      const start = goal.currentValue; // starting weight when goal was set
      return this.weightLogService.getWeightGoalProgress(start, goal.targetValue);
    }
    if (goal.targetValue === 0) return 0;
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  }

  getCurrentDisplay(goal: Goal): string {
    if (goal.type === 'weight') {
      const w = this.latestWeight;
      return w !== null ? `${w}` : '—';
    }
    return `${goal.currentValue}`;
  }

  weeksLeft(goal: Goal): number { return this.goalService.getWeeksRemaining(goal.id); }

  updateProgress(goal: Goal, value: number): void {
    if (goal.type === 'weight') {
      // Weight goals should be updated via weight log, not slider
      this.openWeightModal();
      return;
    }
    const updates: Partial<Goal> = { currentValue: value };
    if (value >= goal.targetValue) {
      updates.completed = true;
    }
    this.goalService.updateGoal(goal.id, updates);
    if (value >= goal.targetValue) {
      this.toastService.success('🎉 Goal completed!');
    }
  }

  deleteGoal(id: number): void {
    this.goalService.deleteGoal(id);
    this.toastService.info('Goal removed');
  }

  onTypeChange(): void {
    const currentWeight = this.latestWeight ?? this.authService.currentUser()?.weightKg ?? 70;
    switch (this.form.type) {
      case 'weight':
        this.form.unit = 'kg';
        this.form.currentValue = Math.round(currentWeight);
        this.form.targetValue = Math.round(currentWeight - 5);
        break;
      case 'workouts': this.form.unit = 'sessions/week'; this.form.targetValue = 5; this.form.currentValue = 0; break;
      default: this.form.unit = ''; this.form.targetValue = 0; this.form.currentValue = 0;
    }
  }
}
