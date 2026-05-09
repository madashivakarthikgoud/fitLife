import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-progress-ring',
  standalone: true,
  template: `
    <div class="progress-ring-container" [style.width.px]="size" [style.height.px]="size">
      <svg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <circle
          class="ring-bg"
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          fill="none"
        />
        <circle
          class="ring-progress"
          [attr.cx]="size / 2"
          [attr.cy]="size / 2"
          [attr.r]="radius"
          [attr.stroke-width]="strokeWidth"
          [attr.stroke]="color"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="offset"
          fill="none"
          stroke-linecap="round"
        />
      </svg>
      <div class="ring-content">
        <span class="ring-value" [style.font-size.px]="size * 0.2" [style.color]="color">{{ percentage }}%</span>
        @if (label) {
          <span class="ring-label" [style.font-size.px]="size * 0.1">{{ label }}</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .progress-ring-container {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    svg {
      transform: rotate(-90deg);
    }

    .ring-bg {
      stroke: var(--border-color);
    }

    .ring-progress {
      transition: stroke-dashoffset 1s ease;
    }

    .ring-content {
      position: absolute;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .ring-value {
      font-weight: 700;
      line-height: 1;
    }

    .ring-label {
      color: var(--text-muted);
      margin-top: 2px;
      font-weight: 500;
    }
  `]
})
export class ProgressRingComponent {
  @Input() percentage = 0;
  @Input() size = 100;
  @Input() strokeWidth = 8;
  @Input() color = 'var(--green-primary)';
  @Input() label = '';

  get radius(): number {
    return (this.size - this.strokeWidth) / 2;
  }

  get circumference(): number {
    return 2 * Math.PI * this.radius;
  }

  get offset(): number {
    return this.circumference - (this.percentage / 100) * this.circumference;
  }
}
