import { Injectable, signal, inject, effect } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { FitnessCalculatorService } from './fitness-calculator.service';

export interface Meal {
  id: number;
  foodName: string;
  mealType: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string;
}

export interface FoodItem {
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
}

@Injectable({ providedIn: 'root' })
export class NutritionService {
  /** Today's meals only - resets each day */
  meals = signal<Meal[]>([]);
  /** Historical meals for history page */
  historyMeals = signal<Meal[]>([]);
  private apiUrl = `${environment.apiUrl}/meals`;

  dailyGoals = signal({ calories: 2000, protein: 130, carbs: 250, fat: 65 });

  private authService = inject(AuthService);
  private calc = inject(FitnessCalculatorService);

  /** Common food lookup - convenience only, users can always enter custom foods with their own macros */
  readonly foodDatabase: FoodItem[] = [
    { name: 'Chicken Breast', caloriesPer100g: 165, proteinPer100g: 31, carbsPer100g: 0, fatPer100g: 3.6 },
    { name: 'Brown Rice', caloriesPer100g: 112, proteinPer100g: 2.6, carbsPer100g: 24, fatPer100g: 0.9 },
    { name: 'Eggs', caloriesPer100g: 155, proteinPer100g: 13, carbsPer100g: 1.1, fatPer100g: 11 },
    { name: 'Salmon', caloriesPer100g: 208, proteinPer100g: 20, carbsPer100g: 0, fatPer100g: 13 },
    { name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, carbsPer100g: 23, fatPer100g: 0.3 },
    { name: 'Oatmeal', caloriesPer100g: 68, proteinPer100g: 2.5, carbsPer100g: 12, fatPer100g: 1.4 },
    { name: 'Greek Yogurt', caloriesPer100g: 59, proteinPer100g: 10, carbsPer100g: 3.6, fatPer100g: 0.4 },
    { name: 'Sweet Potato', caloriesPer100g: 86, proteinPer100g: 1.6, carbsPer100g: 20, fatPer100g: 0.1 },
    { name: 'Broccoli', caloriesPer100g: 34, proteinPer100g: 2.8, carbsPer100g: 7, fatPer100g: 0.4 },
    { name: 'Almonds', caloriesPer100g: 579, proteinPer100g: 21, carbsPer100g: 22, fatPer100g: 50 },
    { name: 'Turkey Breast', caloriesPer100g: 135, proteinPer100g: 30, carbsPer100g: 0, fatPer100g: 1 },
    { name: 'Whole Wheat Bread', caloriesPer100g: 247, proteinPer100g: 13, carbsPer100g: 41, fatPer100g: 3.4 },
    { name: 'Avocado', caloriesPer100g: 160, proteinPer100g: 2, carbsPer100g: 9, fatPer100g: 15 },
    { name: 'Milk (Whole)', caloriesPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.8, fatPer100g: 3.3 },
    { name: 'Peanut Butter', caloriesPer100g: 588, proteinPer100g: 25, carbsPer100g: 20, fatPer100g: 50 },
    { name: 'Cottage Cheese', caloriesPer100g: 98, proteinPer100g: 11, carbsPer100g: 3.4, fatPer100g: 4.3 },
    { name: 'Pasta', caloriesPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1 },
    { name: 'Apple', caloriesPer100g: 52, proteinPer100g: 0.3, carbsPer100g: 14, fatPer100g: 0.2 },
    { name: 'Whey Protein Shake', caloriesPer100g: 120, proteinPer100g: 24, carbsPer100g: 3, fatPer100g: 1.5 },
    { name: 'Steak (Beef)', caloriesPer100g: 271, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 18 },
  ];

  constructor(private http: HttpClient, private toast: ToastService) {
    effect(() => {
      const user = this.authService.currentUser();
      if (user && user.weightKg && user.heightCm && user.age) {
        const macros = this.calc.calcMacros(user);
        this.dailyGoals.set({
          calories: this.calc.calcCaloricTarget(user),
          protein: macros.protein,
          carbs: macros.carbs,
          fat: macros.fat
        });
      }
    }, { allowSignalWrites: true });
  }

  /** Loads today's meals only (daily reset) */
  loadMeals(): void {
    this.http.get<Meal[]>(this.apiUrl).subscribe({
      next: (data) => this.meals.set(data),
      error: (err) => {
        const message = err.error?.error || 'Failed to load meals';
        this.toast.error(message);
      }
    });
  }

  /** Load meals for a date range (for history page) */
  loadHistory(start: string, end: string): void {
    this.http.get<Meal[]>(`${this.apiUrl}/history`, { params: { start, end } }).subscribe({
      next: (data) => this.historyMeals.set(data),
      error: (err) => this.toast.error(err.error?.error || 'Failed to load meal history')
    });
  }

  searchFood(query: string): FoodItem[] {
    if (!query || query.length < 2) return [];
    return this.foodDatabase.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
  }

  addMeal(meal: Partial<Meal>): Promise<Meal> {
    return new Promise((resolve, reject) => {
      this.http.post<Meal>(this.apiUrl, meal).subscribe({
        next: (m) => { this.meals.update(list => [m, ...list]); resolve(m); },
        error: (err) => { this.toast.error(err.error?.error || 'Failed to add meal'); reject(err); }
      });
    });
  }

  updateMeal(id: number, updates: Partial<Meal>): Promise<Meal> {
    return new Promise((resolve, reject) => {
      this.http.put<Meal>(`${this.apiUrl}/${id}`, updates).subscribe({
        next: (m) => { this.meals.update(list => list.map(x => x.id === id ? m : x)); resolve(m); },
        error: (err) => { this.toast.error(err.error?.error || 'Failed to update meal'); reject(err); }
      });
    });
  }

  deleteMeal(id: number): void {
    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.meals.update(list => list.filter(m => m.id !== id)),
      error: (err) => this.toast.error(err.error?.error || 'Failed to delete meal')
    });
  }

  /** Today's meals are already loaded via the default endpoint */
  getTodayMeals(): Meal[] {
    return this.meals();
  }

  getTodayTotals(): { calories: number; protein: number; carbs: number; fat: number } {
    const today = this.meals();
    return {
      calories: Math.round(today.reduce((s, m) => s + m.calories, 0)),
      protein: Math.round(today.reduce((s, m) => s + m.protein, 0)),
      carbs: Math.round(today.reduce((s, m) => s + m.carbs, 0)),
      fat: Math.round(today.reduce((s, m) => s + m.fat, 0))
    };
  }

  getRemainingMacros(): { calories: number; protein: number; carbs: number; fat: number } {
    const t = this.getTodayTotals(); const g = this.dailyGoals();
    return {
      calories: Math.max(0, g.calories - t.calories),
      protein: Math.max(0, g.protein - t.protein),
      carbs: Math.max(0, g.carbs - t.carbs),
      fat: Math.max(0, g.fat - t.fat)
    };
  }

  getPercentages(): { calories: number; protein: number; carbs: number; fat: number } {
    const t = this.getTodayTotals(); const g = this.dailyGoals();
    return {
      calories: g.calories > 0 ? Math.min(100, Math.round((t.calories / g.calories) * 100)) : 0,
      protein: g.protein > 0 ? Math.min(100, Math.round((t.protein / g.protein) * 100)) : 0,
      carbs: g.carbs > 0 ? Math.min(100, Math.round((t.carbs / g.carbs) * 100)) : 0,
      fat: g.fat > 0 ? Math.min(100, Math.round((t.fat / g.fat) * 100)) : 0
    };
  }

  getMealsByDateRange(start: string, end: string): Meal[] {
    return this.historyMeals().filter(m => {
      const d = m.date?.split('T')[0];
      return d && d >= start && d <= end;
    });
  }
}
