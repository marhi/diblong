import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export const ADMIN_TOKEN_KEY = 'dib_admin_access';

export type AdminUser = { id: string; email: string; roles: string[] };

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = environment.apiBaseUrl;
  private readonly userSubject = new BehaviorSubject<AdminUser | null>(null);
  readonly user$ = this.userSubject.asObservable();

  getAccessToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  }

  setAccessToken(token: string) {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }

  clearSession() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    this.userSubject.next(null);
  }

  snapshot(): AdminUser | null {
    return this.userSubject.value;
  }

  isAdmin(): boolean {
    return !!this.snapshot()?.roles?.includes('ADMIN');
  }

  refreshUser(): Observable<AdminUser> {
    return this.me().pipe(tap((u) => this.userSubject.next(u)));
  }

  authHeaders(): HttpHeaders {
    const t = this.getAccessToken();
    return t ? new HttpHeaders({ Authorization: `Bearer ${t}` }) : new HttpHeaders();
  }

  login(email: string, password: string): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(`${this.base}/auth/login`, { email, password })
      .pipe(
        tap((r) => {
          this.setAccessToken(r.accessToken);
        }),
      );
  }

  me(): Observable<AdminUser> {
    const t = this.getAccessToken();
    if (!t) {
      return throwError(() => new Error('no token'));
    }
    return this.http.get<AdminUser>(`${this.base}/auth/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${t}` }),
    });
  }

  logout() {
    this.clearSession();
    this.router.navigate(['/admin/login']);
  }
}
