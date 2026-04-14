import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

type ProductRow = {
  id: string;
  sku: string;
  stock: number;
  isActive: boolean;
  price: unknown;
  category?: { translations?: { title: string }[] } | null;
};

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Products</h1>
      <p class="mt-2 text-sm text-zinc-500">Catalog — edit translations and merchandising on the detail page.</p>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngIf="rows.length" class="mt-6 overflow-x-auto rounded-xl border border-white/10">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-white/10 bg-ink-900/80 text-xs uppercase tracking-widest text-zinc-500">
            <tr>
              <th class="px-4 py-3">SKU</th>
              <th class="px-4 py-3">Category</th>
              <th class="px-4 py-3">Price</th>
              <th class="px-4 py-3">Stock</th>
              <th class="px-4 py-3">Active</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of rows" class="border-b border-white/5 hover:bg-white/[0.02]">
              <td class="px-4 py-3 font-mono text-xs text-gold-200/80">{{ p.sku }}</td>
              <td class="px-4 py-3 text-zinc-400">{{ p.category?.translations?.[0]?.title ?? '—' }}</td>
              <td class="px-4 py-3">€ {{ p.price }}</td>
              <td class="px-4 py-3">{{ p.stock }}</td>
              <td class="px-4 py-3">{{ p.isActive ? 'yes' : 'no' }}</td>
              <td class="px-4 py-3 text-right">
                <a class="text-gold-400 hover:underline" [routerLink]="['/admin/products', p.id]">Edit</a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminProductsPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: ProductRow[] = [];
  err = '';

  ngOnInit() {
    this.api.products().subscribe({
      next: (list) => (this.rows = list as ProductRow[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load products'),
    });
  }
}
