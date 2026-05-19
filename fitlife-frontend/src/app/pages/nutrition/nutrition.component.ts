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
  /** When true, macros are manually entered — don't auto-recalculate on quantity change */
  isCustomEntry = false;

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
  closeModal(): void { this.showModal = false; this.searchResults = []; this.isCustomEntry = false; }

  onSearch(): void {
    this.searchResults = this.nutritionService.searchFood(this.searchQuery);
    // If user typed something not found in DB → custom entry mode
    this.isCustomEntry = this.searchQuery.trim().length > 0 && this.searchResults.length === 0;
    if (this.isCustomEntry) {
      this.form.foodName = this.searchQuery.trim();
    }
  }

  selectFood(food: any): void {
    this.isCustomEntry = false;
    this.form.foodName = food.name;
    this.applyFoodMacros(food, this.form.quantity);
    this.searchQuery = food.name;
    this.searchResults = [];
  }

  onQuantityChange(): void {
    // Only auto-recalculate if user selected a DB food (not custom entry)
    if (this.isCustomEntry) return;
    const food = this.nutritionService.foodDatabase.find(f => f.name === this.form.foodName);
    if (food) this.applyFoodMacros(food, this.form.quantity);
  }

  /** Mark as custom so future quantity changes won't override manually typed macros */
  onMacrosManualEdit(): void {
    this.isCustomEntry = true;
  }

  private applyFoodMacros(food: any, quantity: number): void {
    const mult = quantity / 100;
    this.form.calories = Math.round(food.caloriesPer100g * mult);
    this.form.protein = Math.round(food.proteinPer100g * mult);
    this.form.carbs = Math.round(food.carbsPer100g * mult);
    this.form.fat = Math.round(food.fatPer100g * mult);
  }

  async saveMeal(): Promise<void> {
    if (!this.form.foodName.trim()) { this.toastService.error('Food name is required'); return; }
    if (this.form.calories < 0) { this.toastService.error('Calories cannot be negative'); return; }
    if (this.form.quantity <= 0) { this.toastService.error('Quantity must be > 0'); return; }
    try {
      await this.nutritionService.addMeal(this.form);
      this.toastService.success('Meal logged successfully ✅');
      this.closeModal();
    } catch {
      // Error toast is already shown by the service
    }
  }

  deleteMeal(id: number): void {
    this.nutritionService.deleteMeal(id);
    this.toastService.info('Meal removed');
  }

  private resetForm(): void {
    this.form = { foodName: '', mealType: 'Breakfast', quantity: 100, unit: 'g', calories: 0, protein: 0, carbs: 0, fat: 0 };
    this.searchQuery = '';
    this.isCustomEntry = false;
  }
}
