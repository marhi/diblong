import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AdminApiService } from '../admin-api.service';

type T = {
  locale: string;
  headline: string;
  subline?: string | null;
  ctaLabel?: string | null;
  ctaPath?: string | null;
};
type Banner = {
  id: string;
  sortOrder: number;
  isActive: boolean;
  linkUrl?: string | null;
  imageMediaId?: string | null;
  translations: T[];
  image?: { storedPath: string } | null;
};

@Component({
  selector: 'app-admin-promo',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Promo banners</h1>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngFor="let b of banners" class="mt-8 dib-card space-y-4 p-6">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div class="font-mono text-xs text-zinc-500">{{ b.id }}</div>
            <div *ngIf="b.image" class="mt-2">
              <img class="h-24 rounded-lg border border-white/10 object-cover" [src]="origin + b.image.storedPath" alt="" />
            </div>
          </div>
          <button type="button" class="dib-btn !py-1.5 !px-4 text-xs" [disabled]="savingId === b.id" (click)="save(b)">
            {{ savingId === b.id ? 'Saving…' : 'Save banner' }}
          </button>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label class="text-sm text-zinc-300">
            Sort
            <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" type="number" [(ngModel)]="b.sortOrder" [name]="'so'+b.id" />
          </label>
          <label class="flex items-end gap-2 pb-2 text-sm text-zinc-300">
            <input type="checkbox" [(ngModel)]="b.isActive" [name]="'ac'+b.id" /> Active
          </label>
          <label class="text-sm text-zinc-300 sm:col-span-2">
            Link URL
            <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-sm" [(ngModel)]="b.linkUrl" [name]="'lk'+b.id" />
          </label>
          <label class="text-sm text-zinc-300 sm:col-span-2">
            Image media ID
            <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 font-mono text-xs" [(ngModel)]="b.imageMediaId" [name]="'im'+b.id" />
          </label>
        </div>
        <div *ngFor="let t of b.translations" class="rounded-lg border border-white/5 p-4">
          <div class="text-xs uppercase tracking-widest text-zinc-500">{{ t.locale }}</div>
          <label class="mt-2 block text-sm text-zinc-300">
            Headline
            <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" [(ngModel)]="t.headline" [name]="'h'+t.locale+b.id" />
          </label>
          <label class="mt-2 block text-sm text-zinc-300">
            Subline
            <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" [(ngModel)]="t.subline" [name]="'s'+t.locale+b.id" />
          </label>
          <div class="mt-2 grid gap-2 sm:grid-cols-2">
            <label class="text-sm text-zinc-300">
              CTA label
              <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" [(ngModel)]="t.ctaLabel" [name]="'ct'+t.locale+b.id" />
            </label>
            <label class="text-sm text-zinc-300">
              CTA path
              <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" [(ngModel)]="t.ctaPath" [name]="'cp'+t.locale+b.id" />
            </label>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminPromoPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly origin = environment.apiOrigin;
  banners: Banner[] = [];
  err = '';
  savingId: string | null = null;

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.promoBanners().subscribe({
      next: (list) => (this.banners = list as Banner[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load banners'),
    });
  }

  save(b: Banner) {
    this.savingId = b.id;
    this.err = '';
    const translations = b.translations.map((t) => ({
      locale: t.locale,
      headline: t.headline,
      subline: t.subline ?? undefined,
      ctaLabel: t.ctaLabel ?? undefined,
      ctaPath: t.ctaPath ?? undefined,
    }));
    const imageMediaId = (b.imageMediaId ?? '').trim() || null;
    this.api
      .patchPromoBanner(b.id, {
        sortOrder: b.sortOrder,
        isActive: b.isActive,
        linkUrl: b.linkUrl ?? undefined,
        imageMediaId,
        translations,
      })
      .subscribe({
        next: (raw) => {
          const updated = raw as Banner;
          const ix = this.banners.findIndex((x) => x.id === b.id);
          if (ix >= 0) this.banners[ix] = updated;
          this.savingId = null;
        },
        error: (e) => {
          this.err = e?.error?.message ?? 'Save failed';
          this.savingId = null;
        },
      });
  }
}
