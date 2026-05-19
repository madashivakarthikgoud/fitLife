import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';

// Use Angular's default change detection. Removing `provideZoneChangeDetection`
// fixes rendering issues after upgrading to Angular 21 in this project.
bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [...appConfig.providers],
}).catch((err) => console.error(err));
