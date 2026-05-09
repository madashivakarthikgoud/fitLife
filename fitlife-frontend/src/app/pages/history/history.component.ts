import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration } from 'chart.js';
import { WorkoutService } from '../../services/workout.service';
import { NutritionService } from '../../services/nutrition.service';

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

  activeTab: 'workouts' | 'meals' = 'workouts';
  startDate = '';
  endDate = '';
  filteredWorkouts: any[] = [];
  filteredMeals: any[] = [];

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
    const now = new Date();
    this.endDate = now.toISOString().split('T')[0];
    const start = new Date(); start.setDate(start.getDate() - 30);
    this.startDate = start.toISOString().split('T')[0];
    // Load data from backend
    this.workoutService.loadWorkouts();
    this.nutritionService.loadMeals();
    // Delay to allow signals to update from API
    setTimeout(() => this.loadData(), 500);
  }

  loadData(): void {
    this.filteredWorkouts = this.workoutService.getWorkoutsByDateRange(this.startDate, this.endDate);
    this.filteredMeals = this.nutritionService.getMealsByDateRange(this.startDate, this.endDate);
    this.buildCharts();
  }

  onFilterChange(): void { this.loadData(); }

  private buildCharts(): void {
    // Line: Calories over time (last 7 days)
    const days: string[] = [];
    const cals: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
      const dayMeals = this.nutritionService.meals().filter(m => m.date.split('T')[0] === ds);
      cals.push(dayMeals.reduce((s, m) => s + m.calories, 0));
    }
    this.lineChartData = {
      labels: days,
      datasets: [{ data: cals, label: 'Calories Intake', borderColor: '#fb923c', backgroundColor: 'rgba(251,146,60,0.1)', fill: true, tension: 0.4 }]
    };

    // Bar: Workout sessions per day
    const weekly = this.workoutService.getWeeklyWorkoutCounts();
    this.barChartData = {
      labels: weekly.map(w => w.label),
      datasets: [{ data: weekly.map(w => w.count), label: 'Workouts', backgroundColor: '#4ade80', borderRadius: 6 }]
    };

    // Pie: Macro breakdown
    const totals = this.nutritionService.getTodayTotals();
    this.pieChartData = {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [{ data: [totals.protein || 40, totals.carbs || 50, totals.fat || 20], backgroundColor: ['#4ade80', '#60a5fa', '#facc15'] }]
    };
  }
}
