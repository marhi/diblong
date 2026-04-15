import { NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { mediaUrl } from '../../core/media-url';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

type CategoryPayload = {
  title: string;
  introHtml?: string | null;
  faqJson?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  canonicalPath?: string | null;
  category: {
    products: {
      id: string;
      price: string | number;
      translations: { title: string; slug: string; shortDescription?: string }[];
      images: { media: { storedPath?: string | null; sourceUrl?: string | null } }[];
    }[];
  };
};

@Component({
  selector: 'app-category-page',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf],
  template: `
    <div *ngIf="data as c" class="dib-container py-12">
      <h1 class="font-display text-4xl text-zinc-50">{{ c.title }}</h1>
      <div *ngIf="c.introHtml" class="prose prose-invert mt-6 max-w-3xl text-sm" [innerHTML]="c.introHtml"></div>

      <div class="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <a
          *ngFor="let p of c.category.products"
          class="dib-card block overflow-hidden"
          [routerLink]="['/', lang, paths.product, p.translations[0]?.slug]"
        >
          <div class="aspect-[4/5] bg-ink-850">
            <img *ngIf="img(p)" class="h-full w-full object-cover" [src]="img(p)!" alt="" />
          </div>
          <div class="p-4">
            <div class="font-display text-lg text-zinc-100">{{ p.translations[0]?.title }}</div>
            <p class="mt-2 line-clamp-2 text-sm text-zinc-400">{{ p.translations[0]?.shortDescription }}</p>
          </div>
        </a>
      </div>

      <section *ngIf="faq.length" class="mt-16 max-w-3xl">
        <h2 class="font-display text-2xl text-zinc-50">FAQ</h2>
        <div class="mt-6 space-y-4">
          <details *ngFor="let f of faq" class="dib-card p-4">
            <summary class="cursor-pointer text-sm text-zinc-200">{{ f.q }}</summary>
            <p class="mt-3 text-sm text-zinc-400">{{ f.a }}</p>
          </details>
        </div>
      </section>
    </div>
  `,
})
export class CategoryPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  data?: CategoryPayload;
  faq: { q: string; a: string }[] = [];

  constructor() {
    this.route.paramMap.subscribe((pm) => {
      const slug = pm.get('slug');
      if (!slug) return;
      this.api.category(this.lang, slug).subscribe((raw) => {
        const c = raw as CategoryPayload;
        this.data = c;
        this.seo.setPage({
          title: c.metaTitle ?? `${c.title} | Digo`,
          description: c.metaDescription ?? undefined,
          canonicalPath: c.canonicalPath ?? `/${this.lang}/${this.paths.category}/${slug}`,
        });
        try {
          const parsed = JSON.parse(c.faqJson ?? '[]') as {
            q: Record<string, string>;
            a: Record<string, string>;
          }[];
          this.faq = parsed.map((x) => ({
            q: x.q[this.lang] ?? x.q['sl'],
            a: x.a[this.lang] ?? x.a['sl'],
          }));
        } catch {
          this.faq = [];
        }
      });
    });
  }

  img(p: CategoryPayload['category']['products'][number]) {
    const m = p.images?.[0]?.media;
    return mediaUrl(m?.storedPath, m?.sourceUrl);
  }
}
