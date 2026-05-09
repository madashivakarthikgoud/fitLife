import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);

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
  get bmi() { return this.authService.getBMI(); }
  get bmiLabel() { return this.authService.getBMILabel(); }
  get bmiColor(): string {
    const b = this.bmi;
    if (b === 0) return 'var(--text-muted)';
    if (b < 18.5) return 'var(--red-primary)';
    if (b < 25) return 'var(--green-primary)';
    if (b < 30) return 'var(--orange-primary)';
    return 'var(--red-primary)';
  }

  toggleEdit(): void {
    if (!this.isEditing && this.user) {
      this.form = {
        fullName: this.user.fullName, email: this.user.email,
        age: this.user.age, gender: this.user.gender,
        heightCm: this.user.heightCm, weightKg: this.user.weightKg,
        activityLevel: this.user.activityLevel, fitnessGoal: this.user.fitnessGoal
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
      this.toastService.success('Profile updated successfully ✅');
    } else {
      this.toastService.error('Failed to update profile');
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastService.info('Logged out successfully');
    this.router.navigate(['/login']);
  }
}
