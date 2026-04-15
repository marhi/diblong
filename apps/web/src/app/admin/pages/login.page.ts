import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../admin-auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <div class="w-full max-w-md rounded-2xl border border-white/10 bg-ink-900/80 p-8 shadow-glow">
        <h1 class="text-center font-display text-2xl tracking-[0.2em] text-gold-300">DIGO</h1>
        <p class="mt-2 text-center text-sm text-zinc-500">Admin sign in</p>
        <form class="mt-8 space-y-4" (ngSubmit)="submit()">
          <label class="block text-sm text-zinc-300">
            Email
            <input
              class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2"
              [(ngModel)]="email"
              name="email"
              type="email"
              autocomplete="username"
              required
            />
          </label>
          <label class="block text-sm text-zinc-300">
            Password
            <input
              class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2"
              [(ngModel)]="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
            />
          </label>
          <p *ngIf="error" class="text-sm text-red-300">{{ error }}</p>
          <button class="dib-btn w-full" type="submit" [disabled]="loading">{{ loading ? 'Signing in…' : 'Sign in' }}</button>
        </form>
        <a class="mt-6 block text-center text-sm text-zinc-500 hover:text-gold-300" routerLink="/sl">← Storefront</a>
      </div>
    </div>
  `,
})
export class AdminLoginPageComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);
  email = '';
  password = '';
  error = '';
  loading = false;

  submit() {
    this.error = '';
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.auth.refreshUser().subscribe({
          next: (u) => {
            const ok = u.roles?.includes('ADMIN') || u.roles?.includes('STAFF');
            if (!ok) {
              this.error = 'Account does not have admin or staff access.';
              this.auth.clearSession();
              this.loading = false;
              return;
            }
            this.router.navigate(['/admin/dashboard']);
          },
          error: () => {
            this.error = 'Could not load profile.';
            this.loading = false;
          },
        });
      },
      error: (e) => {
        this.error = e?.error?.message ?? 'Login failed';
        this.loading = false;
      },
    });
  }
}
