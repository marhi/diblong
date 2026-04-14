import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

type CatRow = {
  id: string;
  sortOrder: number;
  isActive: boolean;
  translations: { title: string; locale: string }[];
};

@Component({
  selector: 'app-admin-categories',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Categories</h1>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <ul *ngIf="rows.length" class="mt-6 space-y-2">
        <li *ngFor="let c of rows" class="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/40 px-4 py-3 text-sm">
          <div>
            <span class="text-zinc-100">{{ label(c) }}</span>
            <span class="ml-3 text-zinc-500">order {{ c.sortOrder }}</span>
            <span *ngIf="!c.isActive" class="ml-3 text-zinc-600">(inactive)</span>
          </div>
          <a class="text-gold-400 hover:underline" [routerLink]="['/admin/categories', c.id]">Edit</a>
        </li>
      </ul>
    </div>
  `,
})
export class AdminCategoriesPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: CatRow[] = [];
  err = '';

  label(c: CatRow) {
    return c.translations.find((t) => t.locale === 'en')?.title ?? c.translations[0]?.title ?? c.id;
  }

  ngOnInit() {
    this.api.categories().subscribe({
      next: (list) => (this.rows = list as CatRow[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load categories'),
    });
  }
}
