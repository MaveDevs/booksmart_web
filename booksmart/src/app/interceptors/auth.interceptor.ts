import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  // 🔥 Evita errores en SSR
  if (typeof window === 'undefined') {
    return next(req);
  }

  const token = localStorage.getItem('access_token');

  console.log('🔥 INTERCEPTOR FUNCIONANDO');
  console.log('🔑 TOKEN:', token);

  // 🚫 No agregar token al login
  if (req.url.includes('/auth/login')) {
    return next(req);
  }

  // ✅ Si hay token, lo agrega
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