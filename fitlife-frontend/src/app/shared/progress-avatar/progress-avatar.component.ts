import { Component, Input, computed, signal } from '@angular/core';

/**
 * Progress Avatar - SVG-based profile picture showing fitness progress.
 * Outer ring = BMI indicator (color-coded arc)
 * Middle ring = daily nutrition goal progress
 * Inner ring = hydration progress
 * Center = user initials
 */
@Component({
  selector: 'app-progress-avatar',
  standalone: true,
  template: `
    <div class="avatar-wrapper" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <!-- Background circles -->
        <circle [attr.cx]="c" [attr.cy]="c" [attr.r]="r1" fill="none" stroke="rgba(255,255,255,0.06)" [attr.stroke-width]="ringW"/>
        <circle [attr.cx]="c" [attr.cy]="c" [attr.r]="r2" fill="none" stroke="rgba(255,255,255,0.06)" [attr.stroke-width]="ringW"/>
        <circle [attr.cx]="c" [attr.cy]="c" [attr.r]="r3" fill="none" stroke="rgba(255,255,255,0.06)" [attr.stroke-width]="ringW"/>

        <!-- Outer ring: BMI (color-coded) -->
        <circle
          [attr.cx]="c" [attr.cy]="c" [attr.r]="r1"
          fill="none" [attr.stroke]="bmiColor"
          [attr.stroke-width]="ringW"
          [attr.stroke-dasharray]="circumference(r1)"
          [attr.stroke-dashoffset]="dashOffset(r1, bmiPct)"
          stroke-linecap="round"
          [attr.transform]="'rotate(-90 ' + c + ' ' + c + ')'"
          style="transition: stroke-dashoffset 0.8s ease"
        />

        <!-- Middle ring: Nutrition goal -->
        <circle
          [attr.cx]="c" [attr.cy]="c" [attr.r]="r2"
          fill="none" stroke="#4ade80"
          [attr.stroke-width]="ringW"
          [attr.stroke-dasharray]="circumference(r2)"
          [attr.stroke-dashoffset]="dashOffset(r2, nutritionPct)"
          stroke-linecap="round"
          [attr.transform]="'rotate(-90 ' + c + ' ' + c + ')'"
          style="transition: stroke-dashoffset 0.8s ease"
        />

        <!-- Inner ring: Hydration -->
        <circle
          [attr.cx]="c" [attr.cy]="c" [attr.r]="r3"
          fill="none" stroke="#3b82f6"
          [attr.stroke-width]="ringW"
          [attr.stroke-dasharray]="circumference(r3)"
          [attr.stroke-dashoffset]="dashOffset(r3, hydrationPct)"
          stroke-linecap="round"
          [attr.transform]="'rotate(-90 ' + c + ' ' + c + ')'"
          style="transition: stroke-dashoffset 0.8s ease"
        />

        <!-- Center background -->
        <circle [attr.cx]="c" [attr.cy]="c" [attr.r]="centerR" fill="var(--bg-card)" stroke="var(--border-color)" stroke-width="1"/>

        <!-- User initials -->
        <text
          [attr.x]="c" [attr.y]="c"
          text-anchor="middle" dominant-baseline="central"
          [attr.font-size]="initialsSize"
          font-weight="700" fill="var(--text-primary)"
          font-family="system-ui, sans-serif"
        >{{ initials }}</text>
      </svg>

      <!-- Legend badges -->
      <div class="avatar-badges">
        <span class="badge bmi-badge" [style.color]="bmiColor" title="BMI: {{ bmi }}">
          {{ bmiLabel }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .avatar-wrapper {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }
    .avatar-badges {
      margin-top: 0.4rem;
      display: flex;
      gap: 0.4rem;
      flex-wrap: wrap;
      justify-content: center;
    }
    .badge {
      font-size: 0.65rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 999px;
      background: rgba(255,255,255,0.07);
      letter-spacing: 0.3px;
    }
  `]
})
export class ProgressAvatarComponent {
  @Input() size = 120;
  @Input() initials = 'U';
  @Input() bmi = 0;
  @Input() bmiLabel = 'N/A';
  @Input() bmiColor = '#9ca3af';
  /** 0-100 */
  @Input() nutritionPct = 0;
  /** 0-100 */
  @Input() hydrationPct = 0;

  readonly ringW = 7;

  get c() { return this.size / 2; }
  get r1() { return this.c - this.ringW; }           // outer: BMI
  get r2() { return this.r1 - this.ringW - 3; }      // middle: nutrition
  get r3() { return this.r2 - this.ringW - 3; }      // inner: hydration
  get centerR() { return this.r3 - this.ringW - 2; }
  get initialsSize() { return Math.round(this.size * 0.22); }

  /** BMI arc: map bmi 0-40 to 0-100% */
  get bmiPct(): number {
    if (this.bmi === 0) return 0;
    return Math.min(100, Math.round((this.bmi / 40) * 100));
  }

  circumference(r: number): number {
    return Math.round(2 * Math.PI * r * 10) / 10;
  }

  dashOffset(r: number, pct: number): number {
    const circ = this.circumference(r);
    return Math.round(circ * (1 - pct / 100) * 10) / 10;
  }
}

