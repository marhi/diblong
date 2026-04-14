import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AdminApiService } from '../admin-api.service';

type Stats = {
  ordersByStatus: { status: string; count: number }[];
  products: number;
  users: number;
  revenueTotal: string;
  lowStockProducts: number;
};

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Dashboard</h1>
      <p class="mt-2 text-sm text-zinc-500">Operational overview — data from the live API.</p>

      <div *ngIf="stats" class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div class="dib-card p-5">
          <div class="text-xs uppercase tracking-widest text-zinc-500">Products</div>
          <div class="mt-2 text-3xl text-zinc-100">{{ stats.products }}</div>
        </div>
        <div class="dib-card p-5">
          <div class="text-xs uppercase tracking-widest text-zinc-500">Users</div>
          <div class="mt-2 text-3xl text-zinc-100">{{ stats.users }}</div>
        </div>
        <div class="dib-card p-5">
          <div class="text-xs uppercase tracking-widest text-zinc-500">Paid revenue (sum)</div>
          <div class="mt-2 text-2xl text-gold-300">
            € {{ (+stats.revenueTotal || 0) | number : '1.2-2' }}
          </div>
        </div>
        <div class="dib-card p-5">
          <div class="text-xs uppercase tracking-widest text-zinc-500">Low stock (&lt;10)</div>
          <div class="mt-2 text-3xl text-amber-300">{{ stats.lowStockProducts }}</div>
        </div>
      </div>

      <div *ngIf="stats" class="mt-8 dib-card p-6">
        <h2 class="font-display text-xl text-zinc-200">Orders by status</h2>
        <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div
            *ngFor="let o of stats.ordersByStatus"
            class="flex justify-between rounded-lg bg-ink-950/60 px-3 py-2 text-sm"
          >
            <span class="text-zinc-400">{{ o.status }}</span>
            <span class="text-gold-300">{{ o.count }}</span>
          </div>
        </div>
      </div>

      <p *ngIf="err" class="mt-6 text-sm text-red-300">{{ err }}</p>
    </div>
  `,
})
export class AdminDashboardPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  stats: Stats | null = null;
  err = '';

  ngOnInit() {
    this.api.stats().subscribe({
      next: (raw) => (this.stats = raw as Stats),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load stats'),
    });
  }
}
