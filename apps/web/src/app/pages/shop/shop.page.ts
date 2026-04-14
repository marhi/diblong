import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { mediaUrl } from '../../core/media-url';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

type ProductCard = {
  id: string;
  price: string | number;
  translations: { title: string; slug: string; shortDescription?: string }[];
  images: { media: { storedPath?: string | null; sourceUrl?: string | null } }[];
};

@Component({
  selector: 'app-shop-page',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, FormsModule, DecimalPipe],
  template: `
    <div class="dib-container py-12">
      <div class="max-w-2xl">
        <p class="text-xs uppercase tracking-[0.35em] text-gold-400">{{ ui.kicker }}</p>
        <h1 class="mt-3 font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
        <p class="mt-4 text-sm text-zinc-400">{{ ui.body }}</p>
      </div>

      <div class="mt-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="flex flex-wrap gap-2">
          <button class="dib-btn-ghost" type="button" (click)="setSort('popularity')">{{ ui.sortPop }}</button>
          <button class="dib-btn-ghost" type="button" (click)="setSort('newest')">{{ ui.sortNew }}</button>
          <button class="dib-btn-ghost" type="button" (click)="setSort('price_asc')">{{ ui.sortPriceAsc }}</button>
          <button class="dib-btn-ghost" type="button" (click)="setSort('price_desc')">{{ ui.sortPriceDesc }}</button>
        </div>
        <label class="flex items-center gap-2 text-sm text-zinc-400">
          <input type="checkbox" [(ngModel)]="onlyBestsellers" (change)="reload()" />
          {{ ui.onlyBest }}
        </label>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <a
          *ngFor="let p of items"
          class="dib-card group block overflow-hidden transition duration-300 ease-lux hover:-translate-y-1 hover:shadow-glow"
          [routerLink]="['/', lang, paths.product, p.translations[0]?.slug]"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-ink-850">
            <img
              *ngIf="img(p)"
              class="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              [src]="img(p)!"
              [alt]="p.translations[0]?.title"
            />
          </div>
          <div class="p-5">
            <div class="font-display text-xl text-zinc-100">{{ p.translations[0]?.title }}</div>
            <p class="mt-2 line-clamp-2 text-sm text-zinc-400">{{ p.translations[0]?.shortDescription }}</p>
            <div class="mt-4 text-sm text-gold-300">€ {{ p.price | number : '1.2-2' }}</div>
          </div>
        </a>
      </div>
    </div>
  `,
})
export class ShopPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  items: ProductCard[] = [];
  sort: 'popularity' | 'newest' | 'price_asc' | 'price_desc' = 'popularity';
  onlyBestsellers = false;
  readonly ui = SHOP_UI[this.lang];

  constructor() {
    this.seo.setPage({
      title: this.ui.metaTitle,
      description: this.ui.metaDescription,
      canonicalPath: `/${this.lang}/${this.paths.shop}`,
    });
    this.reload();
  }

  setSort(s: typeof this.sort) {
    this.sort = s;
    this.reload();
  }

  reload() {
    this.api
      .products(this.lang, {
        sort: this.sort,
        bestseller: this.onlyBestsellers ? true : undefined,
        take: 48,
      })
      .subscribe((res) => {
        const r = res as { items?: ProductCard[] };
        this.items = r.items ?? [];
      });
  }

  img(p: ProductCard) {
    const m = p.images?.[0]?.media;
    return mediaUrl(m?.storedPath, m?.sourceUrl);
  }
}

const SHOP_UI: Record<
  Lang,
  {
    kicker: string;
    title: string;
    body: string;
    sortPop: string;
    sortNew: string;
    sortPriceAsc: string;
    sortPriceDesc: string;
    onlyBest: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  sl: {
    kicker: 'Trgovina',
    title: 'Izbrana linija Diblong',
    body: 'Filtrirajte po priljubljenosti, ceni ali novostih. Vse vsebine so urejene v CMS in optimizirane za SEO.',
    sortPop: 'Priljubljenost',
    sortNew: 'Najnovejše',
    sortPriceAsc: 'Cena ↑',
    sortPriceDesc: 'Cena ↓',
    onlyBest: 'Samo bestsellerji',
    metaTitle: 'Trgovina | Diblong',
    metaDescription: 'Brskajte po premium izdelkih Diblong z večjezičnimi SEO povezavami.',
  },
  en: {
    kicker: 'Shop',
    title: 'The Diblong line',
    body: 'Filter by popularity, price, or freshness. Catalog content is CMS-driven and SEO-structured.',
    sortPop: 'Popularity',
    sortNew: 'Newest',
    sortPriceAsc: 'Price ↑',
    sortPriceDesc: 'Price ↓',
    onlyBest: 'Bestsellers only',
    metaTitle: 'Shop | Diblong',
    metaDescription: 'Browse premium Diblong products with multilingual SEO.',
  },
  hr: {
    kicker: 'Trgovina',
    title: 'Diblong linija',
    body: 'Filtrirajte po popularnosti, cijeni ili novosti. Sadržaj je CMS i SEO optimiziran.',
    sortPop: 'Popularnost',
    sortNew: 'Najnovije',
    sortPriceAsc: 'Cijena ↑',
    sortPriceDesc: 'Cijena ↓',
    onlyBest: 'Samo bestselleri',
    metaTitle: 'Trgovina | Diblong',
    metaDescription: 'Pregledajte premium Diblong proizvode s višejezičnim SEO-om.',
  },
};
