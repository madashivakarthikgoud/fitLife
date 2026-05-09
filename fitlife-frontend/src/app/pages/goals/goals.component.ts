import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { GoalService, Goal } from '../../services/goal.service';
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
  private toastService = inject(ToastService);

  showModal = false;
  form = { title: '', type: 'weight' as Goal['type'], targetValue: 70, currentValue: 0, unit: 'kg', deadline: '' };
  goalTypes: { value: Goal['type']; label: string }[] = [
    { value: 'weight', label: 'Weight Goal' },
    { value: 'calories', label: 'Calorie Goal' },
    { value: 'workouts', label: 'Workout Frequency' },
    { value: 'custom', label: 'Custom Goal' }
  ];

  get activeGoals() { return this.goalService.getActiveGoals(); }
  get completedGoals() { return this.goalService.getCompletedGoals(); }
  get overallProgress() { return this.goalService.getOverallProgress(); }

  ngOnInit(): void { this.goalService.loadGoals(); }

  openModal(): void {
    const d = new Date(); d.setMonth(d.getMonth() + 3);
    this.form = { title: '', type: 'weight', targetValue: 70, currentValue: 0, unit: 'kg', deadline: d.toISOString().split('T')[0] };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  async saveGoal(): Promise<void> {
    if (!this.form.title.trim()) { this.toastService.error('Goal title is required'); return; }
    if (this.form.targetValue <= 0) { this.toastService.error('Target must be positive'); return; }
    try {
      await this.goalService.addGoal(this.form);
      this.toastService.success('Goal set! Small steps = Big results 🚀');
      this.closeModal();
    } catch { this.toastService.error('Failed to save goal'); }
  }

  getProgress(goal: Goal): number {
    return Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  }

  weeksLeft(goal: Goal): number { return this.goalService.getWeeksRemaining(goal.id); }

  updateProgress(goal: Goal, value: number): void {
    this.goalService.updateGoal(goal.id, { currentValue: value });
    if (value >= goal.targetValue) {
      this.goalService.updateGoal(goal.id, { completed: true });
      this.toastService.success('🎉 Goal completed! Amazing work!');
    }
  }

  deleteGoal(id: number): void {
    this.goalService.deleteGoal(id);
    this.toastService.info('Goal removed');
  }

  onTypeChange(): void {
    switch (this.form.type) {
      case 'weight': this.form.unit = 'kg'; this.form.targetValue = 70; break;
      case 'calories': this.form.unit = 'kcal'; this.form.targetValue = 2000; break;
      case 'workouts': this.form.unit = 'sessions/week'; this.form.targetValue = 5; break;
      default: this.form.unit = ''; this.form.targetValue = 0;
    }
  }
}
