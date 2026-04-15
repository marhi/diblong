import { DecimalPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { readLang, readPaths } from '../../core/route-helpers';
import { environment } from '../../../environments/environment';
import { ApiService } from '../../services/api.service';
import { SeoService } from '../../services/seo.service';
import type { Lang } from '../../core/store-paths';

type Banner = {
  translations: { headline: string; subline?: string; ctaLabel?: string; ctaPath?: string }[];
  image?: { storedPath?: string | null; sourceUrl?: string | null };
};

type ProductCard = {
  id: string;
  price: string | number;
  translations: { title: string; slug: string; shortDescription?: string }[];
  images: { media: { storedPath?: string | null; sourceUrl?: string | null } }[];
};

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, DecimalPipe],
  template: `
    <section class="relative overflow-hidden border-b border-white/5">
      <div class="dib-container py-20 md:py-28">
        <div class="max-w-3xl">
          <p class="text-xs uppercase tracking-[0.35em] text-gold-400">Digo</p>
          <h1 class="mt-4 font-display text-4xl leading-tight text-zinc-50 md:text-6xl">
            {{ heroTitle }}
          </h1>
          <p class="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400 md:text-base">
            {{ heroBody }}
          </p>
          <div class="mt-10 flex flex-wrap gap-3">
            <a class="dib-btn" [routerLink]="['/', lang, paths.shop]">{{ heroCta }}</a>
            <a class="dib-btn-ghost" [routerLink]="['/', lang, paths.about]">{{ heroSecondary }}</a>
          </div>
        </div>
      </div>
    </section>

    <section *ngIf="banners.length" class="dib-container py-14">
      <div class="dib-card overflow-hidden">
        <div *ngFor="let b of banners" class="grid gap-0 md:grid-cols-2">
          <div class="relative min-h-[240px] bg-ink-850">
            <img
              *ngIf="bannerImage(b)"
              class="h-full w-full object-cover opacity-90"
              [src]="bannerImage(b)!"
              alt=""
            />
          </div>
          <div class="flex flex-col justify-center p-10">
            <h2 class="font-display text-3xl text-gold-200">{{ b.translations[0]?.headline }}</h2>
            <p class="mt-3 text-sm text-zinc-400">{{ b.translations[0]?.subline }}</p>
            <a
              *ngIf="b.translations[0]?.ctaPath"
              class="dib-btn mt-8 w-fit"
              [routerLink]="linkFromPath(b.translations[0]?.ctaPath)"
              >{{ b.translations[0]?.ctaLabel }}</a
            >
          </div>
        </div>
      </div>
    </section>

    <section class="dib-container py-16">
      <div class="flex items-end justify-between gap-6">
        <div>
          <p class="text-xs uppercase tracking-[0.35em] text-gold-400">{{ featuredLabel }}</p>
          <h2 class="mt-2 font-display text-3xl text-zinc-50">{{ featuredTitle }}</h2>
        </div>
        <a class="dib-btn-ghost" [routerLink]="['/', lang, paths.shop]">{{ viewAll }}</a>
      </div>
      <div class="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <a
          *ngFor="let p of featured"
          class="dib-card group block overflow-hidden transition duration-300 ease-lux hover:-translate-y-1 hover:shadow-glow"
          [routerLink]="['/', lang, paths.product, p.translations[0]?.slug]"
        >
          <div class="relative aspect-[4/5] overflow-hidden bg-ink-850">
            <img *ngIf="cardImage(p)" class="h-full w-full object-cover transition duration-700 group-hover:scale-105" [src]="cardImage(p)!" [alt]="p.translations[0]?.title" />
          </div>
          <div class="p-5">
            <div class="text-xs uppercase tracking-[0.25em] text-zinc-500">Digo</div>
            <div class="mt-2 font-display text-xl text-zinc-100">{{ p.translations[0]?.title }}</div>
            <p class="mt-2 line-clamp-2 text-sm text-zinc-400">{{ p.translations[0]?.shortDescription }}</p>
            <div class="mt-4 text-sm text-gold-300">€ {{ p.price | number : '1.2-2' }}</div>
          </div>
        </a>
      </div>
    </section>
  `,
})
export class HomePageComponent {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);
  private readonly route = inject(ActivatedRoute);
  readonly lang: Lang = readLang(this.route);
  readonly paths = readPaths(this.route);
  banners: Banner[] = [];
  featured: ProductCard[] = [];
  heroTitle = '';
  heroBody = '';
  heroCta = '';
  heroSecondary = '';
  featuredLabel = '';
  featuredTitle = '';
  viewAll = '';

  linkFromPath(p?: string) {
    if (!p) return '/';
    return p.split('/').filter(Boolean);
  }

  constructor() {
    const copy = HOME_COPY[this.lang];
    this.heroTitle = copy.heroTitle;
    this.heroBody = copy.heroBody;
    this.heroCta = copy.heroCta;
    this.heroSecondary = copy.heroSecondary;
    this.featuredLabel = copy.featuredLabel;
    this.featuredTitle = copy.featuredTitle;
    this.viewAll = copy.viewAll;
    this.seo.setPage({
      title: copy.metaTitle,
      description: copy.metaDescription,
      canonicalPath: `/${this.lang}`,
    });
    this.api.banners(this.lang).subscribe((b) => (this.banners = (b as Banner[]) ?? []));
    this.api
      .products(this.lang, { featured: true, take: 6 })
      .subscribe((res) => {
        const r = res as { items?: ProductCard[] };
        this.featured = r.items ?? [];
      });
  }

  bannerImage(b: Banner) {
    const m = b.image;
    const path = m?.storedPath;
    if (path) {
      return path.startsWith('http') ? path : `${environment.apiOrigin}${path}`;
    }
    return m?.sourceUrl ?? null;
  }

  cardImage(p: ProductCard) {
    const m = p.images?.[0]?.media;
    const path = m?.storedPath;
    if (path) {
      return path.startsWith('http') ? path : `${environment.apiOrigin}${path}`;
    }
    return m?.sourceUrl ?? null;
  }
}

const HOME_COPY: Record<
  Lang,
  {
    heroTitle: string;
    heroBody: string;
    heroCta: string;
    heroSecondary: string;
    featuredLabel: string;
    featuredTitle: string;
    viewAll: string;
    metaTitle: string;
    metaDescription: string;
  }
> = {
  sl: {
    heroTitle: 'Intimna dobrobit, oblikovana z okusom.',
    heroBody:
      'Digo zdručuje zeliščno tradicijo in sodobno eleganco. Izbrana linija za zrelo, diskretno in premično izkušnjo.',
    heroCta: 'Razišči trgovino',
    heroSecondary: 'Zgodba znamke',
    featuredLabel: 'Izpostavljeno',
    featuredTitle: 'Izbrane reference',
    viewAll: 'Vse izdelke',
    metaTitle: 'Digo — premium intimna nega',
    metaDescription:
      'Večjezična spletna trgovina Digo: zeliščni rituali nege, diskretna dostava in skrbna podpora.',
  },
  en: {
    heroTitle: 'Intimate wellness, composed with taste.',
    heroBody:
      'Digo bridges herbal tradition and modern elegance — a curated line for discreet, premium daily rituals.',
    heroCta: 'Explore the shop',
    heroSecondary: 'Brand story',
    featuredLabel: 'Featured',
    featuredTitle: 'Signature selections',
    viewAll: 'View all',
    metaTitle: 'Digo — premium intimate care',
    metaDescription:
      'Multilingual Digo boutique: herbal rituals, discreet shipping, and attentive client care.',
  },
  hr: {
    heroTitle: 'Intimna dobrobit, oblikovana s okusom.',
    heroBody:
      'Digo spaja biljnu tradiciju i suvremenu elegancu — odabrana linija za diskretan, premium ritual.',
    heroCta: 'Istraži trgovinu',
    heroSecondary: 'Priča brenda',
    featuredLabel: 'Istaknuto',
    featuredTitle: 'Odabrane reference',
    viewAll: 'Svi proizvodi',
    metaTitle: 'Digo — premium intimna njega',
    metaDescription:
      'Višejezična trgovina Digo: biljni rituali, diskretna dostava i pažljiva podrška.',
  },
};
