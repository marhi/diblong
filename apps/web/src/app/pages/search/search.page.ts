import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-search-page',
  standalone: true,
  imports: [FormsModule, RouterLink, NgFor, NgIf],
  template: `
    <div class="dib-container py-12">
      <h1 class="font-display text-4xl text-zinc-50">{{ ui.title }}</h1>
      <form class="mt-6 flex gap-2" (ngSubmit)="run()">
        <input
          class="w-full rounded-full border border-white/10 bg-ink-900 px-4 py-2 text-sm"
          [(ngModel)]="q"
          name="q"
          [placeholder]="ui.placeholder"
        />
        <button class="dib-btn" type="submit">{{ ui.search }}</button>
      </form>

      <div *ngIf="suggestions.length" class="mt-4 rounded-2xl border border-white/5 bg-ink-900/60 p-3 text-sm">
        <button
          *ngFor="let s of suggestions"
          type="button"
          class="block w-full rounded-lg px-3 py-2 text-left hover:bg-white/5"
          (click)="pick(s.slug)"
        >
          {{ s.title }}
        </button>
      </div>

      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <a
          *ngFor="let p of results"
          class="dib-card block p-4"
          [routerLink]="['/', lang, paths.product, p.translations[0]?.slug]"
        >
          <div class="font-display text-lg text-zinc-100">{{ p.translations[0]?.title }}</div>
          <p class="mt-2 line-clamp-2 text-sm text-zinc-400">{{ p.translations[0]?.shortDescription }}</p>
        </a>
      </div>
    </div>
  `,
})
export class SearchPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  q = '';
  suggestions: { title: string; slug: string }[] = [];
  results: { translations: { title: string; slug: string; shortDescription?: string }[] }[] = [];
  readonly ui = SEARCH_UI[this.lang];

  constructor() {
    this.seo.setPage({ title: this.ui.metaTitle, canonicalPath: `/${this.lang}/${this.paths.search}` });
    this.route.queryParamMap.subscribe((pm) => {
      this.q = pm.get('q') ?? '';
      if (this.q.length >= 2) {
        this.api.suggest(this.lang, this.q).subscribe((s) => (this.suggestions = (s as any) ?? []));
        this.api.products(this.lang, { q: this.q, take: 24 }).subscribe((res) => {
          this.results = ((res as { items?: unknown[] }).items ?? []) as SearchPageComponent['results'];
        });
      } else {
        this.suggestions = [];
        this.results = [];
      }
    });
  }

  run() {
    this.router.navigate(['/', this.lang, this.paths.search], { queryParams: { q: this.q } });
  }

  pick(slug: string) {
    this.router.navigate(['/', this.lang, this.paths.product, slug]);
  }
}

const SEARCH_UI: Record<Lang, { title: string; placeholder: string; search: string; metaTitle: string }> = {
  sl: {
    title: 'Iskanje',
    placeholder: 'Začnite tipkati…',
    search: 'Išči',
    metaTitle: 'Iskanje | Digo',
  },
  en: {
    title: 'Search',
    placeholder: 'Start typing…',
    search: 'Search',
    metaTitle: 'Search | Digo',
  },
  hr: {
    title: 'Pretraga',
    placeholder: 'Počnite tipkati…',
    search: 'Traži',
    metaTitle: 'Pretraga | Digo',
  },
};
