import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'workouts', loadComponent: () => import('./pages/workouts/workouts.component').then(m => m.WorkoutsComponent) },
      { path: 'nutrition', loadComponent: () => import('./pages/nutrition/nutrition.component').then(m => m.NutritionComponent) },
      { path: 'goals', loadComponent: () => import('./pages/goals/goals.component').then(m => m.GoalsComponent) },
      { path: 'history', loadComponent: () => import('./pages/history/history.component').then(m => m.HistoryComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'water', loadComponent: () => import('./pages/water/water.component').then(m => m.WaterComponent) },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
