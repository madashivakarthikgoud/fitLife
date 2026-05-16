import { Injectable, inject, signal } from '@angular/core';
import { WorkoutService, Workout } from './workout.service';
import { NutritionService, Meal } from './nutrition.service';
import { WaterService, WaterLog } from './water.service';
import { GoalService, Goal } from './goal.service';
import {
  mean, standardDeviation, zScore, linearRegression,
  groupByDayOfWeek, sumByDate, daysAgo, pctChange, movingAverage
} from './stat-utils';

export type InsightType = 'nutrition' | 'workout' | 'water' | 'goal' | 'anomaly';
export type InsightSeverity = 'info' | 'warning' | 'success' | 'tip';

export interface Insight {
  id: string;
  type: InsightType;
  severity: InsightSeverity;
  icon: string;
  title: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class InsightsService {
  private workoutService = inject(WorkoutService);
  private nutritionService = inject(NutritionService);
  private waterService = inject(WaterService);
  private goalService = inject(GoalService);

  insights = signal<Insight[]>([]);
  loading = signal(false);

  /** Call this after history data is loaded */
  generateInsights(): void {
    this.loading.set(true);

    const all: Insight[] = [
      ...this.analyzeNutrition(),
      ...this.analyzeWorkouts(),
      ...this.analyzeWater(),
      ...this.analyzeGoals(),
      ...this.detectAnomalies()
    ];

    // Deduplicate and limit to top 8 most relevant
    this.insights.set(all.slice(0, 8));
    this.loading.set(false);
  }

  // ─── NUTRITION ANALYSIS ──────────────────────────────────────────

  private analyzeNutrition(): Insight[] {
    const meals = this.nutritionService.historyMeals();
    if (meals.length < 3) return [];

    const insights: Insight[] = [];
    const dailyCalories = this.getDailyTotals(meals, 'calories');
    const dailyProtein = this.getDailyTotals(meals, 'protein');
    const goals = this.nutritionService.dailyGoals();

    // 7-day calorie trend
    const recentDays = Array.from(dailyCalories.entries()).sort().slice(-7);
    if (recentDays.length >= 3) {
      const values = recentDays.map(([, v]) => v);
      const avg = Math.round(mean(values));
      const trend = linearRegression(values.map((v, i) => ({ x: i, y: v })));

      if (trend.slope > 50 && trend.r2 > 0.3) {
        insights.push({
          id: 'nut-cal-up', type: 'nutrition', severity: 'warning', icon: '📈',
          title: 'Calorie Intake Rising',
          message: `Your daily calories are trending up (~${Math.round(trend.slope)} cal/day increase). 7-day average: ${avg} kcal.`
        });
      } else if (trend.slope < -50 && trend.r2 > 0.3) {
        insights.push({
          id: 'nut-cal-down', type: 'nutrition', severity: 'info', icon: '📉',
          title: 'Calorie Intake Declining',
          message: `Your daily calories are trending down. 7-day average: ${avg} kcal. Make sure you're eating enough!`
        });
      }

      // Consistently under calorie goal
      const daysUnder = values.filter(v => v < goals.calories * 0.7).length;
      if (daysUnder >= 4) {
        insights.push({
          id: 'nut-under', type: 'nutrition', severity: 'warning', icon: '⚠️',
          title: 'Consistently Under Calorie Goal',
          message: `You've been under 70% of your calorie target on ${daysUnder} of the last ${values.length} days. This may affect energy and recovery.`
        });
      }
    }

    // Protein analysis
    const proteinValues = Array.from(dailyProtein.entries()).sort().slice(-7).map(([, v]) => v);
    if (proteinValues.length >= 3) {
      const avgProtein = Math.round(mean(proteinValues));
      if (avgProtein < goals.protein * 0.6) {
        insights.push({
          id: 'nut-protein-low', type: 'nutrition', severity: 'tip', icon: '🥩',
          title: 'Low Protein Intake',
          message: `Your 7-day protein average is ${avgProtein}g (goal: ${goals.protein}g). Consider adding protein-rich foods like chicken, eggs, or Greek yogurt.`
        });
      } else if (avgProtein >= goals.protein * 0.95) {
        insights.push({
          id: 'nut-protein-good', type: 'nutrition', severity: 'success', icon: '💪',
          title: 'Protein Goal Achieved!',
          message: `Great job! You're consistently hitting your protein target with a ${avgProtein}g daily average.`
        });
      }
    }

    // Meal timing — check if skipping breakfast
    const breakfastMeals = meals.filter(m => m.mealType?.toLowerCase() === 'breakfast');
    const totalDays = new Set(meals.map(m => m.date.split('T')[0])).size;
    if (totalDays >= 5 && breakfastMeals.length < totalDays * 0.3) {
      insights.push({
        id: 'nut-breakfast', type: 'nutrition', severity: 'tip', icon: '🌅',
        title: 'Skipping Breakfast Often',
        message: `You've logged breakfast on only ${breakfastMeals.length} of ${totalDays} tracked days. A morning meal can boost metabolism and energy.`
      });
    }

    return insights;
  }

  // ─── WORKOUT ANALYSIS ────────────────────────────────────────────

  private analyzeWorkouts(): Insight[] {
    const workouts = this.workoutService.historyWorkouts();
    if (workouts.length < 3) return [];

    const insights: Insight[] = [];

    // Workout frequency trend
    const dailyCounts = this.getWorkoutCountsByDate(workouts);
    const recentDays = Array.from(dailyCounts.entries()).sort().slice(-14);

    if (recentDays.length >= 5) {
      // Weekly comparison
      const thisWeek = recentDays.slice(-7).reduce((s, [, c]) => s + c, 0);
      const lastWeek = recentDays.slice(0, 7).reduce((s, [, c]) => s + c, 0);

      if (lastWeek > 0 && thisWeek > lastWeek) {
        const change = pctChange(lastWeek, thisWeek);
        insights.push({
          id: 'wk-freq-up', type: 'workout', severity: 'success', icon: '🔥',
          title: 'Workout Frequency Up!',
          message: `You've done ${thisWeek} workouts this week vs ${lastWeek} last week (+${change}%). Keep the momentum!`
        });
      } else if (lastWeek > 0 && thisWeek < lastWeek * 0.5) {
        insights.push({
          id: 'wk-freq-down', type: 'workout', severity: 'warning', icon: '📉',
          title: 'Workout Frequency Dropping',
          message: `Only ${thisWeek} workout(s) this week compared to ${lastWeek} last week. Try to stay consistent!`
        });
      }
    }

    // Exercise variety
    const typeMap = new Map<string, number>();
    workouts.forEach(w => typeMap.set(w.exerciseType, (typeMap.get(w.exerciseType) || 0) + 1));
    const types = Array.from(typeMap.entries()).sort((a, b) => b[1] - a[1]);

    if (types.length === 1 && workouts.length >= 5) {
      insights.push({
        id: 'wk-variety', type: 'workout', severity: 'tip', icon: '🔄',
        title: 'Try Adding Variety',
        message: `All ${workouts.length} recent workouts are ${types[0][0]}. Mixing in different types (cardio, flexibility, HIIT) can improve overall fitness.`
      });
    } else if (types.length >= 3) {
      insights.push({
        id: 'wk-variety-good', type: 'workout', severity: 'success', icon: '🎯',
        title: 'Great Workout Variety',
        message: `You're training across ${types.length} different types: ${types.map(t => t[0]).join(', ')}. Well-rounded approach!`
      });
    }

    // Most active day of week
    const byDay = groupByDayOfWeek(workouts.map(w => ({ date: w.date, value: 1 })));
    const mostActive = byDay.reduce((best, d) => d.count > best.count ? d : best, byDay[0]);
    const leastActive = byDay.filter(d => d.count > 0).reduce((worst, d) => d.count < worst.count ? d : worst, byDay.find(d => d.count > 0) || byDay[0]);

    if (mostActive.count >= 3) {
      insights.push({
        id: 'wk-best-day', type: 'workout', severity: 'info', icon: '📅',
        title: 'Your Most Active Day',
        message: `You train most on ${mostActive.dayName}s (${mostActive.count} sessions). ${leastActive && leastActive.dayName !== mostActive.dayName ? `Consider adding a session on ${leastActive.dayName}s too.` : ''}`
      });
    }

    // Rest day recommendation
    const todayWorkouts = this.workoutService.workouts();
    const streak = this.getConsecutiveWorkoutDays(workouts, todayWorkouts);
    if (streak >= 5) {
      insights.push({
        id: 'wk-rest', type: 'workout', severity: 'warning', icon: '😴',
        title: 'Rest Day Recommended',
        message: `You've worked out ${streak} days in a row! Rest days are essential for muscle recovery and preventing injury.`
      });
    }

    return insights;
  }

  // ─── WATER ANALYSIS ──────────────────────────────────────────────

  private analyzeWater(): Insight[] {
    const logs = this.waterService.historyLogs();
    if (logs.length < 3) return [];

    const insights: Insight[] = [];
    const dailyWater = sumByDate(logs.map(l => ({ date: l.date, value: l.amountMl })));
    const recentDays = Array.from(dailyWater.entries()).sort().slice(-14);

    if (recentDays.length < 3) return [];

    const values = recentDays.map(([, v]) => v);
    const avg = Math.round(mean(values));
    const goal = this.waterService.dailyGoalMl;

    // Day-of-week pattern
    const byDay = groupByDayOfWeek(logs.map(l => ({ date: l.date, value: l.amountMl })));
    const todayDow = new Date().getDay();
    const todayPattern = byDay[todayDow];
    const weekdayAvg = mean(byDay.filter(d => d.day >= 1 && d.day <= 5 && d.count > 0).map(d => d.avg));
    const weekendAvg = mean(byDay.filter(d => (d.day === 0 || d.day === 6) && d.count > 0).map(d => d.avg));

    if (weekdayAvg > 0 && weekendAvg > 0 && weekendAvg < weekdayAvg * 0.75) {
      insights.push({
        id: 'wat-weekend', type: 'water', severity: 'tip', icon: '📊',
        title: 'Weekend Hydration Dip',
        message: `You average ${Math.round(weekendAvg)}ml on weekends vs ${Math.round(weekdayAvg)}ml on weekdays. Try to maintain consistent hydration all week.`
      });
    }

    // Today's prediction
    if (todayPattern.count >= 2) {
      const currentToday = this.waterService.todayTotalMl;
      if (currentToday < todayPattern.avg * 0.5) {
        insights.push({
          id: 'wat-behind', type: 'water', severity: 'warning', icon: '💧',
          title: 'Behind on Hydration',
          message: `You usually drink ~${todayPattern.avg}ml on ${todayPattern.dayName}s, but you're at ${currentToday}ml so far. Time to hydrate!`
        });
      }
    }

    // Hydration streak
    const daysMetGoal = values.filter(v => v >= goal * 0.9).length;
    if (daysMetGoal >= recentDays.length * 0.8 && recentDays.length >= 5) {
      insights.push({
        id: 'wat-streak', type: 'water', severity: 'success', icon: '🏆',
        title: 'Hydration Champion!',
        message: `You've hit your water goal on ${daysMetGoal} of the last ${recentDays.length} days. Excellent consistency!`
      });
    } else if (daysMetGoal < recentDays.length * 0.3 && recentDays.length >= 5) {
      insights.push({
        id: 'wat-low', type: 'water', severity: 'warning', icon: '🚰',
        title: 'Hydration Needs Attention',
        message: `You've only met your water goal ${daysMetGoal} time(s) in the last ${recentDays.length} days. Average: ${avg}ml vs ${goal}ml goal.`
      });
    }

    return insights;
  }

  // ─── GOAL FORECASTING ────────────────────────────────────────────

  private analyzeGoals(): Insight[] {
    const goals = this.goalService.getActiveGoals();
    if (goals.length === 0) return [];

    const insights: Insight[] = [];

    for (const goal of goals) {
      if (!goal.deadline) continue;

      const progress = goal.targetValue > 0 ? (goal.currentValue / goal.targetValue) * 100 : 0;
      const deadlineDate = new Date(goal.deadline);
      const daysRemaining = Math.max(0, Math.ceil((deadlineDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      const createdDate = new Date(goal.createdAt);
      const totalDays = Math.max(1, Math.ceil((deadlineDate.getTime() - createdDate.getTime()) / (24 * 60 * 60 * 1000)));
      const elapsed = totalDays - daysRemaining;

      if (elapsed < 2) continue; // Not enough data to forecast

      // Expected progress based on time elapsed
      const expectedProgress = (elapsed / totalDays) * 100;

      if (progress >= 100) {
        insights.push({
          id: `goal-done-${goal.id}`, type: 'goal', severity: 'success', icon: '🎉',
          title: `Goal Complete: ${goal.title}`,
          message: `You've reached your target of ${goal.targetValue} ${goal.unit}! Consider marking it complete and setting a new challenge.`
        });
      } else if (progress < expectedProgress * 0.5 && daysRemaining > 0) {
        // Significantly behind schedule
        const dailyNeeded = ((goal.targetValue - goal.currentValue) / daysRemaining).toFixed(1);
        insights.push({
          id: `goal-risk-${goal.id}`, type: 'goal', severity: 'warning', icon: '⏱️',
          title: `Goal at Risk: ${goal.title}`,
          message: `${Math.round(progress)}% done with ${daysRemaining} days left. You need ~${dailyNeeded} ${goal.unit}/day to finish on time.`
        });
      } else if (progress > expectedProgress * 1.2 && progress < 100) {
        // Ahead of schedule
        insights.push({
          id: `goal-ahead-${goal.id}`, type: 'goal', severity: 'success', icon: '🚀',
          title: `Ahead of Schedule: ${goal.title}`,
          message: `${Math.round(progress)}% done with ${daysRemaining} days remaining. You're ahead of pace — great work!`
        });
      } else if (daysRemaining <= 3 && progress < 80) {
        insights.push({
          id: `goal-deadline-${goal.id}`, type: 'goal', severity: 'warning', icon: '🔔',
          title: `Deadline Approaching: ${goal.title}`,
          message: `Only ${daysRemaining} day(s) left and you're at ${Math.round(progress)}%. Push hard to finish!`
        });
      }
    }

    return insights;
  }

  // ─── ANOMALY DETECTION ───────────────────────────────────────────

  private detectAnomalies(): Insight[] {
    const insights: Insight[] = [];

    // Calorie anomaly
    const meals = this.nutritionService.historyMeals();
    if (meals.length >= 7) {
      const dailyCal = Array.from(this.getDailyTotals(meals, 'calories').entries()).sort();
      if (dailyCal.length >= 5) {
        const values = dailyCal.map(([, v]) => v);
        const todayMeals = this.nutritionService.meals();
        const todayCal = todayMeals.reduce((s, m) => s + m.calories, 0);

        if (todayCal > 0) {
          const m = mean(values);
          const sd = standardDeviation(values);
          const z = zScore(todayCal, m, sd);

          if (z > 2) {
            insights.push({
              id: 'anom-cal-high', type: 'anomaly', severity: 'warning', icon: '🔺',
              title: 'Unusually High Calorie Day',
              message: `Today's intake (${todayCal} kcal) is significantly above your average of ${Math.round(m)} kcal. That's okay occasionally — just be mindful!`
            });
          } else if (z < -2) {
            insights.push({
              id: 'anom-cal-low', type: 'anomaly', severity: 'info', icon: '🔻',
              title: 'Very Low Calorie Day',
              message: `Today's intake (${todayCal} kcal) is well below your average of ${Math.round(m)} kcal. Make sure you're fueling your body properly.`
            });
          }
        }
      }
    }

    // Water anomaly
    const waterLogs = this.waterService.historyLogs();
    if (waterLogs.length >= 7) {
      const dailyWater = Array.from(sumByDate(waterLogs.map(l => ({ date: l.date, value: l.amountMl }))).entries()).sort();
      if (dailyWater.length >= 5) {
        const values = dailyWater.map(([, v]) => v);
        const todayWater = this.waterService.todayTotalMl;

        if (todayWater > 0) {
          const m = mean(values);
          const sd = standardDeviation(values);
          const z = zScore(todayWater, m, sd);

          if (z > 2.5) {
            insights.push({
              id: 'anom-water-high', type: 'anomaly', severity: 'info', icon: '🌊',
              title: 'Extra Hydrated Today!',
              message: `Today's water intake (${todayWater}ml) is well above your average of ${Math.round(m)}ml. Great if you're active, just don't overdo it.`
            });
          }
        }
      }
    }

    return insights;
  }

  // ─── HELPERS ─────────────────────────────────────────────────────

  private getDailyTotals(meals: Meal[], field: 'calories' | 'protein' | 'carbs' | 'fat'): Map<string, number> {
    const map = new Map<string, number>();
    for (const m of meals) {
      const dateKey = m.date.split('T')[0];
      map.set(dateKey, (map.get(dateKey) || 0) + m[field]);
    }
    return map;
  }

  private getWorkoutCountsByDate(workouts: Workout[]): Map<string, number> {
    const map = new Map<string, number>();
    for (const w of workouts) {
      const dateKey = w.date.split('T')[0];
      map.set(dateKey, (map.get(dateKey) || 0) + 1);
    }
    return map;
  }

  private getConsecutiveWorkoutDays(historyWorkouts: Workout[], todayWorkouts: Workout[]): number {
    let streak = 0;
    const all = [...historyWorkouts, ...todayWorkouts];
    const today = new Date().toISOString().split('T')[0];

    // Check if today has workout
    if (all.some(w => w.date?.split('T')[0] === today)) streak++;
    else return 0;

    for (let i = 1; i <= 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      if (all.some(w => w.date?.split('T')[0] === dateStr)) streak++;
      else break;
    }
    return streak;
  }
}

