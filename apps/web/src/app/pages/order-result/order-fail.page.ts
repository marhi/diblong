import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-order-fail-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dib-container py-16 text-center">
      <p class="text-xs uppercase tracking-[0.35em] text-red-300/80">{{ ui.kicker }}</p>
      <h1 class="mt-4 font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
      <p class="mx-auto mt-4 max-w-xl text-sm text-zinc-400">{{ ui.body }}</p>
      <a class="dib-btn mt-10 inline-block" [routerLink]="['/', lang, paths.checkout]">{{ ui.cta }}</a>
    </div>
  `,
})
export class OrderFailPageComponent {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  readonly ui = COPY[this.lang];

  constructor() {
    this.seo.setPage({
      title: this.ui.metaTitle,
      canonicalPath: `/${this.lang}/${this.paths.orderFail}`,
    });
  }
}

const COPY: Record<Lang, { kicker: string; title: string; body: string; cta: string; metaTitle: string }> = {
  sl: {
    kicker: 'Plačilo',
    title: 'Naročilo ni bilo zaključeno',
    body: 'Prišlo je do težave pri potrditvi. Poskusite znova ali kontaktirajte podporo.',
    cta: 'Nazaj na blagajno',
    metaTitle: 'Naročilo neuspešno | Diblong',
  },
  en: {
    kicker: 'Payment',
    title: 'Checkout could not be completed',
    body: 'Something went wrong while confirming your order. Please try again or contact support.',
    cta: 'Return to checkout',
    metaTitle: 'Order failed | Diblong',
  },
  hr: {
    kicker: 'Plaćanje',
    title: 'Narudžba nije završena',
    body: 'Došlo je do problema pri potvrdi. Pokušajte ponovno ili kontaktirajte podršku.',
    cta: 'Natrag na blagajnu',
    metaTitle: 'Narudžba neuspjela | Diblong',
  },
};
