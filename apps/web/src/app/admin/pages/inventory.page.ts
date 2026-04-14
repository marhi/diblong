import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

type Row = { id: string; sku: string; stock: number; isActive: boolean };

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, RouterLink],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Inventory</h1>
      <p class="mt-2 text-sm text-zinc-500">Active products sorted by stock (lowest first).</p>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngIf="rows.length" class="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-white/10 bg-ink-900/80 text-xs uppercase tracking-widest text-zinc-500">
            <tr>
              <th class="px-4 py-3">SKU</th>
              <th class="px-4 py-3">Stock</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of rows" class="border-b border-zinc-800" [ngClass]="{ 'bg-amber-950/20': isLowStock(p) }">
              <td class="px-4 py-3 font-mono text-xs">{{ p.sku }}</td>
              <td class="px-4 py-3">{{ p.stock }}</td>
              <td class="px-4 py-3 text-right">
                <a class="text-gold-400 hover:underline" [routerLink]="['/admin/products', p.id]">Adjust</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminInventoryPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: Row[] = [];
  err = '';

  isLowStock(p: Row) {
    return p.stock < 10;
  }

  ngOnInit() {
    this.api.products().subscribe({
      next: (list) => {
        const all = (list as Row[]).filter((p) => p.isActive);
        all.sort((a, b) => a.stock - b.stock);
        this.rows = all;
      },
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load'),
    });
  }
}
