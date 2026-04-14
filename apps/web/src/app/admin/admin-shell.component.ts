import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { environment } from '../../environments/environment';
import { AdminAuthService } from './admin-auth.service';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgFor, NgIf],
  template: `
    <div class="min-h-screen bg-ink-950 text-zinc-100">
      <header class="border-b border-white/5 bg-ink-900/80 backdrop-blur">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <a routerLink="/admin/dashboard" class="font-display text-xl tracking-[0.25em] text-gold-300"
            >DIBLONG ADMIN</a
          >
          <div class="flex items-center gap-3 text-sm">
            <span *ngIf="email" class="hidden text-zinc-500 sm:inline">{{ email }}</span>
            <a class="rounded-full border border-white/10 px-3 py-1.5 hover:border-gold-500/40" [href]="environment.apiDocsUrl"
              >API docs</a
            >
            <button type="button" class="dib-btn !py-1.5 !px-4 text-xs" (click)="logout()">Logout</button>
          </div>
        </div>
      </header>
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[220px_1fr]">
        <aside class="space-y-1 text-sm lg:block">
          <a
            *ngFor="let item of mainNav"
            [routerLink]="item.path"
            routerLinkActive="bg-white/10 text-gold-200"
            class="block rounded-xl px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
            >{{ item.label }}</a
          >
          <ng-container *ngIf="auth.isAdmin()">
            <div class="my-4 border-t border-white/5 pt-4 text-xs uppercase tracking-widest text-zinc-600">Admin</div>
            <a
              *ngFor="let item of adminNav"
              [routerLink]="item.path"
              routerLinkActive="bg-white/10 text-gold-200"
              class="block rounded-xl px-3 py-2 text-zinc-400 hover:bg-white/5 hover:text-zinc-100"
              >{{ item.label }}</a
            >
          </ng-container>
        </aside>
        <section class="min-h-[50vh]">
          <router-outlet />
        </section>
      </div>
    </div>
  `,
})
export class AdminShellComponent implements OnInit {
  readonly auth = inject(AdminAuthService);
  readonly environment = environment;
  email = '';

  readonly mainNav = [
    { label: 'Dashboard', path: '/admin/dashboard' },
    { label: 'Orders', path: '/admin/orders' },
    { label: 'Products', path: '/admin/products' },
    { label: 'Categories', path: '/admin/categories' },
    { label: 'Inventory', path: '/admin/inventory' },
    { label: 'Shipping', path: '/admin/shipping' },
    { label: 'CMS pages', path: '/admin/cms' },
    { label: 'Media', path: '/admin/media' },
    { label: 'Promo', path: '/admin/promo' },
    { label: 'SEO entries', path: '/admin/seo' },
  ];

  readonly adminNav = [
    { label: 'Users', path: '/admin/users' },
    { label: 'Settings', path: '/admin/settings' },
  ];

  ngOnInit() {
    this.auth.refreshUser().subscribe({
      next: (u) => (this.email = u.email),
      error: () => (this.email = ''),
    });
  }

  logout() {
    this.auth.logout();
  }
}
