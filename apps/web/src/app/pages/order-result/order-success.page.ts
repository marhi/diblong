import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-order-success-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="dib-container py-16 text-center">
      <p class="text-xs uppercase tracking-[0.35em] text-gold-400">{{ ui.kicker }}</p>
      <h1 class="mt-4 font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
      <p class="mx-auto mt-4 max-w-xl text-sm text-zinc-400">{{ ui.body }}</p>
      <a class="dib-btn mt-10 inline-block" [routerLink]="['/', lang, paths.shop]">{{ ui.cta }}</a>
    </div>
  `,
})
export class OrderSuccessPageComponent {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  readonly ui = COPY[this.lang];

  constructor() {
    this.seo.setPage({
      title: this.ui.metaTitle,
      canonicalPath: `/${this.lang}/${this.paths.orderSuccess}`,
    });
  }
}

const COPY: Record<Lang, { kicker: string; title: string; body: string; cta: string; metaTitle: string }> = {
  sl: {
    kicker: 'Naročilo',
    title: 'Hvala — naročilo je sprejeto',
    body: 'Potrditev je bila poslana na vaš e-naslov. O statusu vas obvestimo diskretno in zanesljivo.',
    cta: 'Nadaljuj z nakupovanjem',
    metaTitle: 'Naročilo uspešno | Diblong',
  },
  en: {
    kicker: 'Order',
    title: 'Thank you — order received',
    body: 'A confirmation has been sent to your email. We will update you discreetly as your order progresses.',
    cta: 'Continue shopping',
    metaTitle: 'Order success | Diblong',
  },
  hr: {
    kicker: 'Narudžba',
    title: 'Hvala — narudžba je zaprimljena',
    body: 'Potvrda je poslana na vašu e-poštu. O statusu ćemo vas obavijestiti diskretno i pouzdano.',
    cta: 'Nastavite kupovati',
    metaTitle: 'Narudžba uspjela | Diblong',
  },
};
