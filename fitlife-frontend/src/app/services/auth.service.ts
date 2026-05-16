import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastService } from './toast.service';
import { FitnessCalculatorService } from './fitness-calculator.service';

export interface User {
  id: number;
  fullName: string;
  email: string;
  age: number | null;
  gender: string;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: string;
  fitnessGoal: string;
  avatarUrl: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<User | null>(null);
  private apiUrl = environment.apiUrl;
  private calc = inject(FitnessCalculatorService);

  constructor(private http: HttpClient, private toast: ToastService) {
    this.loadProfile();
  }

  updateProfile(updates: Partial<User>): Promise<User | null> {
    return new Promise((resolve) => {
      this.http.put<User>(`${this.apiUrl}/users/profile`, updates)
        .subscribe({
          next: (user) => {
            this.currentUser.set(user);
            this.toast.success('Profile updated successfully');
            resolve(user);
          },
          error: (err) => { this.toast.error(err.error?.error || 'Failed to update profile'); resolve(null); }
        });
    });
  }

  loadProfile(): void {
    this.http.get<User>(`${this.apiUrl}/users/profile`).subscribe({
      next: (user) => { this.currentUser.set(user); },
      error: () => {}
    });
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user || !user.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getBMI(): number { return this.calc.calcBMI(this.currentUser() || {} as User); }
  getBMILabel(): string { return this.calc.calcBMILabel(this.getBMI()); }
}


