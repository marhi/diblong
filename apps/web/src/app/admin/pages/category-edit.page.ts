import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

type CatTrans = {
  id: string;
  locale: string;
  title: string;
  slug: string;
  introHtml?: string | null;
};

type Category = {
  id: string;
  sortOrder: number;
  isActive: boolean;
  translations: CatTrans[];
};

@Component({
  selector: 'app-admin-category-edit',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule, RouterLink],
  template: `
    <ng-container *ngIf="category">
      <a class="text-sm text-zinc-500 hover:text-gold-300" routerLink="/admin/categories">← Categories</a>
      <h1 class="mt-4 font-display text-3xl text-gold-200">Category</h1>
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="dib-card space-y-4 p-6">
          <h2 class="font-display text-lg text-zinc-200">Core</h2>
          <label class="block text-sm text-zinc-300">
            Sort order
            <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" type="number" [(ngModel)]="core.sortOrder" name="so" />
          </label>
          <label class="flex items-center gap-2 text-sm text-zinc-300">
            <input type="checkbox" [(ngModel)]="core.isActive" name="act" /> Active
          </label>
          <button type="button" class="dib-btn text-sm" [disabled]="saving" (click)="saveCore(category!.id)">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
        <div class="dib-card space-y-4 p-6">
          <h2 class="font-display text-lg text-zinc-200">Locale: {{ activeLocale }}</h2>
          <div class="flex gap-2">
            <button
              type="button"
              *ngFor="let loc of locales"
              class="rounded-lg px-3 py-1 text-xs"
              [ngClass]="{
                'bg-gold-500/20 text-gold-200': loc === activeLocale,
                'text-zinc-500': loc !== activeLocale,
              }"
              (click)="pickLocale(loc)"
            >
              {{ loc }}
            </button>
          </div>
          <ng-container *ngIf="activeTrans">
            <label class="block text-sm text-zinc-300">
              Title
              <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" [(ngModel)]="activeTrans.title" name="title" />
            </label>
            <label class="block text-sm text-zinc-300">
              Slug
              <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" [(ngModel)]="activeTrans.slug" name="slug" />
            </label>
            <label class="block text-sm text-zinc-300">
              Intro HTML
              <textarea class="mt-1 min-h-[160px] w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm" [(ngModel)]="activeTrans.introHtml" name="intro"></textarea>
            </label>
            <button type="button" class="dib-btn text-sm" [disabled]="savingT" (click)="saveTrans(category!.id, activeTrans)">
              {{ savingT ? 'Saving…' : 'Save translation' }}
            </button>
          </ng-container>
        </div>
      </div>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
    </ng-container>
  `,
})
export class AdminCategoryEditPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  category: Category | null = null;
  locales = ['sl', 'en', 'hr'] as const;
  activeLocale = 'sl';
  activeTrans: CatTrans | null = null;
  core = { sortOrder: 0, isActive: true };
  err = '';
  saving = false;
  savingT = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.api.category(id).subscribe({
      next: (raw) => this.apply(raw as Category),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load category'),
    });
  }

  apply(c: Category) {
    this.category = c;
    this.core = { sortOrder: c.sortOrder, isActive: c.isActive };
    this.pickLocale(this.activeLocale);
  }

  pickLocale(loc: string) {
    this.activeLocale = loc;
    const t = this.category?.translations.find((x) => x.locale === loc);
    this.activeTrans = t ? { ...t, introHtml: t.introHtml ?? '' } : null;
  }

  saveCore(id: string) {
    this.saving = true;
    this.api.patchCategory(id, { sortOrder: this.core.sortOrder, isActive: this.core.isActive }).subscribe({
      next: (raw) => {
        this.apply(raw as Category);
        this.saving = false;
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Save failed';
        this.saving = false;
      },
    });
  }

  saveTrans(categoryId: string, t: CatTrans) {
    this.savingT = true;
    this.api.patchCategoryTranslation(categoryId, t.id, { title: t.title, slug: t.slug, introHtml: t.introHtml || undefined }).subscribe({
      next: () => (this.savingT = false),
      error: (e) => {
        this.err = e?.error?.message ?? 'Translation failed';
        this.savingT = false;
      },
    });
  }
}
