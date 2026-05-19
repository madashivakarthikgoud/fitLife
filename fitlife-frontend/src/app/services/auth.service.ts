import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
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

interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  isLoggedIn = signal(false);
  currentUser = signal<User | null>(null);
  private apiUrl = environment.apiUrl;
  private calc = inject(FitnessCalculatorService);

  constructor(private http: HttpClient, private router: Router, private toast: ToastService) {
    const token = localStorage.getItem('fitlife_token');
    const savedUser = localStorage.getItem('fitlife_user');
    if (token && savedUser && !this.isTokenExpired(token)) {
      try {
        this.currentUser.set(JSON.parse(savedUser));
        this.isLoggedIn.set(true);
        // Always refresh profile from server to get latest data
        this.loadProfile();
      } catch {
        // Corrupted local storage should not crash app bootstrap.
        this.logout();
      }
    } else if (token) {
      // Token exists but is expired — clean up
      this.logout();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('fitlife_token');
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
        .subscribe({
          next: (res) => { this.setSession(res); this.toast.success('Login successful'); resolve(true); },
          error: (err) => {
            const message = err.status === 0
              ? 'Cannot connect to server. Make sure backend is running.'
              : (err.error?.error || 'Login failed.');
            this.toast.error(message);
            resolve(false);
          }
        });
    });
  }

  register(fullName: string, email: string, password: string, securityQuestion: string, securityAnswer: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { fullName, email, password, securityQuestion, securityAnswer })
        .subscribe({
          next: (res) => { this.setSession(res); this.toast.success('Registration successful'); resolve(true); },
          error: (err) => {
            const message = err.status === 0
              ? 'Cannot connect to server. Make sure backend is running.'
              : (err.error?.error || 'Registration failed.');
            this.toast.error(message);
            resolve(false);
          }
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
            this.toast.success('Profile updated successfully');
            resolve(user);
          },
          error: (err) => { this.toast.error(err.error?.error || 'Failed to update profile'); resolve(null); }
        });
    });
  }

  loadProfile(): void {
    this.http.get<User>(`${this.apiUrl}/users/profile`).subscribe({
      next: (user) => {
        this.currentUser.set(user);
        localStorage.setItem('fitlife_user', JSON.stringify(user));
      },
      error: () => {
        // Silently fail — interceptor handles 401 session expiry
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

  getBMI(): number { return this.calc.calcBMI(this.currentUser() || {} as User); }
  getBMILabel(): string { return this.calc.calcBMILabel(this.getBMI()); }

  getSecurityQuestion(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.http.post<{ securityQuestion: string }>(`${this.apiUrl}/auth/security-question`, { email })
        .subscribe({
          next: (res) => resolve(res.securityQuestion),
          error: (err) => reject(err.error?.error || 'No account found with this email')
        });
    });
  }

  resetPassword(email: string, securityAnswer: string, newPassword: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.http.post<{ message: string }>(`${this.apiUrl}/auth/reset-password`, { email, securityAnswer, newPassword })
        .subscribe({
          next: () => resolve(),
          error: (err) => reject(err.error?.error || err.error?.message || 'Reset failed')
        });
    });
  }
}

