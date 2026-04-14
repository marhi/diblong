import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '../admin-api.service';

type RoleWrap = { role: { name: string } };
type UserRow = {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  isActive: boolean;
  roles: RoleWrap[];
};

const ALL_ROLES = ['ADMIN', 'STAFF', 'CUSTOMER'] as const;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div>
      <h1 class="font-display text-3xl text-gold-200">Users</h1>
      <p class="mt-2 text-sm text-zinc-500">Admin-only. Role changes replace the full role set.</p>
      <p *ngIf="err" class="mt-4 text-sm text-red-300">{{ err }}</p>
      <div *ngIf="rows.length" class="mt-6 space-y-6">
        <div *ngFor="let u of rows" class="dib-card space-y-4 p-6">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div class="font-medium text-zinc-100">{{ u.email }}</div>
              <div class="text-sm text-zinc-500">{{ u.firstName }} {{ u.lastName }}</div>
            </div>
            <label class="flex items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" [(ngModel)]="u.isActive" [ngModelOptions]="{ standalone: true }" (change)="toggleActive(u)" />
              Active
            </label>
          </div>
          <div class="flex flex-wrap gap-4 text-sm">
            <label *ngFor="let r of allRoles" class="flex items-center gap-2 text-zinc-400">
              <input
                type="checkbox"
                [checked]="hasRole(u, r)"
                (change)="setRole(u, r, $any($event.target).checked)"
              />
              {{ r }}
            </label>
          </div>
          <button type="button" class="dib-btn !py-1.5 !px-4 text-xs" (click)="saveRoles(u)">Save roles</button>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersPageComponent implements OnInit {
  private readonly api = inject(AdminApiService);
  rows: UserRow[] = [];
  err = '';
  readonly allRoles = [...ALL_ROLES];
  private draftRoles = new Map<string, Set<string>>();

  ngOnInit() {
    this.load();
  }

  load() {
    this.api.users().subscribe({
      next: (list) => {
        this.rows = (list as UserRow[]).map((u) => ({ ...u }));
        this.draftRoles.clear();
        for (const u of this.rows) {
          this.draftRoles.set(u.id, new Set(u.roles.map((x) => x.role.name)));
        }
      },
      error: (e) => (this.err = e?.error?.message ?? 'Failed to load users (ADMIN only).'),
    });
  }

  hasRole(u: UserRow, r: string) {
    return this.draftRoles.get(u.id)?.has(r) ?? false;
  }

  setRole(u: UserRow, r: string, on: boolean) {
    const s = this.draftRoles.get(u.id) ?? new Set();
    if (on) s.add(r);
    else s.delete(r);
    this.draftRoles.set(u.id, s);
  }

  saveRoles(u: UserRow) {
    const roles = [...(this.draftRoles.get(u.id) ?? new Set())];
    if (!roles.length) {
      this.err = 'Select at least one role.';
      return;
    }
    this.err = '';
    this.api.patchUserRoles(u.id, roles).subscribe({
      next: (updated) => {
        const row = updated as UserRow;
        this.draftRoles.set(row.id, new Set(row.roles.map((x) => x.role.name)));
        const ix = this.rows.findIndex((x) => x.id === u.id);
        if (ix >= 0) this.rows[ix] = row;
      },
      error: (e) => (this.err = e?.error?.message ?? 'Role update failed'),
    });
  }

  toggleActive(u: UserRow) {
    this.api.patchUser(u.id, { isActive: u.isActive }).subscribe({
      error: () => {
        u.isActive = !u.isActive;
        this.err = 'Could not update active flag';
      },
    });
  }
}
