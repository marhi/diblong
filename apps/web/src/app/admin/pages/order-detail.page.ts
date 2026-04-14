import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AdminApiService } from '../admin-api.service';

const STATUSES = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELED'] as const;

type OrderDetail = {
  id: string;
  status: string;
  total: unknown;
  subtotal: unknown;
  shippingTotal: unknown;
  guestEmail?: string | null;
  adminNotes?: string | null;
  user?: { email: string } | null;
  items: { titleSnapshot: string; qty: number; unitPrice: unknown }[];
};

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule, RouterLink],
  template: `
    <ng-container *ngIf="order">
      <a class="text-sm text-zinc-500 hover:text-gold-300" routerLink="/admin/orders">← Orders</a>
      <h1 class="mt-4 font-display text-3xl text-gold-200">Order {{ order.id.slice(0, 8) }}…</h1>
      <div class="mt-6 grid gap-6 lg:grid-cols-2">
        <div class="dib-card space-y-4 p-6">
          <div class="text-sm text-zinc-400">
            <div>Customer: {{ order.user?.email || order.guestEmail || '—' }}</div>
            <div class="mt-2">Subtotal: € {{ order.subtotal }} · Shipping: € {{ order.shippingTotal }}</div>
            <div class="mt-2 text-lg text-gold-200">Total: € {{ order.total }}</div>
          </div>
          <label class="block text-sm text-zinc-300">
            Status
            <select
              class="mt-1 w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2"
              [(ngModel)]="status"
              name="status"
            >
              <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
            </select>
          </label>
          <button type="button" class="dib-btn text-sm" [disabled]="saving" (click)="saveStatus()">
            {{ saving ? 'Saving…' : 'Update status' }}
          </button>
        </div>
        <div class="dib-card space-y-4 p-6">
          <label class="block text-sm text-zinc-300">
            Internal notes
            <textarea
              class="mt-1 min-h-[120px] w-full rounded-xl border border-white/10 bg-ink-950 px-3 py-2 font-mono text-xs"
              [(ngModel)]="notes"
              name="notes"
            ></textarea>
          </label>
          <button type="button" class="dib-btn text-sm" [disabled]="savingNotes" (click)="saveNotes()">
            {{ savingNotes ? 'Saving…' : 'Save notes' }}
          </button>
        </div>
      </div>
      <div class="mt-8 dib-card p-6">
        <h2 class="font-display text-xl text-zinc-200">Lines</h2>
        <ul class="mt-4 divide-y divide-white/5 text-sm">
          <li *ngFor="let line of order.items" class="flex justify-between py-2">
            <span>{{ line.titleSnapshot }} × {{ line.qty }}</span>
            <span class="text-zinc-400">€ {{ line.unitPrice }}</span>
          </li>
        </ul>
      </div>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
    </ng-container>
  `,
})
export class AdminOrderDetailPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);
  order: OrderDetail | null = null;
  status = '';
  notes = '';
  statuses = [...STATUSES];
  err = '';
  saving = false;
  savingNotes = false;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.api.order(id).subscribe({
      next: (raw) => {
        this.order = raw as OrderDetail;
        this.status = this.order.status;
        this.notes = this.order.adminNotes ?? '';
      },
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load order'),
    });
  }

  saveStatus() {
    if (!this.order) return;
    this.saving = true;
    this.err = '';
    this.api.patchOrderStatus(this.order.id, this.status).subscribe({
      next: (o) => {
        this.order = o as OrderDetail;
        this.saving = false;
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Update failed';
        this.saving = false;
      },
    });
  }

  saveNotes() {
    if (!this.order) return;
    this.savingNotes = true;
    this.err = '';
    this.api.patchOrderNotes(this.order.id, this.notes).subscribe({
      next: (o) => {
        this.order = o as OrderDetail;
        this.savingNotes = false;
      },
      error: (e) => {
        this.err = e?.error?.message ?? 'Notes failed';
        this.savingNotes = false;
      },
    });
  }
}
