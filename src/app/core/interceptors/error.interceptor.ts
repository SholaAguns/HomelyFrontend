import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AppError } from '../../shared/models/error-models';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const appError: AppError = {
        statusCode: httpError.status,
        errorCode: httpError.error?.error_code ?? 'UNKNOWN_ERROR',
        message: httpError.error?.message ?? 'An unexpected error occurred.',
        fieldErrors: httpError.error?.field_errors,
      };

      if (httpError.status === 401) {
        router.navigate(['/login']);
      }

      return throwError(() => appError);
    })
  );
};
