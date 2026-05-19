import { Component, inject, OnInit, computed, effect } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { WorkoutService } from '../../services/workout.service';
import { NutritionService } from '../../services/nutrition.service';
import { GoalService } from '../../services/goal.service';
import { WaterService } from '../../services/water.service';
import { AuthService } from '../../services/auth.service';
import { WeightLogService } from '../../services/weight-log.service';
import { InsightsService } from '../../services/insights.service';
import { InsightsPanelComponent } from '../../shared/insights-panel/insights-panel.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe, InsightsPanelComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private goalService = inject(GoalService);
  private waterService = inject(WaterService);
  private weightLogService = inject(WeightLogService);
  insightsService = inject(InsightsService);
  authService = inject(AuthService);
  private router = inject(Router);

  /** Profile completeness: needs height, weight, age for calculations to work */
  profileComplete = computed(() => {
    const u = this.authService.currentUser();
    return !!(u && u.heightCm && u.weightKg && u.age);
  });

  caloriesBurned = computed(() => this.workoutService.getTotalCaloriesBurned());
  workoutCount = computed(() => this.workoutService.getWorkoutCount());

  /** REAL goal progress: based on weight logs toward weight goal, or goal service average */
  goalProgress = computed(() => {
    const goals = this.goalService.getActiveGoals();
    const weightGoal = goals.find(g => g.type === 'weight');
    if (weightGoal && this.weightLogService.logs().length >= 1) {
      // Use real weight data
      const start = weightGoal.currentValue || this.weightLogService.firstWeight || 0;
      return this.weightLogService.getWeightGoalProgress(start, weightGoal.targetValue);
    }
    // Fallback: goal service average (for non-weight goals)
    return this.goalService.getOverallProgress() || 0;
  });

  weeklyStreak = computed(() => {
    let streak = 0;
    const allWorkouts = [...this.workoutService.historyWorkouts(), ...this.workoutService.workouts()];
    // Check if today has a workout
    const today = new Date().toISOString().split('T')[0];
    if (allWorkouts.some(w => w.date?.split('T')[0] === today)) streak++;
    else return 0;
    // Check previous consecutive days
    for (let i = 1; i <= 30; i++) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (allWorkouts.some(w => w.date?.split('T')[0] === dateStr)) streak++;
      else break;
    }
    return streak;
  });

  todayCalories = computed(() => this.nutritionService.getTodayTotals().calories);
  todayProtein = computed(() => this.nutritionService.getTodayTotals().protein);
  calorieGoal = computed(() => this.nutritionService.dailyGoals().calories);
  proteinGoal = computed(() => this.nutritionService.dailyGoals().protein);

  caloriesPct = computed(() => {
    const goal = this.calorieGoal();
    return goal > 0 ? Math.min(100, Math.round((this.todayCalories() / goal) * 100)) : 0;
  });
  proteinPct = computed(() => {
    const goal = this.proteinGoal();
    return goal > 0 ? Math.min(100, Math.round((this.todayProtein() / goal) * 100)) : 0;
  });

  // Use reactive signals from water service
  hydrationPct = computed(() => this.waterService.progressPctSignal());
  hydrationMl = computed(() => this.waterService.todayTotalMlSignal());
  hydrationGoal = computed(() => this.waterService.dailyGoalMlSignal());

  latestWeight = computed(() => this.weightLogService.latestWeight);
  weightChange = computed(() => this.weightLogService.weightChange);

  recentItems = computed(() => {
    const workouts = this.workoutService.getTodayWorkouts().slice(0, 3).map(w => ({
      id: `w-${w.id}`, type: 'workout', name: w.exerciseName,
      detail: `${w.exerciseType} · ${w.caloriesBurned ?? 0} cal`,
      time: this.timeAgo(w.date),
      sortKey: new Date(w.date).getTime()
    }));
    const meals = this.nutritionService.getTodayMeals().slice(0, 3).map(m => ({
      id: `m-${m.id}`, type: 'meal', name: m.foodName,
      detail: `${m.mealType} · ${m.calories} cal`,
      time: this.timeAgo(m.date),
      sortKey: new Date(m.date).getTime()
    }));
    return [...workouts, ...meals].sort((a, b) => b.sortKey - a.sortKey).slice(0, 5);
  });

  private dataLoaded = computed(() => {
    // Track when history data arrives to auto-generate insights
    const w = this.workoutService.historyWorkouts().length;
    const n = this.nutritionService.historyMeals().length;
    const wl = this.waterService.historyLogs().length;
    return w + n + wl;
  });

  constructor() {
    // Regenerate insights whenever history data changes
    effect(() => {
      this.dataLoaded(); // subscribe to changes
      this.insightsService.generateInsights();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    this.workoutService.loadWorkouts();
    this.nutritionService.loadMeals();
    this.goalService.loadGoals();
    this.waterService.loadTodayLogs();
    this.weightLogService.loadHistory();

    // Load 30 days of history for insights + streak
    const today = new Date();
    const monthAgo = new Date();
    monthAgo.setDate(today.getDate() - 30);
    const startStr = monthAgo.toISOString().split('T')[0];
    const endStr = today.toISOString().split('T')[0];

    this.workoutService.loadHistory(startStr, endStr);
    this.nutritionService.loadHistory(startStr, endStr);
    this.waterService.loadHistory(startStr, endStr);
  }

  navigate(path: string): void { this.router.navigate([path]); }

  private timeAgo(dateStr: string): string {
    if (!dateStr) return '';
    const min = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  }
}
