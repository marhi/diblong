import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import type { Lang } from '../core/store-paths';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  setPage(opts: {
    title: string;
    description?: string;
    canonicalPath?: string;
    ogImage?: string;
    hreflangs?: { lang: Lang; path: string }[];
  }) {
    this.title.setTitle(opts.title);
    if (opts.description) {
      this.meta.updateTag({ name: 'description', content: opts.description });
      this.meta.updateTag({ property: 'og:description', content: opts.description });
    }
    this.meta.updateTag({ property: 'og:title', content: opts.title });
    if (opts.ogImage) {
      this.meta.updateTag({ property: 'og:image', content: opts.ogImage });
    }
    const base = environment.siteUrl.replace(/\/$/, '');
    if (opts.canonicalPath) {
      const href = `${base}${opts.canonicalPath}`;
      this.setOrReplaceLink('canonical', href);
    }
    this.clearHreflangs();
    const hreflangs = opts.hreflangs ?? [];
    if (hreflangs.length) {
      for (const h of hreflangs) {
        const link = this.doc.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', h.lang);
        link.setAttribute('href', `${base}${h.path}`);
        this.doc.head.appendChild(link);
      }
      const xdef = this.doc.createElement('link');
      xdef.setAttribute('rel', 'alternate');
      xdef.setAttribute('hreflang', 'x-default');
      xdef.setAttribute(
        'href',
        `${base}${hreflangs.find((x) => x.lang === 'sl')?.path ?? opts.canonicalPath ?? '/'}`,
      );
      this.doc.head.appendChild(xdef);
    }
  }

  setJsonLd(json: unknown) {
    const id = 'diblong-jsonld';
    this.doc.getElementById(id)?.remove();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.text = JSON.stringify(json);
    this.doc.head.appendChild(script);
  }

  clearJsonLd() {
    this.doc.getElementById('diblong-jsonld')?.remove();
  }

  private setOrReplaceLink(rel: string, href: string) {
    const selector = `link[rel="${rel}"]`;
    let link = this.doc.querySelector<HTMLLinkElement>(selector);
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', rel);
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  private clearHreflangs() {
    this.doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((n) => n.remove());
  }
}
