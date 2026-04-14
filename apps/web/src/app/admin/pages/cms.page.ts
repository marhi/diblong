import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';

type PageTrans = {
  id: string;
  locale: string;
  title: string;
  slug: string;
  bodyHtml?: string | null;
};
type CmsPage = { id: string; key: string; translations: PageTrans[] };

@Component({
  selector: 'app-admin-cms',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">CMS pages</h1>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngFor="let p of pages" class="mt-8 dib-card p-6">
        <h2 class="font-display text-xl text-gold-200/90">{{ p.key }}</h2>
        <div
          *ngFor="let t of p.translations; let i = index"
          class="mt-6 border-t border-white/5 pt-6"
          [class.mt-4]="i === 0"
          [class.border-t-0]="i === 0"
          [class.pt-0]="i === 0"
        >
          <div class="text-xs uppercase tracking-widest text-zinc-500">{{ t.locale }}</div>
          <label class="mt-2 block text-sm text-zinc-300">
            Title
            <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" [(ngModel)]="t.title" [name]="'title'+t.id" />
          </label>
          <label class="mt-3 block text-sm text-zinc-300">
            Slug
            <input class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2" [(ngModel)]="t.slug" [name]="'slug'+t.id" />
          </label>
          <label class="mt-3 block text-sm text-zinc-300">
            Body HTML
            <textarea class="mt-1 min-h-[200px] w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs" [(ngModel)]="t.bodyHtml" [name]="'body'+t.id"></textarea>
          </label>
          <button type="button" class="mt-3 dib-btn !py-1.5 !px-4 text-xs" (click)="save(t)">Save translation</button>
        </div>
      </div>
    </div>
  `,
})
export class AdminCmsPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  pages: CmsPage[] = [];
  err = '';

  ngOnInit() {
    this.api.cmsPages().subscribe({
      next: (list) => (this.pages = list as CmsPage[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load pages'),
    });
  }

  save(t: PageTrans) {
    this.api
      .patchPageTranslation(t.id, {
        title: t.title,
        slug: t.slug,
        bodyHtml: t.bodyHtml ?? undefined,
      })
      .subscribe({ error: (e) => (this.err = e?.error?.message ?? 'Save failed') });
  }
}
