import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { mediaUrl } from '../../core/media-url';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe],
  template: `
    <div class="dib-container py-12">
      <h1 class="font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
      <p *ngIf="!cart" class="mt-6 text-sm text-zinc-400">{{ ui.empty }}</p>
      <div *ngIf="cart as c" class="mt-8 space-y-4">
        <div *ngFor="let it of c.items" class="dib-card flex items-center justify-between gap-4 p-4">
          <div class="flex items-center gap-4">
            <img *ngIf="lineImg(it)" class="h-16 w-16 rounded-lg object-cover" [src]="lineImg(it)!" alt="" />
            <div>
              <div class="text-sm text-zinc-100">{{ tr(it.product).title }}</div>
              <div class="text-xs text-zinc-500">x{{ it.qty }}</div>
            </div>
          </div>
          <div class="text-sm text-gold-300">€ {{ lineTotal(it) | number : '1.2-2' }}</div>
        </div>
        <div class="flex justify-end">
          <a class="dib-btn" [routerLink]="['/', lang, paths.checkout]">{{ ui.checkout }}</a>
        </div>
      </div>
    </div>
  `,
})
export class CartPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  cart?: {
    items: {
      qty: number;
      product: {
        price: string | number;
        translations: { title: string; locale?: string }[];
        images: { media: { storedPath?: string | null; sourceUrl?: string | null } }[];
      };
    }[];
  };
  readonly ui = CART_UI[this.lang];

  constructor() {
    this.seo.setPage({ title: this.ui.metaTitle, canonicalPath: `/${this.lang}/${this.paths.cart}` });
    const raw = sessionStorage.getItem('dib_cart');
    if (!raw) return;
    const { id, guestToken } = JSON.parse(raw) as { id: string; guestToken: string };
    this.api.getCart(id, guestToken).subscribe((c) => (this.cart = c as CartPageComponent['cart']));
  }

  lineImg(it: NonNullable<CartPageComponent['cart']>['items'][number]) {
    const m = it.product.images?.[0]?.media;
    return mediaUrl(m?.storedPath, m?.sourceUrl);
  }

  lineTotal(it: NonNullable<CartPageComponent['cart']>['items'][number]) {
    return Number(it.product.price) * it.qty;
  }

  tr(product: NonNullable<CartPageComponent['cart']>['items'][number]['product']) {
    return (
      product.translations.find((t) => t.locale === this.lang) ?? product.translations[0]
    );
  }
}

const CART_UI: Record<Lang, { title: string; empty: string; checkout: string; metaTitle: string }> = {
  sl: {
    title: 'Košarica',
    empty: 'Košarica je prazna.',
    checkout: 'Na blagajno',
    metaTitle: 'Košarica | Digo',
  },
  en: {
    title: 'Cart',
    empty: 'Your cart is empty.',
    checkout: 'Checkout',
    metaTitle: 'Cart | Digo',
  },
  hr: {
    title: 'Košarica',
    empty: 'Košarica je prazna.',
    checkout: 'Na blagajnu',
    metaTitle: 'Košarica | Digo',
  },
};
