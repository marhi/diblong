import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet, ActivatedRoute } from '@angular/router';
import type { Lang } from '../core/store-paths';
import { readLang, readPaths } from '../core/route-helpers';

@Component({
  selector: 'app-store-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgFor],
  template: `
    <div class="min-h-screen flex flex-col">
      <header class="border-b border-white/5 bg-ink-950/70 backdrop-blur">
        <div class="dib-container flex items-center justify-between py-4">
          <a [routerLink]="['/', lang]" class="font-display text-2xl tracking-[0.2em] text-gold-300">
            DIBLONG
          </a>
          <nav class="hidden md:flex items-center gap-6 text-sm text-zinc-300">
            <a class="hover:text-gold-300" [routerLink]="['/', lang]">{{ ui.home }}</a>
            <a class="hover:text-gold-300" [routerLink]="['/', lang, paths.shop]">{{ ui.shop }}</a>
            <a class="hover:text-gold-300" [routerLink]="['/', lang, paths.about]">{{ ui.about }}</a>
            <a class="hover:text-gold-300" [routerLink]="['/', lang, paths.contact]">{{ ui.contact }}</a>
            <a class="dib-btn-ghost" [routerLink]="['/', lang, paths.cart]">{{ ui.cart }}</a>
          </nav>
          <div class="flex items-center gap-2">
            <a
              *ngFor="let l of langs"
              class="rounded-full px-2 py-1 text-xs uppercase tracking-widest"
              [class.text-gold-300]="l === lang"
              [class.text-zinc-500]="l !== lang"
              [routerLink]="['/', l]"
              [hreflang]="l"
              >{{ l }}</a
            >
          </div>
        </div>
      </header>
      <main class="flex-1">
        <router-outlet />
      </main>
      <footer class="border-t border-white/5 py-10 text-sm text-zinc-500">
        <div class="dib-container grid gap-6 md:grid-cols-3">
          <div>
            <div class="font-display text-lg text-gold-300">Diblong</div>
            <p class="mt-2 max-w-xs">{{ ui.footer }}</p>
          </div>
          <div class="space-y-2">
            <a class="block hover:text-gold-300" [routerLink]="['/', lang, paths.shipping]">{{ ui.shipping }}</a>
            <a class="block hover:text-gold-300" [routerLink]="['/', lang, paths.privacy]">{{ ui.privacy }}</a>
            <a class="block hover:text-gold-300" [routerLink]="['/', lang, paths.terms]">{{ ui.terms }}</a>
          </div>
          <div class="space-y-2">
            <div class="text-xs uppercase tracking-[0.3em] text-zinc-400">{{ ui.trust }}</div>
            <p>{{ ui.trustBody }}</p>
          </div>
        </div>
      </footer>
    </div>
  `,
})
export class StoreShellComponent {
  private readonly route = inject(ActivatedRoute);
  readonly lang = readLang(this.route) satisfies Lang;
  readonly paths = readPaths(this.route);
  readonly langs: Lang[] = ['sl', 'en', 'hr'];
  readonly ui = UI[this.lang];
}

const UI: Record<
  Lang,
  {
    home: string;
    shop: string;
    about: string;
    contact: string;
    cart: string;
    footer: string;
    shipping: string;
    privacy: string;
    terms: string;
    trust: string;
    trustBody: string;
  }
> = {
  sl: {
    home: 'Domov',
    shop: 'Trgovina',
    about: 'O znamki',
    contact: 'Kontakt',
    cart: 'Košarica',
    footer: 'Premium intimna dobrobit — diskretno, elegantno, zrelo.',
    shipping: 'Dostava',
    privacy: 'Zasebnost',
    terms: 'Pogoji',
    trust: 'Zaupanje',
    trustBody: 'Diskretna pošiljka · Varen nakup · Podpora strankam',
  },
  en: {
    home: 'Home',
    shop: 'Shop',
    about: 'About',
    contact: 'Contact',
    cart: 'Cart',
    footer: 'Premium intimate wellness — discreet, elegant, composed.',
    shipping: 'Shipping',
    privacy: 'Privacy',
    terms: 'Terms',
    trust: 'Trust',
    trustBody: 'Discreet shipping · Secure checkout · Customer care',
  },
  hr: {
    home: 'Početna',
    shop: 'Trgovina',
    about: 'O brendu',
    contact: 'Kontakt',
    cart: 'Košarica',
    footer: 'Premium intimna dobrobit — diskretno, elegantno, zrelo.',
    shipping: 'Dostava',
    privacy: 'Privatnost',
    terms: 'Uvjeti',
    trust: 'Povjerenje',
    trustBody: 'Diskretna dostava · Sigurna kupnja · Podrška kupcima',
  },
};
