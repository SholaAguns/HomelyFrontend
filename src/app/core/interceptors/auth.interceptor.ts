import { HttpInterceptorFn } from '@angular/common/http';

// Cookies are sent automatically via withCredentials in ApiService.
// No Authorization header injection needed.
export const authInterceptor: HttpInterceptorFn = (req, next) => next(req);
