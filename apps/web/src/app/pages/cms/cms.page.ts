import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { readLang } from '../../core/route-helpers';
import type { Lang } from '../../core/store-paths';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';

@Component({
  selector: 'app-cms-page',
  standalone: true,
  imports: [NgIf],
  template: `
    <div *ngIf="page as p" class="dib-container py-12 max-w-3xl">
      <h1 class="font-display text-4xl text-zinc-50">{{ p.title }}</h1>
      <div *ngIf="p.bodyHtml" class="prose prose-invert mt-8 text-sm leading-relaxed" [innerHTML]="p.bodyHtml"></div>
    </div>
  `,
})
export class CmsPageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  page?: {
    title: string;
    bodyHtml?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    canonicalPath?: string | null;
    slug: string;
  };

  constructor() {
    const slug = this.route.snapshot.data['cmsSlug'] as string | undefined;
    if (!slug) return;
    this.api.page(this.lang, slug).subscribe((raw) => {
      const p = raw as CmsPageComponent['page'];
      this.page = p;
      if (!p) return;
      this.seo.setPage({
        title: p.metaTitle ?? `${p.title} | Digo`,
        description: p.metaDescription ?? undefined,
        canonicalPath: p.canonicalPath ?? `/${this.lang}/${p.slug}`,
      });
    });
  }
}
