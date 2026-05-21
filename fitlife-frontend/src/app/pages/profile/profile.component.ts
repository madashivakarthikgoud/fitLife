import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { FitnessCalculatorService } from '../../services/fitness-calculator.service';
import { WaterService } from '../../services/water.service';
import { NutritionService } from '../../services/nutrition.service';
import { ProgressAvatarComponent } from '../../shared/progress-avatar/progress-avatar.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, ProgressAvatarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  authService = inject(AuthService);
  private calc = inject(FitnessCalculatorService);
  private waterService = inject(WaterService);
  private nutritionService = inject(NutritionService);
  private toastService = inject(ToastService);

  isEditing = false;

  form = {
    fullName: '', email: '', age: null as number | null, gender: 'Male',
    heightCm: null as number | null, weightKg: null as number | null,
    activityLevel: 'Moderately Active', fitnessGoal: 'Build Muscle'
  };

  errors: Record<string, string> = {};
  genders = ['Male', 'Female', 'Other'];
  activityLevels = ['Sedentary', 'Lightly Active', 'Moderately Active', 'Very Active'];
  fitnessGoals = ['Lose Weight', 'Build Muscle', 'Maintain', 'Improve Endurance'];

  get user() { return this.authService.currentUser(); }
  get stats() { return this.calc.getStats(this.user); }
  get bmi() { return this.stats?.bmi ?? 0; }
  get bmiLabel() { return this.stats?.bmiLabel ?? 'N/A'; }
  get bmiColor() { return this.stats?.bmiColor ?? 'var(--text-muted)'; }
  get nutritionPct() { return this.nutritionService.getPercentages().calories; }
  get hydrationPct() { return this.waterService.progressPct; }

  toggleEdit(): void {
    if (!this.isEditing && this.user) {
      this.form = {
        fullName: this.user.fullName, email: this.user.email,
        age: this.user.age, gender: this.user.gender || 'Male',
        heightCm: this.user.heightCm, weightKg: this.user.weightKg,
        activityLevel: this.user.activityLevel || 'Moderately Active',
        fitnessGoal: this.user.fitnessGoal || 'Maintain'
      };
    }
    this.isEditing = !this.isEditing;
    this.errors = {};
  }

  async saveProfile(): Promise<void> {
    this.errors = {};
    if (!this.form.fullName.trim()) this.errors['name'] = 'Name cannot be empty';
    if (this.form.age !== null && (this.form.age < 10 || this.form.age > 100))
      this.errors['age'] = 'Age must be 10-100';
    if (this.form.heightCm !== null && (this.form.heightCm < 50 || this.form.heightCm > 250))
      this.errors['height'] = 'Height must be 50-250 cm';
    if (this.form.weightKg !== null && (this.form.weightKg < 20 || this.form.weightKg > 300))
      this.errors['weight'] = 'Weight must be 20-300 kg';

    if (Object.keys(this.errors).length > 0) { this.toastService.error('Please fix errors'); return; }

    const result = await this.authService.updateProfile(this.form);
    if (result) {
      this.isEditing = false;
    }
  }

}
