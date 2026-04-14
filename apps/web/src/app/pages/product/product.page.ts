import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import { PATHS, type Lang } from '../../core/store-paths';
import { mediaUrl } from '../../core/media-url';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';
import { environment } from '../../../environments/environment';

type Alternate = { locale: Lang; slug: string; canonicalPath?: string | null };
type ProductPayload = {
  title: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  usageNotes?: string;
  disclaimer?: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalPath?: string | null;
  product: {
    id: string;
    sku: string;
    price: string | number;
    stock: number;
    images: { media: { storedPath?: string | null; sourceUrl?: string | null } }[];
    relatedFrom: { toProduct: ProductCard }[];
  };
  alternates?: Alternate[];
};

type ProductCard = {
  id: string;
  price: string | number;
  translations: { title: string; slug: string; shortDescription?: string }[];
  images: { media: { storedPath?: string | null; sourceUrl?: string | null } }[];
};

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe],
  template: `
    <div *ngIf="data as d" class="dib-container py-12">
      <nav class="text-xs uppercase tracking-[0.25em] text-zinc-500">
        <a class="hover:text-gold-300" [routerLink]="['/', lang]">Home</a>
        <span class="mx-2">/</span>
        <a class="hover:text-gold-300" [routerLink]="['/', lang, paths.shop]">{{ ui.shop }}</a>
        <span class="mx-2">/</span>
        <span class="text-zinc-300">{{ d.title }}</span>
      </nav>

      <div class="mt-10 grid gap-10 lg:grid-cols-2">
        <div class="dib-card overflow-hidden">
          <div class="aspect-[4/5] bg-ink-850">
            <img *ngIf="heroImage(d)" class="h-full w-full object-cover" [src]="heroImage(d)!" [alt]="d.title" />
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-gold-400">Diblong</p>
          <h1 class="mt-3 font-display text-4xl text-zinc-50">{{ d.title }}</h1>
          <p class="mt-4 text-sm text-zinc-400">{{ d.shortDescription }}</p>
          <div class="mt-8 flex flex-wrap items-center gap-4">
            <div class="text-2xl text-gold-300">€ {{ d.product.price | number : '1.2-2' }}</div>
            <div class="text-xs text-zinc-500">SKU {{ d.product.sku }}</div>
          </div>
          <div class="mt-10 flex flex-col gap-3 sm:flex-row">
            <button type="button" class="dib-btn" (click)="addToCart()">{{ ui.add }}</button>
            <a class="dib-btn-ghost" [routerLink]="['/', lang, paths.shop]">{{ ui.back }}</a>
          </div>
          <div *ngIf="d.longDescription" class="prose prose-invert mt-10 max-w-none text-sm" [innerHTML]="d.longDescription"></div>
          <div *ngIf="d.usageNotes" class="mt-8 rounded-2xl border border-white/5 bg-ink-900/60 p-5 text-sm text-zinc-300">
            <div class="text-xs uppercase tracking-[0.25em] text-gold-400">{{ ui.usage }}</div>
            <div class="mt-2 whitespace-pre-line">{{ d.usageNotes }}</div>
          </div>
          <div *ngIf="d.disclaimer" class="mt-6 text-xs text-zinc-500">{{ d.disclaimer }}</div>
        </div>
      </div>

      <section *ngIf="d.product.relatedFrom?.length" class="mt-16">
        <h2 class="font-display text-2xl text-zinc-50">{{ ui.related }}</h2>
        <div class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <a
            *ngFor="let rel of d.product.relatedFrom"
            class="dib-card block overflow-hidden"
            [routerLink]="['/', lang, paths.product, rel.toProduct.translations[0]?.slug]"
          >
            <div class="aspect-[4/5] bg-ink-850">
              <img *ngIf="cardImg(rel.toProduct)" class="h-full w-full object-cover" [src]="cardImg(rel.toProduct)!" alt="" />
            </div>
            <div class="p-4">
              <div class="font-display text-lg text-zinc-100">{{ rel.toProduct.translations[0]?.title }}</div>
              <div class="mt-2 text-sm text-gold-300">€ {{ rel.toProduct.price | number : '1.2-2' }}</div>
            </div>
          </a>
        </div>
      </section>
    </div>
  `,
})
export class ProductPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  data?: ProductPayload;
  readonly ui = PRODUCT_UI[this.lang];

  constructor() {
    this.route.paramMap.subscribe((pm) => {
      const slug = pm.get('slug');
      if (!slug) return;
      this.api.product(this.lang, slug).subscribe((p) => {
        this.data = p as ProductPayload;
        const d = this.data;
        const og = d.ogImageUrl ?? this.heroImage(d);
        this.seo.setPage({
          title: d.metaTitle ?? `${d.title} | Diblong`,
          description: d.metaDescription ?? d.shortDescription,
          canonicalPath: d.canonicalPath ?? `/${this.lang}/${this.paths.product}/${d.slug}`,
          ogImage: og ?? undefined,
          hreflangs: (d.alternates ?? []).map((a) => ({
            lang: a.locale,
            path:
              a.canonicalPath ??
              `/${a.locale}/${PATHS[a.locale].product}/${a.slug}`,
          })),
        });
        const images = (d.product.images ?? [])
          .map((i) => mediaUrl(i.media.storedPath, i.media.sourceUrl))
          .filter(Boolean) as string[];
        this.seo.setJsonLd({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'Product',
              name: d.title,
              sku: d.product.sku,
              image: images,
              offers: {
                '@type': 'Offer',
                priceCurrency: 'EUR',
                price: String(d.product.price),
                availability:
                  d.product.stock > 0
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
              },
            },
            {
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: `${environment.siteUrl}/${this.lang}`,
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: this.ui.shop,
                  item: `${environment.siteUrl}/${this.lang}/${this.paths.shop}`,
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: d.title,
                  item: `${environment.siteUrl}/${this.lang}/${this.paths.product}/${d.slug}`,
                },
              ],
            },
          ],
        });
      });
    });
  }

  heroImage(d: ProductPayload) {
    const m = d.product.images?.[0]?.media;
    return d.ogImageUrl ?? mediaUrl(m?.storedPath, m?.sourceUrl);
  }

  cardImg(p: ProductCard) {
    const m = p.images?.[0]?.media;
    return mediaUrl(m?.storedPath, m?.sourceUrl);
  }

  addToCart() {
    const productId = this.data?.product.id;
    if (!productId) return;
    const raw = sessionStorage.getItem('dib_cart');
    const run = (cartId: string, guestToken: string) => {
      this.api.addCartItem(cartId, { productId, qty: 1, guestToken }).subscribe(() => {
        sessionStorage.setItem('dib_cart', JSON.stringify({ id: cartId, guestToken }));
        window.location.assign(`/${this.lang}/${this.paths.cart}`);
      });
    };
    if (raw) {
      const parsed = JSON.parse(raw) as { id: string; guestToken: string };
      run(parsed.id, parsed.guestToken);
      return;
    }
    this.api.createCart().subscribe((c) => run(c.id, c.guestToken));
  }
}

const PRODUCT_UI: Record<Lang, { shop: string; add: string; back: string; usage: string; related: string }> = {
  sl: { shop: 'Trgovina', add: 'Dodaj v košarico', back: 'Nazaj v trgovino', usage: 'Navodila', related: 'Povezani izdelki' },
  en: { shop: 'Shop', add: 'Add to cart', back: 'Back to shop', usage: 'Usage notes', related: 'Related products' },
  hr: { shop: 'Trgovina', add: 'Dodaj u košaricu', back: 'Natrag u trgovinu', usage: 'Upute', related: 'Povezani proizvodi' },
};
