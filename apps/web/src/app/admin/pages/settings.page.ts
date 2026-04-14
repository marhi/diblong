import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';

type SettingRow = { key: string; value: unknown };

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Site settings</h1>
      <p class="mt-2 text-sm text-zinc-500">Admin only. Values are JSON objects — invalid JSON will be rejected by the API.</p>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngFor="let s of rows" class="mt-6 dib-card space-y-3 p-6">
        <div class="font-mono text-sm text-gold-200/90">{{ s.key }}</div>
        <textarea
          class="min-h-[120px] w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs"
          [(ngModel)]="text[s.key]"
          [name]="'json'+s.key"
        ></textarea>
        <button type="button" class="dib-btn !py-1.5 !px-4 text-xs" [disabled]="saving === s.key" (click)="save(s.key)">
          {{ saving === s.key ? 'Saving…' : 'Save' }}
        </button>
      </div>
    </div>
  `,
})
export class AdminSettingsPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: SettingRow[] = [];
  text: Record<string, string> = {};
  err = '';
  saving: string | null = null;

  ngOnInit() {
    this.api.settings().subscribe({
      next: (list) => {
        this.rows = list as SettingRow[];
        for (const s of this.rows) {
          this.text[s.key] = JSON.stringify(s.value, null, 2);
        }
      },
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load settings'),
    });
  }

  save(key: string) {
    let value: Record<string, unknown>;
    try {
      value = JSON.parse(this.text[key] ?? '{}') as Record<string, unknown>;
    } catch {
      this.err = 'Invalid JSON for ' + key;
      return;
    }
    this.saving = key;
    this.err = '';
    this.api.patchSetting(key, value).subscribe({
      next: (row) => {
        const r = row as SettingRow;
        const ix = this.rows.findIndex((x) => x.key === key);
        if (ix >= 0) this.rows[ix] = r;
        this.text[key] = JSON.stringify(r.value, null, 2);
        this.saving = null;
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Save failed';
        this.saving = null;
      },
    });
  }
}
