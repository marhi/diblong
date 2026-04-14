import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { AdminApiService } from '../admin-api.service';

type MediaRow = { id: string; storedPath: string; mimeType?: string | null; fileName?: string | null };

@Component({
  selector: 'app-admin-media',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Media</h1>
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="dib-card space-y-4 p-6">
          <h2 class="text-sm font-medium text-zinc-200">Import from URL</h2>
          <input class="w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 text-sm" [(ngModel)]="importUrl" name="url" placeholder="https://…" />
          <button type="button" class="dib-btn text-sm" [disabled]="busy" (click)="doImport()">{{ busy ? 'Working…' : 'Import' }}</button>
        </div>
        <div class="dib-card space-y-4 p-6">
          <h2 class="text-sm font-medium text-zinc-200">Upload file</h2>
          <input type="file" (change)="onFile($event)" />
          <button type="button" class="dib-btn text-sm" [disabled]="busy || !file" (click)="doUpload()">Upload</button>
        </div>
      </div>
      <p *ngIf="msg" class="mt-4 text-sm text-emerald-300">{{ msg }}</p>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div class="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <figure *ngFor="let m of items" class="overflow-hidden rounded-xl border border-white/10 bg-ink-900/40">
          <img class="h-36 w-full object-cover" [src]="origin + m.storedPath" [alt]="m.fileName ?? ''" loading="lazy" />
          <figcaption class="p-2 font-mono text-[10px] text-zinc-500">{{ m.id.slice(0, 8) }}…</figcaption>
        </figure>
      </div>
    </div>
  `,
})
export class AdminMediaPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  readonly origin = environment.apiOrigin;
  items: MediaRow[] = [];
  importUrl = '';
  file: File | null = null;
  busy = false;
  err = '';
  msg = '';

  ngOnInit() {
    this.reload();
  }

  reload() {
    this.api.mediaList().subscribe({
      next: (list) => (this.items = list as MediaRow[]),
      error: (e) => (this.err = e?.error?.message ?? 'Failed to list media'),
    });
  }

  onFile(ev: Event) {
    const f = (ev.target as HTMLInputElement).files?.[0];
    this.file = f ?? null;
  }

  doImport() {
    if (!this.importUrl.trim()) return;
    this.busy = true;
    this.err = '';
    this.msg = '';
    this.api.importMediaUrl(this.importUrl.trim()).subscribe({
      next: () => {
        this.busy = false;
        this.msg = 'Imported.';
        this.importUrl = '';
        this.reload();
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Import failed';
        this.busy = false;
      },
    });
  }

  doUpload() {
    if (!this.file) return;
    this.busy = true;
    this.err = '';
    this.msg = '';
    this.api.uploadMedia(this.file).subscribe({
      next: () => {
        this.busy = false;
        this.msg = 'Uploaded.';
        this.file = null;
        this.reload();
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Upload failed';
        this.busy = false;
      },
    });
  }
}
