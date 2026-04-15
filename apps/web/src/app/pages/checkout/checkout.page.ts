import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [FormsModule, NgIf, RouterLink],
  template: `
    <div class="dib-container max-w-xl py-12">
      <h1 class="font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
      <p class="mt-4 text-sm text-zinc-400">{{ ui.body }}</p>

      <form *ngIf="cartReady" class="mt-8 space-y-4" (ngSubmit)="submit()">
        <label class="block text-sm text-zinc-300">
          {{ ui.email }}
          <input class="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2" name="email" [(ngModel)]="email" required type="email" />
        </label>
        <label class="block text-sm text-zinc-300">
          {{ ui.line1 }}
          <input class="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2" [(ngModel)]="line1" name="line1" required />
        </label>
        <label class="block text-sm text-zinc-300">
          {{ ui.city }}
          <input class="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2" [(ngModel)]="city" name="city" required />
        </label>
        <label class="block text-sm text-zinc-300">
          {{ ui.postal }}
          <input class="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2" [(ngModel)]="postal" name="postal" required />
        </label>
        <label class="block text-sm text-zinc-300">
          {{ ui.country }}
          <input class="mt-2 w-full rounded-xl border border-white/10 bg-ink-900 px-3 py-2" [(ngModel)]="country" name="country" required />
        </label>
        <button class="dib-btn w-full" type="submit">{{ ui.pay }}</button>
        <p *ngIf="error" class="text-sm text-red-300">{{ error }}</p>
      </form>

      <p *ngIf="!cartReady" class="mt-8 text-sm text-zinc-400">{{ ui.noCart }}</p>
      <a class="dib-btn-ghost mt-6 inline-block" [routerLink]="['/', lang, paths.cart]">{{ ui.back }}</a>
    </div>
  `,
})
export class CheckoutPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  readonly ui = CHECKOUT_UI[this.lang];

  cartId = '';
  guestToken = '';
  cartReady = false;
  email = '';
  line1 = '';
  city = '';
  postal = '';
  country = 'SI';
  error = '';

  constructor() {
    this.seo.setPage({ title: this.ui.metaTitle, canonicalPath: `/${this.lang}/${this.paths.checkout}` });
    const raw = sessionStorage.getItem('dib_cart');
    if (!raw) return;
    const parsed = JSON.parse(raw) as { id: string; guestToken: string };
    this.cartId = parsed.id;
    this.guestToken = parsed.guestToken;
    this.cartReady = true;
  }

  submit() {
    this.error = '';
    this.api
      .checkout({
        cartId: this.cartId,
        guestToken: this.guestToken,
        guestEmail: this.email,
        locale: this.lang,
        shippingAddress: {
          line1: this.line1,
          city: this.city,
          postalCode: this.postal,
          countryCode: this.country,
        },
      })
      .subscribe({
        next: () => {
          sessionStorage.removeItem('dib_cart');
          this.router.navigate([this.lang, this.paths.orderSuccess]);
        },
        error: (e) => {
          this.error = e?.error?.message ?? this.ui.failed;
        },
      });
  }
}

const CHECKOUT_UI: Record<
  Lang,
  {
    title: string;
    body: string;
    email: string;
    line1: string;
    city: string;
    postal: string;
    country: string;
    pay: string;
    noCart: string;
    back: string;
    failed: string;
    metaTitle: string;
  }
> = {
  sl: {
    title: 'Blagajna',
    body: 'Vnesite kontakt in naslov dostave. Plačilo poteka prek priključnega ponudnika (demo).',
    email: 'E-pošta',
    line1: 'Naslov',
    city: 'Mesto',
    postal: 'Pošta',
    country: 'Država (koda)',
    pay: 'Potrdi naročilo',
    noCart: 'Ni aktivne košarice.',
    back: 'Nazaj v košarico',
    failed: 'Naročilo ni uspelo.',
    metaTitle: 'Blagajna | Digo',
  },
  en: {
    title: 'Checkout',
    body: 'Enter contact and shipping details. Payment runs through a pluggable provider (demo).',
    email: 'Email',
    line1: 'Address line',
    city: 'City',
    postal: 'Postal code',
    country: 'Country code',
    pay: 'Place order',
    noCart: 'No active cart.',
    back: 'Back to cart',
    failed: 'Checkout failed.',
    metaTitle: 'Checkout | Digo',
  },
  hr: {
    title: 'Blagajna',
    body: 'Unesite kontakt i adresu dostave. Plaćanje ide preko priključnog pružatelja (demo).',
    email: 'E-pošta',
    line1: 'Adresa',
    city: 'Grad',
    postal: 'Pošta',
    country: 'Država (kod)',
    pay: 'Potvrdi narudžbu',
    noCart: 'Nema aktivne košarice.',
    back: 'Natrag u košaricu',
    failed: 'Narudžba nije uspjela.',
    metaTitle: 'Blagajna | Digo',
  },
};
