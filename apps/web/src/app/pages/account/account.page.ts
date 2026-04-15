import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { SeoService } from '../../services/seo.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [],
  template: `
    <div class="dib-container max-w-2xl py-12">
      <h1 class="font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
      <p class="mt-4 text-sm text-zinc-400">{{ ui.body }}</p>
      <div class="mt-8 dib-card p-6 text-sm text-zinc-300">
        <p>{{ ui.tokenHint }}</p>
        <a class="dib-btn mt-4 inline-block" [href]="environment.apiDocsUrl">{{ ui.swagger }}</a>
      </div>
    </div>
  `,
})
export class AccountPageComponent {
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  readonly ui = ACCOUNT_UI[this.lang];
  readonly environment = environment;

  constructor() {
    this.seo.setPage({ title: this.ui.metaTitle, canonicalPath: `/${this.lang}/${this.paths.account}` });
  }
}

const ACCOUNT_UI: Record<Lang, { title: string; body: string; tokenHint: string; swagger: string; metaTitle: string }> = {
  sl: {
    title: 'Moj račun',
    body: 'Zgodovina naročil in naslovi bodo povezani z JWT avtentikacijo v naslednji iteraciji.',
    tokenHint: 'Za administratorske tokove uporabite API dokumentacijo in vlogo ADMIN.',
    swagger: 'Odpri Swagger',
    metaTitle: 'Račun | Digo',
  },
  en: {
    title: 'My account',
    body: 'Order history and addresses will be wired to JWT auth in the next iteration.',
    tokenHint: 'For admin flows use the API docs with the ADMIN role.',
    swagger: 'Open Swagger',
    metaTitle: 'Account | Digo',
  },
  hr: {
    title: 'Moj račun',
    body: 'Povijest narudžbi i adrese bit će povezane s JWT autentikacijom u sljedećoj iteraciji.',
    tokenHint: 'Za adminske tokove koristite API dokumentaciju s ulogom ADMIN.',
    swagger: 'Otvori Swagger',
    metaTitle: 'Račun | Digo',
  },
};
