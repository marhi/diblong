import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

type Trans = {
  id: string;
  locale: string;
  title: string;
  slug: string;
  shortDescription?: string | null;
  longDescription?: string | null;
};

type Product = {
  id: string;
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestseller: boolean;
  popularity: number;
  categoryId?: string | null;
  translations: Trans[];
  category?: { id: string; translations?: { title: string; locale: string }[] } | null;
};

type CategoryOpt = { id: string; translations: { title: string; locale: string }[] };

@Component({
  selector: 'app-admin-product-edit',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, FormsModule, RouterLink],
  template: `
    <ng-container *ngIf="product">
      <a class="text-sm text-zinc-500 hover:text-gold-300" routerLink="/admin/products">← Products</a>
      <h1 class="mt-4 font-display text-3xl text-gold-200">{{ product.sku }}</h1>
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="dib-card space-y-4 p-6">
          <h2 class="font-display text-lg text-zinc-200">Core</h2>
          <label class="block text-sm text-zinc-300">
            Price (EUR)
            <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" type="number" step="0.01" [(ngModel)]="core.price" name="price" />
          </label>
          <label class="block text-sm text-zinc-300">
            Compare-at (optional)
            <input
              class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2"
              type="number"
              step="0.01"
              [(ngModel)]="core.compareAtPrice"
              name="cap"
            />
          </label>
          <label class="block text-sm text-zinc-300">
            Stock
            <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" type="number" [(ngModel)]="core.stock" name="stock" />
          </label>
          <label class="block text-sm text-zinc-300">
            Popularity
            <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" type="number" [(ngModel)]="core.popularity" name="pop" />
          </label>
          <label class="block text-sm text-zinc-300">
            Category
            <select class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" [(ngModel)]="core.categoryId" name="cat">
              <option [ngValue]="''">— none —</option>
              <option *ngFor="let c of categories" [ngValue]="c.id">{{ categoryLabel(c) }}</option>
            </select>
          </label>
          <div class="flex flex-wrap gap-4 text-sm text-zinc-300">
            <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="core.isActive" name="a" /> Active</label>
            <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="core.isFeatured" name="f" /> Featured</label>
            <label class="flex items-center gap-2"><input type="checkbox" [(ngModel)]="core.isBestseller" name="b" /> Bestseller</label>
          </div>
          <button type="button" class="dib-btn text-sm" [disabled]="saving" (click)="saveCore()">{{ saving ? 'Saving…' : 'Save core' }}</button>
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
              Short description
              <textarea class="mt-1 min-h-[72px] w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm" [(ngModel)]="activeTrans.shortDescription" name="sd"></textarea>
            </label>
            <label class="block text-sm text-zinc-300">
              Long description
              <textarea class="mt-1 min-h-[140px] w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm" [(ngModel)]="activeTrans.longDescription" name="ld"></textarea>
            </label>
            <button type="button" class="dib-btn text-sm" [disabled]="savingT" (click)="saveTrans(product!.id, activeTrans)">
              {{ savingT ? 'Saving…' : 'Save translation' }}
            </button>
          </ng-container>
        </div>
      </div>
      <p *ngIf="msg" class="mt-4 text-sm text-emerald-300">{{ msg }}</p>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
    </ng-container>
  `,
})
export class AdminProductEditPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  product: Product | null = null;
  categories: CategoryOpt[] = [];
  locales = ['sl', 'en', 'hr'] as const;
  activeLocale: string = 'sl';
  activeTrans: Trans | null = null;
  core = {
    price: 0,
    compareAtPrice: null as number | null,
    stock: 0,
    popularity: 0,
    isActive: true,
    isFeatured: false,
    isBestseller: false,
    categoryId: '' as string,
  };
  err = '';
  msg = '';
  saving = false;
  savingT = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.api.categories().subscribe({
      next: (c) => (this.categories = c as CategoryOpt[]),
      error: () => {},
    });
    this.api.product(id).subscribe({
      next: (raw) => this.applyProduct(raw as Product),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load product'),
    });
  }

  categoryLabel(c: CategoryOpt) {
    return c.translations.find((x) => x.locale === 'en')?.title ?? c.translations[0]?.title ?? c.id.slice(0, 6);
  }

  applyProduct(p: Product) {
    this.product = p;
    this.core = {
      price: Number(p.price),
      compareAtPrice: p.compareAtPrice != null ? Number(p.compareAtPrice) : null,
      stock: p.stock,
      popularity: p.popularity,
      isActive: p.isActive,
      isFeatured: p.isFeatured,
      isBestseller: p.isBestseller,
      categoryId: p.categoryId ?? '',
    };
    this.pickLocale(this.activeLocale);
  }

  pickLocale(loc: string) {
    this.activeLocale = loc;
    const t = this.product?.translations.find((x) => x.locale === loc);
    this.activeTrans = t
      ? { ...t, shortDescription: t.shortDescription ?? '', longDescription: t.longDescription ?? '' }
      : null;
  }

  saveCore() {
    if (!this.product) return;
    this.saving = true;
    this.err = '';
    this.msg = '';
    const body: Record<string, unknown> = {
      price: this.core.price,
      compareAtPrice: this.core.compareAtPrice,
      stock: this.core.stock,
      popularity: this.core.popularity,
      isActive: this.core.isActive,
      isFeatured: this.core.isFeatured,
      isBestseller: this.core.isBestseller,
      categoryId: this.core.categoryId || null,
    };
    this.api.patchProduct(this.product.id, body).subscribe({
      next: (raw) => {
        this.applyProduct(raw as Product);
        this.saving = false;
        this.msg = 'Core saved.';
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Save failed';
        this.saving = false;
      },
    });
  }

  saveTrans(productId: string, t: Trans) {
    this.savingT = true;
    this.err = '';
    this.msg = '';
    this.api
      .patchProductTranslation(productId, t.id, {
        title: t.title,
        slug: t.slug,
        shortDescription: t.shortDescription || undefined,
        longDescription: t.longDescription || undefined,
      })
      .subscribe({
        next: () => {
          this.savingT = false;
          this.msg = 'Translation saved.';
        },
        error: (e) => {
          this.err = e?.error?.message ?? 'Translation save failed';
          this.savingT = false;
        },
      });
  }
}
