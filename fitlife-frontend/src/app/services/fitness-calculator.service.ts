import { Injectable } from '@angular/core';
import { User } from './auth.service';

export interface FitnessStats {
  bmi: number;
  bmiLabel: string;
  bmiColor: string;
  bmr: number;
  tdee: number;
  caloricTarget: number;
  proteinTarget: number;   // grams
  carbsTarget: number;     // grams
  fatTarget: number;       // grams
  waterGoalMl: number;     // ml per day
}

@Injectable({ providedIn: 'root' })
export class FitnessCalculatorService {

  private activityMultiplier(level: string): number {
    switch (level) {
      case 'Sedentary':        return 1.2;
      case 'Lightly Active':   return 1.375;
      case 'Very Active':      return 1.725;
      case 'Moderately Active':
      default:                 return 1.55;
    }
  }

  /**
   * Mifflin-St Jeor BMR
   * Male:   10*kg + 6.25*cm - 5*age + 5
   * Female: 10*kg + 6.25*cm - 5*age - 161
   * Other:  average of the two
   */
  calcBMR(user: User): number {
    if (!user.weightKg || !user.heightCm || !user.age) return 0;
    const base = (10 * user.weightKg) + (6.25 * user.heightCm) - (5 * user.age);
    if (user.gender === 'Male')   return Math.round(base + 5);
    if (user.gender === 'Female') return Math.round(base - 161);
    if (!user.gender) return Math.round(base - 78); // No gender set yet
    return Math.round(base - 78); // Other
  }

  calcTDEE(user: User): number {
    const bmr = this.calcBMR(user);
    if (bmr === 0) return 0;
    return Math.round(bmr * this.activityMultiplier(user.activityLevel));
  }

  calcCaloricTarget(user: User): number {
    const tdee = this.calcTDEE(user);
    if (tdee === 0) return 2000;
    switch (user.fitnessGoal) {
      case 'Lose Weight':       return Math.max(1200, tdee - 500);
      case 'Build Muscle':      return tdee + 300;
      case 'Improve Endurance': return tdee + 200;
      case 'Maintain':
      default:                  return tdee;
    }
  }

  /** Macro split (protein g, carbs g, fat g) from caloric target based on goal */
  calcMacros(user: User): { protein: number; carbs: number; fat: number } {
    const cal = this.calcCaloricTarget(user);
    let proteinPct: number, carbsPct: number, fatPct: number;

    switch (user.fitnessGoal) {
      case 'Lose Weight':
        proteinPct = 0.40; carbsPct = 0.30; fatPct = 0.30; break;
      case 'Build Muscle':
        proteinPct = 0.30; carbsPct = 0.45; fatPct = 0.25; break;
      case 'Improve Endurance':
        proteinPct = 0.20; carbsPct = 0.55; fatPct = 0.25; break;
      case 'Maintain':
      default:
        proteinPct = 0.25; carbsPct = 0.50; fatPct = 0.25;
    }

    return {
      protein: Math.round((cal * proteinPct) / 4),  // 4 kcal per g
      carbs: Math.round((cal * carbsPct) / 4),
      fat: Math.round((cal * fatPct) / 9),           // 9 kcal per g
    };
  }

  calcBMI(user: User): number {
    if (!user.heightCm || !user.weightKg) return 0;
    const h = user.heightCm / 100;
    return Math.round((user.weightKg / (h * h)) * 10) / 10;
  }

  calcBMILabel(bmi: number): string {
    if (bmi === 0) return 'N/A';
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25)   return 'Normal';
    if (bmi < 30)   return 'Overweight';
    return 'Obese';
  }

  calcBMIColor(bmi: number): string {
    if (bmi === 0)  return 'var(--text-muted)';
    if (bmi < 18.5) return '#ef4444';
    if (bmi < 25)   return '#4ade80';
    if (bmi < 30)   return '#f97316';
    return '#ef4444';
  }

  /** Daily water goal: 35 ml per kg body weight */
  calcWaterGoalMl(user: User): number {
    if (!user.weightKg) return 2000;
    return Math.round(user.weightKg * 35);
  }


  getStats(user: User | null): FitnessStats | null {
    if (!user) return null;
    const bmi = this.calcBMI(user);
    const tdee = this.calcTDEE(user);
    const caloricTarget = this.calcCaloricTarget(user);
    const macros = this.calcMacros(user);
    return {
      bmi,
      bmiLabel: this.calcBMILabel(bmi),
      bmiColor: this.calcBMIColor(bmi),
      bmr: this.calcBMR(user),
      tdee,
      caloricTarget,
      proteinTarget: macros.protein,
      carbsTarget: macros.carbs,
      fatTarget: macros.fat,
      waterGoalMl: this.calcWaterGoalMl(user),
    };
  }
}

