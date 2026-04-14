import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import type { Lang } from '../core/store-paths';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiBaseUrl;

  categories(lang: Lang) {
    return this.http.get<unknown[]>(`${this.base}/store/${lang}/categories`);
  }

  category(lang: Lang, slug: string) {
    return this.http.get<unknown>(`${this.base}/store/${lang}/categories/${slug}`);
  }

  products(
    lang: Lang,
    params: Record<string, string | number | boolean | undefined>,
  ) {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === false || v === '') return;
      httpParams = httpParams.set(k, String(v));
    });
    return this.http.get<unknown>(`${this.base}/store/${lang}/products`, {
      params: httpParams,
    });
  }

  product(lang: Lang, slug: string) {
    return this.http.get<unknown>(`${this.base}/store/${lang}/products/${slug}`);
  }

  suggest(lang: Lang, q: string) {
    return this.http.get<unknown[]>(`${this.base}/store/${lang}/search/suggest`, {
      params: { q },
    });
  }

  page(lang: Lang, slug: string) {
    return this.http.get<unknown>(`${this.base}/store/${lang}/pages/${slug}`);
  }

  banners(lang: Lang) {
    return this.http.get<unknown[]>(`${this.base}/store/${lang}/promos/banners`);
  }

  createCart() {
    return this.http.post<{ id: string; guestToken: string }>(`${this.base}/cart`, {});
  }

  getCart(id: string, guestToken: string) {
    return this.http.get<unknown>(`${this.base}/cart/${id}`, {
      params: { guestToken },
    });
  }

  addCartItem(id: string, body: { productId: string; qty: number; guestToken: string }) {
    return this.http.post(`${this.base}/cart/${id}/items`, body);
  }

  shippingCountries() {
    return this.http.get<unknown[]>(`${this.base}/shipping/countries`);
  }

  checkout(body: unknown) {
    return this.http.post(`${this.base}/orders/checkout`, body);
  }
}
