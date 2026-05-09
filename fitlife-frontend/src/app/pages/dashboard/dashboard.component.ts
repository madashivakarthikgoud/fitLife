import { Component, inject, OnInit, computed } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { WorkoutService } from '../../services/workout.service';
import { NutritionService } from '../../services/nutrition.service';
import { GoalService } from '../../services/goal.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private goalService = inject(GoalService);
  private router = inject(Router);

  caloriesBurned = computed(() => this.workoutService.getTotalCaloriesBurned());
  workoutCount = computed(() => this.workoutService.getWorkoutCount());
  goalProgress = computed(() => this.goalService.getOverallProgress() || 0);
  weeklyStreak = 5;

  todayCalories = computed(() => this.nutritionService.getTodayTotals().calories);
  todayProtein = computed(() => this.nutritionService.getTodayTotals().protein);
  
  calorieGoal = computed(() => this.nutritionService.dailyGoals().calories);
  proteinGoal = computed(() => this.nutritionService.dailyGoals().protein);

  caloriesPct = computed(() => {
    const cal = this.todayCalories();
    const goal = this.calorieGoal();
    return goal > 0 ? Math.min(100, Math.round((cal / goal) * 100)) : 0;
  });
  
  proteinPct = computed(() => {
    const pro = this.todayProtein();
    const goal = this.proteinGoal();
    return goal > 0 ? Math.min(100, Math.round((pro / goal) * 100)) : 0;
  });

  recentItems = computed(() => {
    const workouts = this.workoutService.workouts().slice(0, 3).map(w => ({
      id: w.id, type: 'workout', name: w.exerciseName,
      detail: `${w.exerciseType} • ${w.caloriesBurned} cal`,
      time: this.timeAgo(w.date)
    }));
    const meals = this.nutritionService.meals().slice(0, 3).map(m => ({
      id: m.id + 10000, type: 'meal', name: m.foodName,
      detail: `${m.mealType} • ${m.calories} cal`,
      time: this.timeAgo(m.date)
    }));
    return [...workouts, ...meals].sort((a, b) => b.id - a.id).slice(0, 5);
  });

  ngOnInit(): void {
    // Load data from backend
    this.workoutService.loadWorkouts();
    this.nutritionService.loadMeals();
    this.goalService.loadGoals();
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
