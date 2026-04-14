import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private base() {
    return (
      this.config.get<string>('PUBLIC_WEB_URL') ??
      this.config.get<string>('WEB_ORIGIN') ??
      'http://localhost:4200'
    ).replace(/\/$/, '');
  }

  async sitemapXml(): Promise<string> {
    const base = this.base();
    const urls: { loc: string; hreflang?: { lang: string; href: string }[] }[] =
      [];
    const products = await this.prisma.productTranslation.findMany({
      where: { product: { isActive: true } },
      select: { productId: true, locale: true, slug: true, canonicalPath: true },
    });
    const segment = (loc: string) => {
      if (loc === 'sl') return 'izdelek';
      if (loc === 'en') return 'product';
      return 'proizvod';
    };
    const byProduct = new Map<string, { locale: string; path: string }[]>();
    for (const p of products) {
      const path =
        p.canonicalPath ??
        `/${p.locale}/${segment(p.locale)}/${p.slug}`;
      const arr = byProduct.get(p.productId) ?? [];
      arr.push({ locale: p.locale, path });
      byProduct.set(p.productId, arr);
    }
    for (const group of byProduct.values()) {
      const defaultSl = group.find((g) => g.locale === 'sl') ?? group[0];
      const loc = `${base}${defaultSl.path}`;
      const hreflang = group.map((g) => ({
        lang: g.locale,
        href: `${base}${g.path}`,
      }));
      urls.push({ loc, hreflang });
    }
    const categories = await this.prisma.categoryTranslation.findMany({
      where: { category: { isActive: true } },
      select: { categoryId: true, locale: true, slug: true, canonicalPath: true },
    });
    const catSeg = (loc: string) => {
      if (loc === 'en') return 'category';
      return 'kategorija';
    };
    const byCat = new Map<string, { locale: string; path: string }[]>();
    for (const c of categories) {
      const path =
        c.canonicalPath ?? `/${c.locale}/${catSeg(c.locale)}/${c.slug}`;
      const arr = byCat.get(c.categoryId) ?? [];
      arr.push({ locale: c.locale, path });
      byCat.set(c.categoryId, arr);
    }
    for (const group of byCat.values()) {
      const defaultSl = group.find((g) => g.locale === 'sl') ?? group[0];
      urls.push({
        loc: `${base}${defaultSl.path}`,
        hreflang: group.map((g) => ({
          lang: g.locale,
          href: `${base}${g.path}`,
        })),
      });
    }
    const pages = await this.prisma.pageTranslation.findMany({
      select: { pageId: true, locale: true, slug: true, canonicalPath: true },
    });
    const byPage = new Map<string, { locale: string; path: string }[]>();
    for (const p of pages) {
      const path = p.canonicalPath ?? `/${p.locale}/${p.slug}`;
      const arr = byPage.get(p.pageId) ?? [];
      arr.push({ locale: p.locale, path });
      byPage.set(p.pageId, arr);
    }
    for (const group of byPage.values()) {
      const defaultSl = group.find((g) => g.locale === 'sl') ?? group[0];
      urls.push({
        loc: `${base}${defaultSl.path}`,
        hreflang: group.map((g) => ({
          lang: g.locale,
          href: `${base}${g.path}`,
        })),
      });
    }
    const body = urls
      .map((u) => {
        const alt = (u.hreflang ?? [])
          .map(
            (h) =>
              `    <xhtml:link rel="alternate" hreflang="${h.lang}" href="${this.escape(h.href)}" />`,
          )
          .join('\n');
        return `  <url>\n    <loc>${this.escape(u.loc)}</loc>\n${alt}\n  </url>`;
      })
      .join('\n');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>`;
  }

  robotsTxt(): string {
    const base = this.base();
    return [
      'User-agent: *',
      'Disallow: /api/',
      `Sitemap: ${base}/sitemap.xml`,
      '',
    ].join('\n');
  }

  private escape(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
