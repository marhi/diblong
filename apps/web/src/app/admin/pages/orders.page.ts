import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

type OrderRow = {
  id: string;
  status: string;
  total: unknown;
  createdAt: string;
  guestEmail?: string | null;
  user?: { email: string } | null;
};

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [NgFor, NgIf, DatePipe, RouterLink],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Orders</h1>
      <p class="mt-2 text-sm text-zinc-500">Latest 100 orders.</p>
      <div *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</div>
      <div *ngIf="rows.length" class="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-white/10 bg-ink-900/80 text-xs uppercase tracking-widest text-zinc-500">
            <tr>
              <th class="px-4 py-3">When</th>
              <th class="px-4 py-3">Status</th>
              <th class="px-4 py-3">Total</th>
              <th class="px-4 py-3">Customer</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let o of rows" class="border-b border-white/5 hover:bg-white/[0.02]">
              <td class="px-4 py-3 text-zinc-400">{{ o.createdAt | date : 'medium' }}</td>
              <td class="px-4 py-3 text-gold-200/90">{{ o.status }}</td>
              <td class="px-4 py-3">€ {{ o.total }}</td>
              <td class="px-4 py-3 text-zinc-400">{{ o.user?.email || o.guestEmail || '—' }}</td>
              <td class="px-4 py-3 text-right">
                <a class="text-gold-400 hover:underline" [routerLink]="['/admin/orders', o.id]">Open</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminOrdersPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: OrderRow[] = [];
  err = '';

  ngOnInit() {
    this.api.orders().subscribe({
      next: (list) => (this.rows = list as OrderRow[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load orders'),
    });
  }
}
