import { HttpInterceptorFn } from '@angular/common/http';
import { ADMIN_TOKEN_KEY } from './admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  if (typeof localStorage === 'undefined') {
    return next(req);
  }
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  const isAdmin = req.url.includes('/api/v1/admin');
  const isMe = req.url.includes('/api/v1/auth/me');
  if (token && (isAdmin || isMe)) {
    return next(
      req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      }),
    );
  }
  return next(req);
};
