import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WorkoutService } from '../../services/workout.service';
import { NutritionService } from '../../services/nutrition.service';
import { WaterService } from '../../services/water.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface WorkoutDaySummary {
  date: string;
  label: string;
  count: number;
  totalCalories: number;
  types: string;
}

interface MealDaySummary {
  date: string;
  label: string;
  count: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

interface WaterDaySummary {
  date: string;
  label: string;
  count: number;
  totalMl: number;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [FormsModule, DatePipe, BaseChartDirective],
  templateUrl: './history.component.html',
  styleUrl: './history.component.scss'
})
export class HistoryComponent implements OnInit {
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private waterService = inject(WaterService);
  private http = inject(HttpClient);

  activeTab: 'workouts' | 'meals' | 'water' = 'workouts';
  period: 'week' | 'month' = 'week';

  // Aggregated daily summaries
  workoutSummaries: WorkoutDaySummary[] = [];
  mealSummaries: MealDaySummary[] = [];
  waterSummaries: WaterDaySummary[] = [];

  // Chart configs
  lineChartData: ChartConfiguration<'line'>['data'] = { labels: [], datasets: [] };
  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#2a2a3a' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#2a2a3a' } }
    },
    plugins: { legend: { labels: { color: '#f0f0f0' } } }
  };

  barChartData: ChartConfiguration<'bar'>['data'] = { labels: [], datasets: [] };
  barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    scales: {
      x: { ticks: { color: '#9ca3af' }, grid: { color: '#2a2a3a' } },
      y: { ticks: { color: '#9ca3af' }, grid: { color: '#2a2a3a' } }
    },
    plugins: { legend: { labels: { color: '#f0f0f0' } } }
  };

  pieChartData: ChartConfiguration<'pie'>['data'] = { labels: [], datasets: [] };
  pieChartOptions: ChartConfiguration<'pie'>['options'] = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#f0f0f0' }, position: 'bottom' } }
  };

  ngOnInit(): void {
    this.loadData();
  }

  get dateRange(): { start: string; end: string } {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    const startDate = new Date();
    if (this.period === 'week') {
      startDate.setDate(startDate.getDate() - 6);
    } else {
      startDate.setDate(startDate.getDate() - 29);
    }
    return { start: startDate.toISOString().split('T')[0], end };
  }

  onPeriodChange(): void {
    this.loadData();
  }

  loadData(): void {
    const { start, end } = this.dateRange;
    const apiUrl = environment.apiUrl;

    // Load all three in parallel and build summaries when ALL complete
    forkJoin({
      workouts: this.http.get<any[]>(`${apiUrl}/workouts/history`, { params: { start, end } }),
      meals: this.http.get<any[]>(`${apiUrl}/meals/history`, { params: { start, end } }),
      water: this.http.get<any[]>(`${apiUrl}/water/history`, { params: { start, end } })
    }).subscribe({
      next: ({ workouts, meals, water }) => {
        this.workoutService.historyWorkouts.set(workouts);
        this.nutritionService.historyMeals.set(meals);
        this.waterService.historyLogs.set(water);
        this.buildSummaries();
      },
      error: () => {} // individual service toasts handle errors
    });
  }

  private buildSummaries(): void {
    const { start, end } = this.dateRange;
    const days = this.getDaysInRange(start, end);

    // Workout daily summaries
    const workouts = this.workoutService.historyWorkouts();
    this.workoutSummaries = days.map(day => {
      const dayWorkouts = workouts.filter(w => w.date?.split('T')[0] === day.date);
      return {
        date: day.date,
        label: day.label,
        count: dayWorkouts.length,
        totalCalories: dayWorkouts.reduce((s, w) => s + (w.caloriesBurned ?? 0), 0),
        types: [...new Set(dayWorkouts.map(w => w.exerciseType))].join(', ') || '-'
      };
    }).filter(s => s.count > 0);

    // Meal daily summaries
    const meals = this.nutritionService.historyMeals();
    this.mealSummaries = days.map(day => {
      const dayMeals = meals.filter(m => m.date?.split('T')[0] === day.date);
      return {
        date: day.date,
        label: day.label,
        count: dayMeals.length,
        totalCalories: dayMeals.reduce((s, m) => s + m.calories, 0),
        totalProtein: Math.round(dayMeals.reduce((s, m) => s + m.protein, 0)),
        totalCarbs: Math.round(dayMeals.reduce((s, m) => s + m.carbs, 0)),
        totalFat: Math.round(dayMeals.reduce((s, m) => s + m.fat, 0))
      };
    }).filter(s => s.count > 0);

    // Water daily summaries
    const waterLogs = this.waterService.historyLogs();
    this.waterSummaries = days.map(day => {
      const dayLogs = waterLogs.filter(l => (l.date?.split('T')[0] ?? l.date) === day.date);
      return {
        date: day.date,
        label: day.label,
        count: dayLogs.length,
        totalMl: dayLogs.reduce((s, l) => s + l.amountMl, 0)
      };
    }).filter(s => s.count > 0);

    this.buildCharts(days, workouts, meals, waterLogs);
  }

  private buildCharts(days: { date: string; label: string }[], workouts: any[], meals: any[], waterLogs: any[]): void {
    // Line: Calories intake over time
    const calLabels = days.map(d => d.label);
    const calData = days.map(d => {
      return meals.filter(m => m.date?.split('T')[0] === d.date).reduce((s: number, m: any) => s + m.calories, 0);
    });
    this.lineChartData = {
      labels: calLabels,
      datasets: [{ data: calData, label: 'Calories Intake', borderColor: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)', fill: true, tension: 0.4 }]
    };

    // Bar: Workout sessions per day
    const workoutCounts = days.map(d => workouts.filter(w => w.date?.split('T')[0] === d.date).length);
    this.barChartData = {
      labels: calLabels,
      datasets: [{ data: workoutCounts, label: 'Workouts', backgroundColor: '#4ade80', borderRadius: 6 }]
    };

    // Pie: Total macro breakdown for the period
    const totalProtein = meals.reduce((s: number, m: any) => s + m.protein, 0);
    const totalCarbs = meals.reduce((s: number, m: any) => s + m.carbs, 0);
    const totalFat = meals.reduce((s: number, m: any) => s + m.fat, 0);
    const hasMacroData = totalProtein > 0 || totalCarbs > 0 || totalFat > 0;
    this.pieChartData = {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{
        data: hasMacroData ? [Math.round(totalProtein), Math.round(totalCarbs), Math.round(totalFat)] : [0, 0, 0],
        backgroundColor: ['#4ade80', '#60a5fa', '#facc15']
      }]
    };
  }

  private getDaysInRange(start: string, end: string): { date: string; label: string }[] {
    const result: { date: string; label: string }[] = [];
    const current = new Date(start);
    const endDate = new Date(end);
    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const label = current.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      result.push({ date: dateStr, label });
      current.setDate(current.getDate() + 1);
    }
    return result;
  }
}
