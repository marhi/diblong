import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';

type Rate = { id: string; flatRate: unknown; freeShippingThreshold: unknown | null };
type Country = { id: string; code: string; notesSl?: string | null; notesEn?: string | null; notesHr?: string | null };
type Zone = { id: string; name: string; countries: Country[]; rates: Rate[] };

@Component({
  selector: 'app-admin-shipping',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Shipping</h1>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngFor="let z of zones" class="mt-8 dib-card p-6">
        <h2 class="font-display text-xl text-zinc-200">{{ z.name }}</h2>
        <div class="mt-4 grid gap-6 lg:grid-cols-2">
          <div>
            <h3 class="text-xs uppercase tracking-widest text-zinc-500">Rates</h3>
            <div *ngFor="let r of z.rates" class="mt-3 space-y-2 rounded-lg border border-white/5 p-3">
              <div class="text-xs text-zinc-500">ID {{ r.id.slice(0, 8) }}…</div>
              <label class="block text-sm text-zinc-300">
                Flat (EUR)
                <input class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-sm" type="number" step="0.01" [(ngModel)]="rateDraft[r.id].flat" name="fl{{ r.id }}" />
              </label>
              <label class="block text-sm text-zinc-300">
                Free threshold (empty = none)
                <input
                  class="mt-1 w-full rounded-lg border border-white/10 bg-ink-950 px-2 py-1.5 text-sm"
                  type="number"
                  step="0.01"
                  [(ngModel)]="rateDraft[r.id].threshold"
                  name="th{{ r.id }}"
                />
              </label>
              <button type="button" class="dib-btn !py-1 !px-3 text-xs" (click)="saveRate(r.id)">Save rate</button>
            </div>
          </div>
          <div>
            <h3 class="text-xs uppercase tracking-widest text-zinc-500">Countries (notes)</h3>
            <div *ngFor="let c of z.countries" class="mt-3 space-y-2 rounded-lg border border-white/5 p-3">
              <div class="font-mono text-sm text-gold-200/80">{{ c.code }}</div>
              <input class="w-full rounded border border-white/10 bg-ink-950 px-2 py-1 text-xs" [(ngModel)]="countryDraft[c.id].notesSl" placeholder="SL" [name]="'sl'+c.id" />
              <input class="w-full rounded border border-white/10 bg-ink-950 px-2 py-1 text-xs" [(ngModel)]="countryDraft[c.id].notesEn" placeholder="EN" [name]="'en'+c.id" />
              <input class="w-full rounded border border-white/10 bg-ink-950 px-2 py-1 text-xs" [(ngModel)]="countryDraft[c.id].notesHr" placeholder="HR" [name]="'hr'+c.id" />
              <button type="button" class="dib-btn !py-1 !px-3 text-xs" (click)="saveCountry(c.id)">Save country</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminShippingPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  zones: Zone[] = [];
  rateDraft: Record<string, { flat: number; threshold: string }> = {};
  countryDraft: Record<string, { notesSl: string; notesEn: string; notesHr: string }> = {};
  err = '';

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.shippingTree().subscribe({
      next: (tree) => {
        this.zones = tree as Zone[];
        this.rateDraft = {};
        this.countryDraft = {};
        for (const z of this.zones) {
          for (const r of z.rates) {
            this.rateDraft[r.id] = {
              flat: Number(r.flatRate),
              threshold: r.freeShippingThreshold != null ? String(r.freeShippingThreshold) : '',
            };
          }
          for (const c of z.countries) {
            this.countryDraft[c.id] = {
              notesSl: c.notesSl ?? '',
              notesEn: c.notesEn ?? '',
              notesHr: c.notesHr ?? '',
            };
          }
        }
      },
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load shipping'),
    });
  }

  saveRate(id: string) {
    const d = this.rateDraft[id];
    const body: Record<string, unknown> = { flatRate: d.flat };
    body['freeShippingThreshold'] = d.threshold === '' ? null : Number(d.threshold);
    this.api.patchShippingRate(id, body).subscribe({ next: () => this.load(), error: (e) => (this.err = e?.error?.message ?? 'Save failed') });
  }

  saveCountry(id: string) {
    const d = this.countryDraft[id];
    this.api.patchShippingCountry(id, { notesSl: d.notesSl, notesEn: d.notesEn, notesHr: d.notesHr }).subscribe({
      next: () => this.load(),
      error: (e) => (this.err = e?.error?.message ?? 'Save failed'),
    });
  }
}
