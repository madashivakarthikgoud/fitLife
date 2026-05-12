import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const token = localStorage.getItem('fitlife_token');

  // Don't attach token or intercept auth endpoints
  const isAuthEndpoint = req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/security-question') ||
    req.url.includes('/auth/reset-password');

  if (token && !isAuthEndpoint) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 401 && !isAuthEndpoint) {
        // Token expired or invalid — clear session and redirect to login
        authService.logout();
        const currentUrl = router.url;
        if (!currentUrl.includes('/login')) {
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
