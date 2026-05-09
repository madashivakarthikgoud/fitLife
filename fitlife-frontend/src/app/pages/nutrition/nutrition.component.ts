import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NutritionService } from '../../services/nutrition.service';
import { ToastService } from '../../services/toast.service';
import { ProgressRingComponent } from '../../shared/progress-ring/progress-ring.component';
import { EmptyStateComponent } from '../../shared/empty-state/empty-state.component';

@Component({
  selector: 'app-nutrition',
  standalone: true,
  imports: [FormsModule, ProgressRingComponent, EmptyStateComponent],
  templateUrl: './nutrition.component.html',
  styleUrl: './nutrition.component.scss'
})
export class NutritionComponent implements OnInit {
  nutritionService = inject(NutritionService);
  private toastService = inject(ToastService);

  showModal = false;
  searchQuery = '';
  searchResults: any[] = [];

  form = {
    foodName: '', mealType: 'Breakfast', quantity: 100, unit: 'g',
    calories: 0, protein: 0, carbs: 0, fat: 0
  };

  mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

  ngOnInit(): void { this.nutritionService.loadMeals(); }

  get pct() { return this.nutritionService.getPercentages(); }
  get totals() { return this.nutritionService.getTodayTotals(); }
  get remaining() { return this.nutritionService.getRemainingMacros(); }
  get goals() { return this.nutritionService.dailyGoals(); }
  get todayMeals() { return this.nutritionService.getTodayMeals(); }

  openModal(): void { this.resetForm(); this.showModal = true; }
  closeModal(): void { this.showModal = false; this.searchResults = []; }

  onSearch(): void {
    this.searchResults = this.nutritionService.searchFood(this.searchQuery);
  }

  selectFood(food: any): void {
    this.form.foodName = food.name;
    const mult = this.form.quantity / 100;
    this.form.calories = Math.round(food.caloriesPer100g * mult);
    this.form.protein = Math.round(food.proteinPer100g * mult);
    this.form.carbs = Math.round(food.carbsPer100g * mult);
    this.form.fat = Math.round(food.fatPer100g * mult);
    this.searchQuery = food.name;
    this.searchResults = [];
  }

  onQuantityChange(): void {
    const food = this.nutritionService.foodDatabase.find(f => f.name === this.form.foodName);
    if (food) {
      const mult = this.form.quantity / 100;
      this.form.calories = Math.round(food.caloriesPer100g * mult);
      this.form.protein = Math.round(food.proteinPer100g * mult);
      this.form.carbs = Math.round(food.carbsPer100g * mult);
      this.form.fat = Math.round(food.fatPer100g * mult);
    }
  }

  async saveMeal(): Promise<void> {
    if (!this.form.foodName.trim()) { this.toastService.error('Food item is required'); return; }
    if (this.form.calories <= 0) { this.toastService.error('Calories must be > 0'); return; }
    try {
      await this.nutritionService.addMeal(this.form);
      this.toastService.success('Meal logged successfully ✅');
      this.closeModal();
    } catch { this.toastService.error('Failed to save meal'); }
  }

  deleteMeal(id: number): void {
    this.nutritionService.deleteMeal(id);
    this.toastService.info('Meal removed');
  }

  private resetForm(): void {
    this.form = { foodName: '', mealType: 'Breakfast', quantity: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 };
    this.searchQuery = '';
  }
}
