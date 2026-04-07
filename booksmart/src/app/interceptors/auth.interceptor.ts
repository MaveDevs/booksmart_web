import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem('access_token');

  console.log(' INTERCEPTOR FUNCIONANDO');
  console.log(' TOKEN:', token);

  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(cloned);
  }

  return next(req);
};