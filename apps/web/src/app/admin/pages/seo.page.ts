import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';

type SeoDraft = {
  routeKey: string;
  locale: string;
  metaTitle: string;
  metaDescription: string;
  noindex: boolean;
};

type SeoRow = {
  id: string;
  routeKey: string;
  locale: string;
  metaTitle?: string | null;
  metaDescription?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImageUrl?: string | null;
  canonicalPath?: string | null;
  noindex?: boolean;
};

@Component({
  selector: 'app-admin-seo',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">SEO entries</h1>
      <div class="mt-8 dib-card space-y-4 p-6">
        <h2 class="font-display text-lg text-zinc-200">Create or replace</h2>
        <p class="text-xs text-zinc-500">Upserts by route key + locale.</p>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm text-zinc-300">
            Route key
            <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 font-mono text-xs" [(ngModel)]="draft.routeKey" name="rk" />
          </label>
          <label class="text-sm text-zinc-300">
            Locale
            <select class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" [(ngModel)]="draft.locale" name="loc">
              <option value="sl">sl</option>
              <option value="en">en</option>
              <option value="hr">hr</option>
            </select>
          </label>
        </div>
        <label class="block text-sm text-zinc-300">
          Meta title
          <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5" [(ngModel)]="draft.metaTitle" name="mt" />
        </label>
        <label class="block text-sm text-zinc-300">
          Meta description
          <textarea class="mt-1 min-h-[72px] w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-sm" [(ngModel)]="draft.metaDescription" name="md"></textarea>
        </label>
        <label class="flex items-center gap-2 text-sm text-zinc-300">
          <input type="checkbox" [(ngModel)]="draft.noindex" name="ni" /> noindex
        </label>
        <button type="button" class="dib-btn text-sm" [disabled]="busy" (click)="upsert()">{{ busy ? 'Saving…' : 'Upsert' }}</button>
      </div>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngIf="rows.length" class="mt-8 overflow-x-auto rounded-xl border border-white/10">
        <table class="w-full text-left text-sm">
          <thead class="border-b border-white/10 bg-ink-900/80 text-xs uppercase tracking-widest text-zinc-500">
            <tr>
              <th class="px-3 py-2">Route</th>
              <th class="px-3 py-2">Locale</th>
              <th class="px-3 py-2">Meta title</th>
              <th class="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let r of rows" class="border-b border-white/5">
              <td class="px-3 py-2 font-mono text-xs">{{ r.routeKey }}</td>
              <td class="px-3 py-2">{{ r.locale }}</td>
              <td class="max-w-xs truncate px-3 py-2 text-zinc-400">{{ r.metaTitle }}</td>
              <td class="px-3 py-2 text-right">
                <button type="button" class="text-gold-400 hover:underline" (click)="pick(r)">Edit</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminSeoPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: SeoRow[] = [];
  err = '';
  busy = false;
  draft: SeoDraft = {
    routeKey: '',
    locale: 'sl',
    metaTitle: '',
    metaDescription: '',
    noindex: false,
  };

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.seoEntries().subscribe({
      next: (list) => (this.rows = list as SeoRow[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load'),
    });
  }

  pick(r: SeoRow) {
    this.draft = {
      routeKey: r.routeKey,
      locale: r.locale,
      metaTitle: r.metaTitle ?? '',
      metaDescription: r.metaDescription ?? '',
      noindex: !!r.noindex,
    };
  }

  upsert() {
    this.busy = true;
    this.err = '';
    const d = this.draft;
    this.api
      .upsertSeoEntry({
        routeKey: String(d.routeKey),
        locale: d.locale,
        metaTitle: d.metaTitle || undefined,
        metaDescription: d.metaDescription || undefined,
        noindex: d.noindex ? true : false,
      })
      .subscribe({
        next: () => {
          this.busy = false;
          this.load();
        },
        error: (e) => {
          this.err = e?.error?.message ?? 'Upsert failed';
          this.busy = false;
        },
      });
  }
}
