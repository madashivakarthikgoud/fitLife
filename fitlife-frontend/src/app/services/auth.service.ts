import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

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

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  currentUser = signal<User | null>(null);
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('fitlife_token');
    const savedUser = localStorage.getItem('fitlife_user');
    if (token && savedUser) {
      this.currentUser.set(JSON.parse(savedUser));
      this.isLoggedIn.set(true);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('fitlife_token');
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
        .subscribe({
          next: (res) => {
            this.setSession(res);
            resolve(true);
          },
          error: () => resolve(false)
        });
    });
  }

  register(fullName: string, email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { fullName, email, password })
        .subscribe({
          next: (res) => {
            this.setSession(res);
            resolve(true);
          },
          error: () => resolve(false)
        });
    });
  }

  logout(): void {
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    localStorage.removeItem('fitlife_token');
    localStorage.removeItem('fitlife_user');
  }

  updateProfile(updates: Partial<User>): Promise<User | null> {
    return new Promise((resolve) => {
      this.http.put<User>(`${this.apiUrl}/users/profile`, updates)
        .subscribe({
          next: (user) => {
            this.currentUser.set(user);
            localStorage.setItem('fitlife_user', JSON.stringify(user));
            resolve(user);
          },
          error: () => resolve(null)
        });
    });
  }

  loadProfile(): void {
    this.http.get<User>(`${this.apiUrl}/users/profile`).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        localStorage.setItem('fitlife_user', JSON.stringify(user));
      }
    });
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem('fitlife_token', res.token);
    localStorage.setItem('fitlife_user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
    this.isLoggedIn.set(true);
  }

  getInitials(): string {
    const user = this.currentUser();
    if (!user || !user.fullName) return 'U';
    return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  getBMI(): number {
    const user = this.currentUser();
    if (!user || !user.heightCm || !user.weightKg) return 0;
    const heightM = user.heightCm / 100;
    return Math.round((user.weightKg / (heightM * heightM)) * 10) / 10;
  }

  getBMILabel(): string {
    const bmi = this.getBMI();
    if (bmi === 0) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  }
}
