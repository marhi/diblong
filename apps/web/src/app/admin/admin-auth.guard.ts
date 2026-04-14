import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AdminAuthService } from './admin-auth.service';

export const adminAuthGuard: CanActivateFn = () => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  if (!auth.getAccessToken()) {
    router.navigate(['/admin/login']);
    return false;
  }
  return auth.me().pipe(
    map((u) => {
      const ok = u.roles?.includes('ADMIN') || u.roles?.includes('STAFF');
      if (!ok) {
        router.navigate(['/admin/login']);
        return false;
      }
      return true;
    }),
    catchError(() => {
      auth.clearSession();
      router.navigate(['/admin/login']);
      return of(false);
    }),
  );
};
